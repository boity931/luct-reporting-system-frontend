import React from 'react';
import { Navbar as BootstrapNavbar, Nav, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ role, logout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <BootstrapNavbar bg="dark" variant="dark" expand="lg" className="mb-4">
      <BootstrapNavbar.Brand href="/">LUCT Reporting System</BootstrapNavbar.Brand>
      <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
      <BootstrapNavbar.Collapse id="basic-navbar-nav">
        <Nav className="me-auto">
          {/* No user logged in */}
          {!role && (
            <>
              <Nav.Link href="/login">Login</Nav.Link>
              <Nav.Link href="/register">Register</Nav.Link>
            </>
          )}

          {/* Lecturer menu */}
          {role === 'lecturer' && (
            <>
              <Nav.Link href="/reports">Reports</Nav.Link>
              <Nav.Link href="/classes">Classes</Nav.Link>
              <Nav.Link href="/rate-students">Rate Students</Nav.Link>
            </>
          )}

          {/* PRL menu */}
          {role === 'prl' && (
            <>
              <Nav.Link href="/reports">Reports</Nav.Link>
              <Nav.Link href="/monitoring">Monitoring</Nav.Link>
              <Nav.Link href="/courses">Courses</Nav.Link>
              <Nav.Link href="/lectures">Lectures</Nav.Link>
            </>
          )}

          {/* Student menu */}
          {role === 'student' && (
            <>
              <Nav.Link href="/courses">Courses</Nav.Link>
              <Nav.Link href="/rate-lectures">Rate Lectures</Nav.Link>
            </>
          )}

          {/* PL menu */}
          {role === 'pl' && (
            <>
              <Nav.Link href="/reports">Reports</Nav.Link>
              <Nav.Link href="/courses">Courses</Nav.Link>
              <Nav.Link href="/classes">Classes</Nav.Link>
              <Nav.Link href="/lectures">Lectures</Nav.Link>
            </>
          )}
        </Nav>

        {/* Logout button for logged-in users */}
        {role && (
          <Button variant="outline-light" onClick={handleLogout}>
            Logout
          </Button>
        )}
      </BootstrapNavbar.Collapse>
    </BootstrapNavbar>
  );
};

export default Navbar;


