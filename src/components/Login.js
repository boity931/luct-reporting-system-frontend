import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import { jwtDecode } from 'jwt-decode'; // Named import

const API_URL = process.env.REACT_APP_API_URL || "https://luct-backend-2.onrender.com";

const Login = ({ setRole }) => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const res = await axios.post(`${API_URL}/auth/login`, formData);
      const token = res.data.token;

      localStorage.setItem('token', token);

      const decoded = jwtDecode(token); // Use named import
      setRole(decoded.role);

      navigate('/reports');
    } catch (err) {
      console.error('Login error:', err.response ? err.response.data : err);
      setError(err.response?.data?.msg || 'Login failed. Check username/password or server.');
    }
  };

  return (
    <Card className="p-4">
      <h2>Login</h2>
      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={onSubmit}>
        <Form.Group controlId="username" className="mb-3">
          <Form.Label>Username</Form.Label>
          <Form.Control
            type="text"
            name="username"
            value={formData.username}
            onChange={onChange}
            required
          />
        </Form.Group>

        <Form.Group controlId="password" className="mb-3">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            name="password"
            value={formData.password}
            onChange={onChange}
            required
          />
        </Form.Group>

        <Button variant="primary" type="submit">Login</Button>
      </Form>
    </Card>
  );
};

export default Login;





