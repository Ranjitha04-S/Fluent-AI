import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { path: '/dashboard', emoji: '🏠', label: 'Dashboard' },
  { path: '/reading', emoji: '📖', label: 'Daily Reading' },
  { path: '/vocabulary', emoji: '💬', label: 'Vocabulary' },
  { path: '/practice', emoji: '🎯', label: 'Speaking & Writing' },
  { path: '/grammar', emoji: '📝', label: 'Grammar' },
  { path: '/studio', emoji: '🎙️', label: 'Speaking Studio' },
  { path: '/settings', emoji: '⚙️', label: 'Settings' },
];

const pageTitles = {
  '/dashboard': { title: 'Dashboard', desc: 'Your daily learning overview' },
  '/reading': { title: 'Daily Reading', desc: 'Improve fluency with AI articles' },
  '/vocabulary': { title: 'Vocabulary', desc: 'Learn 5 new words every day' },
  '/practice': { title: 'Speaking & Writing', desc: 'Express yourself in English' },
  '/grammar': { title: 'Grammar', desc: 'Master English grammar rules' },
  '/studio': { title: 'Speaking Studio', desc: 'Record, practice & converse with AI' },
  '/settings': { title: 'Settings', desc: 'Manage your account and API key' },
};

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const pageInfo = pageTitles[location.pathname] || { title: 'FluentAI', desc: '' };
  const doneGoals = (user?.goals || []).filter(g => g.done).length;
  const totalGoals = (user?.goals || []).length;
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <div className="app-layout">
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      <aside className={`sidebar ${sidebarOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-wrap">
            <div className="logo-icon">🎓</div>
            <div>
              <div className="logo-name">FluentAI</div>
              <div className="logo-tag">Powered by Groq ⚡</div>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Learning</div>
          {navItems.slice(0, 6).map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="nav-emoji">{item.emoji}</span>
              {item.label}
            </NavLink>
          ))}
          <div className="nav-section-label">Account</div>
          <NavLink to="/settings" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
            <span className="nav-emoji">⚙️</span>Settings
          </NavLink>
          <div className="nav-link" onClick={() => { logout(); navigate('/'); }}>
            <span className="nav-emoji">🚪</span>Logout
          </div>
        </nav>

        <div className="sidebar-bottom">
          <div className="user-card">
            <div className="user-avatar">
              {user?.avatar ? <img src={user.avatar} alt="" /> : initials}
            </div>
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div className="user-name">{user?.name}</div>
              <div className="user-email">{user?.email}</div>
            </div>
          </div>
        </div>
      </aside>

      <div className="main-content">
        <div className="topbar">
          <div className="topbar-left">
            <button className="hamburger" onClick={() => setSidebarOpen(o => !o)}>
              <span /><span /><span />
            </button>
            <div>
              <div className="page-heading">{pageInfo.title}</div>
              <div className="page-desc">{pageInfo.desc}</div>
            </div>
          </div>
          <div className="topbar-right">
            <div className="streak-pill">🔥 {doneGoals}/{totalGoals} goals</div>
          </div>
        </div>

        <div className="page-content">{children}</div>
      </div>
    </div>
  );
}
