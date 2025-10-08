import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Form, Button, Card } from 'react-bootstrap';
import { jwtDecode } from 'jwt-decode';

const Login = ({ setRole }) => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const navigate = useNavigate();

  // ✅ Use environment variable for API base URL
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      // ✅ Automatically use the correct backend (Render or local)
      const res = await axios.post(`${API_URL}/api/auth/login`, formData);

      const token = res.data.token;
      localStorage.setItem('token', token);

      const decoded = jwtDecode(token);
      setRole(decoded.role);
      console.log('Decoded role:', decoded.role);

      navigate('/reports');
    } catch (err) {
      console.error('Login error:', err.response ? err.response.data : err);
      alert(
        'Login failed. ' +
          (err.response?.data?.msg ||
            'Please check your username, password, or server connection.')
      );
    }
  };

  return (
    <Card className="p-4" style={{ maxWidth: '400px', margin: '50px auto' }}>
      <h2 className="mb-4 text-center">Login</h2>
      <Form onSubmit={onSubmit}>
        <Form.Group controlId="username" className="mb-3">
          <Form.Label>Username</Form.Label>
          <Form.Control
            type="text"
            name="username"
            value={formData.username}
            onChange={onChange}
            required
            placeholder="Enter your username"
          />
        </Form.Group>

        <Form.Group controlId="password" className="mb-4">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            name="password"
            value={formData.password}
            onChange={onChange}
            required
            placeholder="Enter your password"
          />
        </Form.Group>

        <Button variant="primary" type="submit" className="w-100">
          Login
        </Button>
      </Form>
    </Card>
  );
};

export default Login;




