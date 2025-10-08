import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button, Table, Card, InputGroup, FormControl, Alert } from 'react-bootstrap';

const API_URL = "https://luct-backend-2.onrender.com"; // Deployed backend URL

const Courses = ({ role }) => {
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({ name: '', code: '', lecturer_id: '' });
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async (q = '') => {
    try {
      const res = await axios.get(`${API_URL}/courses${q ? `?q=${q}` : ''}`, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      setCourses(res.data || []);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error fetching courses');
    }
  };

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return setError('No authentication token.');

    if (!formData.name || !formData.code || !formData.lecturer_id) {
      return setError('All fields are required.');
    }

    try {
      await axios.post(`${API_URL}/courses`, formData, { headers: { 'x-auth-token': token } });
      setFormData({ name: '', code: '', lecturer_id: '' });
      setSuccess('Course added successfully');
      setError(null);
      fetchCourses();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error adding course');
      setSuccess(null);
    }
  };

  const handleSearch = e => {
    const value = e.target.value;
    setSearch(value);
    fetchCourses(value);
  };

  const deleteCourse = async (id) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;

    const token = localStorage.getItem('token');
    if (!token) return setError('No authentication token.');

    try {
      await axios.delete(`${API_URL}/courses/${id}`, { headers: { 'x-auth-token': token } });
      setSuccess('Course deleted successfully');
      setError(null);
      fetchCourses(search);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error deleting course');
      setSuccess(null);
    }
  };

  return (
    <Card className="p-4">
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      {role === 'pl' && (
        <Form onSubmit={onSubmit} className="mb-4">
          <Form.Group controlId="name" className="mb-3">
            <Form.Label>Course Name</Form.Label>
            <Form.Control type="text" name="name" value={formData.name} onChange={onChange} required />
          </Form.Group>
          <Form.Group controlId="code" className="mb-3">
            <Form.Label>Course Code</Form.Label>
            <Form.Control type="text" name="code" value={formData.code} onChange={onChange} required />
          </Form.Group>
          <Form.Group controlId="lecturer_id" className="mb-3">
            <Form.Label>Lecturer ID</Form.Label>
            <Form.Control type="number" name="lecturer_id" value={formData.lecturer_id} onChange={onChange} required />
          </Form.Group>
          <Button variant="primary" type="submit">Add Course</Button>
        </Form>
      )}

      <InputGroup className="mb-3 search-input">
        <FormControl placeholder="Search courses..." value={search} onChange={handleSearch} />
      </InputGroup>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Code</th>
            {role === 'pl' && <th>Action</th>}
          </tr>
        </thead>
        <tbody>
          {courses.length > 0 ? courses.map(course => (
            <tr key={course.id}>
              <td>{course.id}</td>
              <td>{course.name}</td>
              <td>{course.code}</td>
              {role === 'pl' && (
                <td>
                  <Button variant="danger" size="sm" onClick={() => deleteCourse(course.id)}>Delete</Button>
                </td>
              )}
            </tr>
          )) : (
            <tr>
              <td colSpan={role === 'pl' ? 4 : 3} className="text-center">No courses found.</td>
            </tr>
          )}
        </tbody>
      </Table>
    </Card>
  );
};

export default Courses;

