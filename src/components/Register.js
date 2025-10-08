import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Form, Button, Card, Alert } from 'react-bootstrap';

const API_URL = process.env.REACT_APP_API_URL || 'https://luct-backend-2.onrender.com';

const Register = () => {
  const [formData, setFormData] = useState({ username: '', password: '', role: 'student' });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username || !formData.password) {
      setError('Username and password are required.');
      return;
    }

    try {
      setError(null);
      setSuccess(null);

      const res = await axios.post(`${API_URL}/auth/register`, formData);

      console.log('Server response:', res.data);
      setSuccess('Registration successful! Redirecting to login...');
      
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      console.error('Registration error:', err.response?.data || err);
      setError('Registration failed. ' + (err.response?.data?.msg || 'Check fields or server.'));
      setSuccess(null);
    }
  };

  return (
    <Card className="p-4 mx-auto" style={{ maxWidth: '400px' }}>
      <h2>Register</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

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

        <Form.Group controlId="role" className="mb-3">
          <Form.Label>Role</Form.Label>
          <Form.Select name="role" value={formData.role} onChange={onChange} required>
            <option value="student">Student</option>
          </Form.Select>
          <small className="form-text text-muted">Only students can register.</small>
        </Form.Group>

        <Button variant="primary" type="submit">Register</Button>
      </Form>
    </Card>
  );
};

export default Register;



