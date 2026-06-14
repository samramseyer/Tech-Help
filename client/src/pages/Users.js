import React, { useState, useEffect } from 'react';
import { getUsers } from '../services/api';
import { timeAgo } from '../utils/formatDate';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      const sorted = [...data.data].sort((a, b) => (b.reputation || 0) - (a.reputation || 0));
      setUsers(sorted);
      setError('');
    } catch (err) {
      setError('Failed to load community members. Make sure the server is running.');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading community...</div>;
  }

  return (
    <div className="users-page">
      <div className="page-header">
        <div>
          <h1>Community</h1>
          <p className="subtitle">Meet the developers helping each other on TechHelp Hub</p>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      {users.length === 0 ? (
        <div className="empty-state">
          <p>No members yet. Be the first to join!</p>
        </div>
      ) : (
        <div className="user-grid">
          {users.map((user, index) => (
            <div key={user._id} className="user-card">
              <div className="user-card-header">
                <span className="user-avatar">{user.username?.[0]?.toUpperCase() || '?'}</span>
                <div>
                  <h3>{user.username}</h3>
                  <span className="reputation">⭐ {user.reputation || 0} reputation</span>
                </div>
                {index < 3 && <span className="rank-badge">#{index + 1}</span>}
              </div>
              <p className="member-since">Member since {timeAgo(user.createdAt)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Users;
