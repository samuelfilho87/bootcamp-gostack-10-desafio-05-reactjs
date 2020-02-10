/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { FaArrowAltCircleLeft, FaArrowAltCircleRight } from 'react-icons/fa';

import api from '../../services/api';

import Container from '../../components/Container';
import { Loading, Owner, IssuesList, Filter, NavPages } from './styles';

export default class Repository extends Component {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        repository: PropTypes.string,
      }),
    }).isRequired,
  };

  state = {
    repository: {},
    issues: [],
    loading: true,
    filter: 'open',
    filters: [
      { param: 'all', label: 'Tudo' },
      { param: 'closed', label: 'Fechadas' },
      { param: 'open', label: 'Abertas' },
    ],
    perPage: 5,
    page: 1,
  };

  async componentDidMount() {
    const { match } = this.props;

    const { filter } = this.state;

    const repoName = decodeURIComponent(match.params.repository);

    const [repository, issues] = await Promise.all([
      api.get(`repos/${repoName}`),
      api.get(`repos/${repoName}/issues`, {
        params: {
          state: filter,
          per_page: 5,
        },
      }),
    ]);

    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false,
    });
  }

  getIssues = async () => {
    const { match } = this.props;

    const { page, perPage, filter } = this.state;

    const repoName = decodeURIComponent(match.params.repository);

    const [repository, issues] = await Promise.all([
      api.get(`repos/${repoName}`),
      api.get(`repos/${repoName}/issues`, {
        params: {
          state: filter,
          per_page: perPage,
          page,
        },
      }),
    ]);

    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false,
    });
  };

  filterIssues = async e => {
    await this.setState({
      filter: e.target.value,
    });

    this.getIssues();
  };

  changePage = async somaPage => {
    const { page: actualPage } = this.state;

    await this.setState({ page: actualPage + somaPage });

    this.getIssues();
  };

  render() {
    const { repository, issues, loading, filter, filters, page } = this.state;

    if (loading) {
      return <Loading>Carregando</Loading>;
    }

    return (
      <Container>
        <Owner>
          <Link to="/">Voltar aos repositóros</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
        </Owner>

        <Filter>
          {filters.map(f => (
            <>
              <input
                key={f.param}
                type="radio"
                id={`${f.param}-issues`}
                value={f.param}
                checked={f.param === filter}
                onClick={this.filterIssues}
              />
              <label htmlFor={`${f.param}-issues`}>{f.label}</label>
            </>
          ))}
        </Filter>

        <IssuesList>
          {issues.map(issue => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  <a href={issue.html_url}>{issue.title}</a>
                  {issue.labels.map(label => (
                    <span key={String(label.id)}>{label.name}</span>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
        </IssuesList>

        <NavPages>
          <button
            type="button"
            onClick={() => this.changePage(-1)}
            disabled={page < 2}
          >
            <FaArrowAltCircleLeft color="#7159c1" size={24} />
          </button>

          <span>{page}</span>

          <button type="button" onClick={() => this.changePage(1)}>
            <FaArrowAltCircleRight color="#7159c1" size={24} />
          </button>
        </NavPages>
      </Container>
    );
  }
}
