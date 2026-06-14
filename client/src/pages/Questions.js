import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getQuestions, getCategories } from '../services/api';
import { timeAgo } from '../utils/formatDate';

const Questions = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const selectedCategory = searchParams.get('category') || '';
  const sortBy = searchParams.get('sort') || 'newest';

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, sortBy]);

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const params = { sort: sortBy };
      if (selectedCategory) params.category = selectedCategory;
      if (searchTerm) params.search = searchTerm;

      const data = await getQuestions(params);
      setQuestions(data.data);
      setError('');
    } catch (err) {
      setError('Failed to load questions. Make sure the server is running.');
      console.error('Error fetching questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchQuestions();
  };

  const setCategory = (categoryId) => {
    const params = new URLSearchParams(searchParams);
    if (categoryId) {
      params.set('category', categoryId);
    } else {
      params.delete('category');
    }
    setSearchParams(params);
  };

  const setSortBy = (value) => {
    const params = new URLSearchParams(searchParams);
    params.set('sort', value);
    setSearchParams(params);
  };

  const getVoteCount = (question) =>
    (question.upvotes?.length || 0) - (question.downvotes?.length || 0);

  const activeCategory = categories.find((cat) => cat._id === selectedCategory);

  if (loading && questions.length === 0) {
    return (
      <div className="questions-page">
        <div className="loading">Loading questions...</div>
      </div>
    );
  }

  return (
    <div className="questions-page">
      <div className="questions-header">
        <div>
          <h1>{activeCategory ? `${activeCategory.icon} ${activeCategory.name}` : 'All Questions'}</h1>
          <p className="subtitle">
            {activeCategory
              ? activeCategory.description
              : 'Ask questions and help others learn'}
          </p>
        </div>
        <Link to="/ask" className="btn btn-primary">
          Ask Question
        </Link>
      </div>

      <div className="questions-layout">
        <aside className="category-sidebar">
          <h3 className="sidebar-title">Categories</h3>
          <div className="category-menu">
            <button
              type="button"
              className={`category-menu-item ${selectedCategory === '' ? 'active' : ''}`}
              onClick={() => setCategory('')}
            >
              <span className="category-icon">📋</span>
              <span className="category-name">All Categories</span>
            </button>
            {categories.map((cat) => (
              <button
                type="button"
                key={cat._id}
                className={`category-menu-item ${selectedCategory === cat._id ? 'active' : ''}`}
                onClick={() => setCategory(cat._id)}
              >
                <span className="category-icon">{cat.icon}</span>
                <span className="category-name">{cat.name}</span>
              </button>
            ))}
          </div>
        </aside>

        <div className="questions-main">
          <div className="filters">
            <form onSubmit={handleSearch} className="search-form">
              <input
                type="text"
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="btn btn-primary">
                Search
              </button>
            </form>

            <div className="filter-group">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="filter-select"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="views">Most Views</option>
                <option value="votes">Most Votes</option>
              </select>
            </div>
          </div>

          {error && <div className="error">{error}</div>}

          {loading ? (
            <div className="loading">Updating...</div>
          ) : questions.length === 0 ? (
            <div className="empty-state">
              <p>No questions found.</p>
              <Link to="/ask" className="btn btn-primary">
                Ask the First Question
              </Link>
            </div>
          ) : (
            <div className="questions-list">
              {questions.map((question) => (
                <Link
                  to={`/questions/${question._id}`}
                  key={question._id}
                  className="question-item"
                >
                  <div className="question-stats">
                    <div className="stat">
                      <span className="stat-number">{getVoteCount(question)}</span>
                      <span className="stat-label">votes</span>
                    </div>
                    <div className={`stat ${question.isSolved ? 'solved' : ''}`}>
                      <span className="stat-number">{question.answers?.length || 0}</span>
                      <span className="stat-label">answers</span>
                    </div>
                    <div className="stat">
                      <span className="stat-number">{question.views}</span>
                      <span className="stat-label">views</span>
                    </div>
                  </div>

                  <div className="question-content">
                    <h3 className="question-title">
                      {question.title}
                      {question.isSolved && <span className="solved-badge">✓ Solved</span>}
                    </h3>
                    <p className="question-body">{question.body.substring(0, 150)}...</p>
                    <div className="question-meta">
                      {question.category && (
                        <span
                          className="category-badge"
                          style={{
                            backgroundColor: `${question.category.color}20`,
                            color: question.category.color,
                          }}
                        >
                          {question.category.icon} {question.category.name}
                        </span>
                      )}
                      {question.tags &&
                        question.tags.map((tag, index) => (
                          <span key={index} className="tag">
                            {tag}
                          </span>
                        ))}
                      <span className="author-info">
                        asked by <strong>{question.author?.username || 'Anonymous'}</strong>
                        <span className="date">{timeAgo(question.createdAt)}</span>
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Questions;
