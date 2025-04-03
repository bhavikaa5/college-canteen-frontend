import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import App from './App';
import AdminDashboard from './AdminDashboard';
import './Router.css';

function AppRouter() {
  return (
    <Router>
      <nav className="main-nav">
        <div className="nav-container">
          <div className="nav-logo">
            <Link to="/">Campus Bites</Link>
          </div>
          <div className="nav-links">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/admin" className="nav-link admin-link">Admin</Link>
          </div>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default AppRouter;