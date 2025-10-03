import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // Named import
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import Reports from './components/Reports';
import Courses from './components/Courses';
import Classes from './components/Classes';
import Monitoring from './components/Monitoring';
import Rating from './components/Rating';
import Lectures from './components/Lectures';
import Footer from './components/Footer'; // ✅ import Footer

const App = () => {
  const [role, setRole] = useState(null);
  const [reportUpdateTrigger, setReportUpdateTrigger] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwtDecode(token);
      setRole(decoded.role);
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    setRole(null);
  };

  const handleReportUpdate = () => {
    setReportUpdateTrigger((prev) => prev + 1);
  };

  axios.defaults.headers.common['x-auth-token'] = localStorage.getItem('token');

  return (
    <Router>
      <div className="app-wrapper">
        <Navbar role={role} logout={logout} />
        <div className="container mt-4 flex-grow-1">
          <Routes>
            <Route path="/login" element={<Login setRole={setRole} />} />
            <Route path="/register" element={<Register />} />

            {/* Reports only for lecturer, prl, pl */}
            {role === 'lecturer' || role === 'prl' || role === 'pl' ? (
              <Route path="/reports" element={<Reports role={role} onReportUpdate={handleReportUpdate} />} />
            ) : (
              <Route path="/reports" element={<Navigate to="/rate-lectures" />} />
            )}

            <Route path="/courses" element={<Courses role={role} />} />
            <Route path="/classes" element={<Classes role={role} onReportUpdate={reportUpdateTrigger} />} />
            <Route path="/monitoring" element={<Monitoring role={role} />} />
            <Route path="/lectures" element={<Lectures role={role} />} />

            {/* Rating routes */}
            <Route
              path="/rate-students"
              element={<Rating role={role === 'lecturer' || role === 'pl' ? 'lecturer' : role} />}
            />
            <Route
              path="/rate-lectures"
              element={<Rating role={role === 'student' ? 'student' : role} />}
            />
            <Route path="/rating" element={<Rating role={role} />} /> {/* fallback */}

            <Route
              path="/"
              element={
                <div>
                  <h1>Welcome to LUCT Reporting System</h1>
                  <p>Please choose an option to get started:</p>
                  <a href="/login" className="btn btn-primary me-2">Login</a>
                  <a href="/register" className="btn btn-secondary">Register</a>
                </div>
              }
            />
          </Routes>
        </div>
        <Footer /> {/* ✅ Global footer always at bottom */}
      </div>
    </Router>
  );
};

export default App;







