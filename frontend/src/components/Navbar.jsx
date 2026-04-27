import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { FiLogOut, FiUser, FiMenu, FiX, FiSun, FiMoon } from 'react-icons/fi';
import { MdFoodBank } from 'react-icons/md';
import { useState } from 'react';
import NotificationsDropdown from './NotificationsDropdown';
import './Navbar.css';

const Navbar = () => {
  const { user, token, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'donor': return '/donor/dashboard';
      case 'receiver': return '/receiver/dashboard';
      case 'admin': return '/admin/dashboard';
      default: return '/';
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-left-group">
          <Link to={isAuthenticated ? getDashboardLink() : '/'} className="navbar-brand">
            <MdFoodBank className="navbar-logo-icon" />
            <span className="navbar-logo-text">FoodShare</span>
          </Link>
          {isAuthenticated && (
            <div className="navbar-noti-wrapper">
              <NotificationsDropdown />
            </div>
          )}
          <button
            className="navbar-theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <FiSun /> : <FiMoon />}
          </button>
        </div>

        <button className="navbar-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FiX /> : <FiMenu />}
        </button>

        <div className={`navbar-menu ${menuOpen ? 'active' : ''}`}>
          {isAuthenticated ? (
            <>
              <Link to={getDashboardLink()} className="navbar-link" onClick={() => setMenuOpen(false)}>
                Dashboard
              </Link>
              {user?.role === 'admin' && (
                <Link to="/admin/predictions" className="navbar-link" onClick={() => setMenuOpen(false)}>
                  🤖 AI Predictions
                </Link>
              )}
              <Link to="/profile" className="navbar-link" onClick={() => setMenuOpen(false)}>
                <FiUser /> Profile
              </Link>
              <div className="navbar-user-info">
                <span className="navbar-role-badge">{user?.role}</span>
                <span className="navbar-username">{user?.name}</span>
              </div>
              <button className="btn btn-secondary btn-sm navbar-logout" onClick={handleLogout}>
                <FiLogOut /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-link" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register/donor" className="btn btn-primary btn-sm" onClick={() => setMenuOpen(false)}>
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
