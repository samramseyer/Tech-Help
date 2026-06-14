import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            <span className="logo-icon footer-logo-icon">🏁</span>
            <span className="logo-text">TechHelp Hub</span>
          </Link>
          <p>A community for developers to ask questions, share knowledge, and grow together.</p>
        </div>
        <div className="footer-links">
          <h4>Explore</h4>
          <Link to="/questions">Questions</Link>
          <Link to="/ask">Ask a Question</Link>
          <Link to="/users">Community</Link>
        </div>
        <div className="footer-links">
          <h4>Account</h4>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} TechHelp Hub — Built for developers, by developers.</span>
      </div>
    </footer>
  );
};

export default Footer;
