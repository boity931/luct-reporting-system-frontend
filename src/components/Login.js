import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Form, Button, Card } from 'react-bootstrap';
import jwtDecode from 'jwt-decode'; // Fixed import

const Login = ({ setRole }) => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const navigate = useNavigate();

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        'https://luct-backend-2.onrender.com/api/auth/login',
        formData
      );

      // ✅ Save token
      const token = res.data.token;
      localStorage.setItem('token', token);

      // ✅ Decode token to get role
      const decoded = jwtDecode(token);
      setRole(decoded.role);

      // ✅ Redirect based on role
      switch (decoded.role) {
        case 'student':
          navigate('/student-dashboard'); // replace with your route
          break;
        case 'lecturer':
          navigate('/lecturer-dashboard'); // replace with your route
          break;
        case 'pl':
          navigate('/pl-dashboard'); // replace with your route
          break;
        case 'prl':
          navigate('/prl-dashboard'); // replace with your route
          break;
        default:
          navigate('/reports'); // fallback
      }
    } catch (err) {
      console.error('Login error:', err.response ? err.response.data : err);
      alert(
        'Login failed. ' +
          (err.response?.data?.msg || 'Check username, password, or server.')
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




