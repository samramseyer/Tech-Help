import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav>
      <div className="nav-container">
        <div className="nav-left">
          <Link to="/" className="nav-logo" onClick={closeMenu}>
            <span className="logo-icon">🏁</span>
            <span className="logo-text">TechHelp Hub</span>
          </Link>
          <button
            className="nav-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
          >
            <span />
            <span />
            <span />
          </button>
          <ul className={`nav-links ${menuOpen ? 'open' : ''}`}>
            <li>
              <NavLink to="/questions" onClick={closeMenu} end>
                Questions
              </NavLink>
            </li>
            <li>
              <NavLink to="/users" onClick={closeMenu}>
                Community
              </NavLink>
            </li>
          </ul>
        </div>
        <div className={`nav-right ${menuOpen ? 'open' : ''}`}>
          {isAuthenticated ? (
            <>
              <Link to="/ask" className="btn btn-ask" onClick={closeMenu}>
                Ask Question
              </Link>
              <span className="user-info">
                <span className="user-icon">👤</span>
                {user?.username}
                <span className="reputation">⭐ {user?.reputation || 0}</span>
              </span>
              <button onClick={handleLogout} className="btn btn-logout">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary" onClick={closeMenu}>
                Login
              </Link>
              <Link to="/register" className="btn btn-primary" onClick={closeMenu}>
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
