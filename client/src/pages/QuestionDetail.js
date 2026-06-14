import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getQuestion, getAnswers, createAnswer, voteQuestion, voteAnswer, acceptAnswer, deleteQuestion, deleteAnswer } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { timeAgo } from '../utils/formatDate';

const QuestionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [answerBody, setAnswerBody] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchQuestion();
    fetchAnswers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchQuestion = async () => {
    try {
      const data = await getQuestion(id);
      setQuestion(data.data);
      setError('');
    } catch (err) {
      setError('Failed to load question');
      console.error('Error fetching question:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnswers = async () => {
    try {
      const data = await getAnswers(id);
      setAnswers(data.data);
    } catch (err) {
      console.error('Error fetching answers:', err);
    }
  };

  const handleVoteQuestion = async (vote) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      await voteQuestion(id, vote);
      fetchQuestion();
    } catch (err) {
      console.error('Error voting:', err);
    }
  };

  const handleVoteAnswer = async (answerId, vote) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      await voteAnswer(answerId, vote);
      fetchAnswers();
    } catch (err) {
      console.error('Error voting:', err);
    }
  };

  const handleAcceptAnswer = async (answerId) => {
    try {
      await acceptAnswer(answerId);
      fetchQuestion();
      fetchAnswers();
    } catch (err) {
      console.error('Error accepting answer:', err);
    }
  };

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!answerBody.trim()) {
      setError('Answer cannot be empty');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await createAnswer(id, { body: answerBody });
      setAnswerBody('');
      fetchAnswers();
    } catch (err) {
      setError('Failed to submit answer');
      console.error('Error submitting answer:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteQuestion = async () => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await deleteQuestion(id);
        navigate('/questions');
      } catch (err) {
        setError('Failed to delete question');
        console.error('Error deleting question:', err);
      }
    }
  };

  const handleDeleteAnswer = async (answerId) => {
    if (window.confirm('Are you sure you want to delete this answer?')) {
      try {
        await deleteAnswer(answerId);
        fetchAnswers();
      } catch (err) {
        setError('Failed to delete answer');
        console.error('Error deleting answer:', err);
      }
    }
  };

  const getVoteCount = (item) => {
    return (item.upvotes?.length || 0) - (item.downvotes?.length || 0);
  };

  const hasUserVoted = (item, voteType) => {
    if (!user) return false;
    const votes = voteType === 'up' ? item.upvotes : item.downvotes;
    return votes?.some(voterId => voterId === user.id);
  };

  if (loading) {
    return <div className="loading">Loading question...</div>;
  }

  if (!question) {
    return <div className="error">Question not found</div>;
  }

  const isQuestionOwner = user && question.author?._id === user.id;

  return (
    <div className="question-detail-page">
      <Link to="/questions" className="back-link">← Back to Questions</Link>

      {error && <div className="error">{error}</div>}

      <div className="question-detail">
        <div className="vote-section">
          <button
            onClick={() => handleVoteQuestion('up')}
            className={`vote-btn ${hasUserVoted(question, 'up') ? 'voted' : ''}`}
            disabled={!isAuthenticated}
          >
            ▲
          </button>
          <span className="vote-count">{getVoteCount(question)}</span>
          <button
            onClick={() => handleVoteQuestion('down')}
            className={`vote-btn ${hasUserVoted(question, 'down') ? 'voted' : ''}`}
            disabled={!isAuthenticated}
          >
            ▼
          </button>
        </div>

        <div className="question-main">
          <h1 className="question-title">
            {question.title}
            {question.isSolved && <span className="solved-badge">✓ Solved</span>}
          </h1>

          <div className="question-meta">
            <span>Asked by <strong>{question.author?.username || 'Anonymous'}</strong></span>
            <span>{timeAgo(question.createdAt)}</span>
            <span>{question.views} views</span>
          </div>

          <div className="question-body">
            <p>{question.body}</p>
          </div>

          <div className="question-footer">
            {question.category && (
              <span
                className="category-badge"
                style={{ backgroundColor: question.category.color + '20', color: question.category.color }}
              >
                {question.category.icon} {question.category.name}
              </span>
            )}
            {question.tags && question.tags.map((tag, index) => (
              <span key={index} className="tag">{tag}</span>
            ))}

            {isQuestionOwner && (
              <button onClick={handleDeleteQuestion} className="btn btn-danger btn-sm">
                Delete Question
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="answers-section">
        <h2>{answers.length} Answer{answers.length !== 1 ? 's' : ''}</h2>

        {answers.map((answer) => {
          const isAnswerOwner = user && answer.author?._id === user.id;
          const canAccept = isQuestionOwner && !question.isSolved;

          return (
            <div key={answer._id} className={`answer ${answer.isAccepted ? 'accepted' : ''}`}>
              {answer.isAccepted && <div className="accepted-label">✓ Accepted Answer</div>}

              <div className="vote-section">
                <button
                  onClick={() => handleVoteAnswer(answer._id, 'up')}
                  className={`vote-btn ${hasUserVoted(answer, 'up') ? 'voted' : ''}`}
                  disabled={!isAuthenticated}
                >
                  ▲
                </button>
                <span className="vote-count">{getVoteCount(answer)}</span>
                <button
                  onClick={() => handleVoteAnswer(answer._id, 'down')}
                  className={`vote-btn ${hasUserVoted(answer, 'down') ? 'voted' : ''}`}
                  disabled={!isAuthenticated}
                >
                  ▼
                </button>
                {canAccept && (
                  <button
                    onClick={() => handleAcceptAnswer(answer._id)}
                    className="accept-btn"
                    title="Accept this answer"
                  >
                    ✓
                  </button>
                )}
              </div>

              <div className="answer-main">
                <div className="answer-body">
                  <p style={{ whiteSpace: 'pre-wrap' }}>{answer.body}</p>
                </div>

                <div className="answer-footer">
                  <div className="author-card">
                    <span>Answered by <strong>{answer.author?.username || 'Anonymous'}</strong></span>
                    <span className="reputation">⭐ {answer.author?.reputation || 0}</span>
                    <span className="date">{timeAgo(answer.createdAt)}</span>
                  </div>

                  {isAnswerOwner && (
                    <button onClick={() => handleDeleteAnswer(answer._id)} className="btn btn-danger btn-sm">
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="answer-form">
        <h3>Your Answer</h3>
        {isAuthenticated ? (
          <form onSubmit={handleSubmitAnswer}>
            <div className="form-group">
              <textarea
                value={answerBody}
                onChange={(e) => setAnswerBody(e.target.value)}
                placeholder="Write your answer here..."
                rows="8"
                maxLength="5000"
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Posting...' : 'Post Your Answer'}
            </button>
          </form>
        ) : (
          <div className="login-prompt">
            <p>You must be <Link to="/login">logged in</Link> to answer questions.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionDetail;
