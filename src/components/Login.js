import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Form, Button, Card } from 'react-bootstrap';
import { jwtDecode } from 'jwt-decode'; // Named import

const Login = ({ setRole }) => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const navigate = useNavigate();

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      // ✅ Corrected to use base URL directly with /auth/login
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/auth/login`, formData);

      // Save token in localStorage and log it
      const token = res.data.token;
      localStorage.setItem('token', token);
      console.log('Token saved:', token);

      // Decode token to get role
      const decoded = jwtDecode(token);
      setRole(decoded.role);
      console.log('Decoded role:', decoded.role);

      // Navigate to reports page
      navigate('/reports');
    } catch (err) {
      console.error('Login error:', err.response ? err.response.data : err);
      alert('Login failed. ' + (err.response?.data?.msg || 'Check username/password or server.'));
    }
  };

  return (
    <Card className="p-4">
      <h2>Login</h2>
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
          <Form.Label>Password</Form.Label> {/* Corrected closing tag */}
          <Form.Control
            type="password"
            name="password"
            value={formData.password}
            onChange={onChange}
            required
          />
        </Form.Group>
        <Button variant="primary" type="submit">
          Login
        </Button>
      </Form>
    </Card>
  );
};

export default Login;



