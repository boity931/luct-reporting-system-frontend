import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button, Table, Card, InputGroup, FormControl } from 'react-bootstrap';

const Courses = ({ role }) => {
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({ name: '', code: '', lecturer_id: '' });
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async (q = '') => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/courses${q ? `?q=${q}` : ''}`, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      setCourses(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/courses`, formData, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      setFormData({ name: '', code: '', lecturer_id: '' });
      fetchCourses();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = e => {
    setSearch(e.target.value);
    fetchCourses(e.target.value);
  };

  return (
    <Card className="p-4">
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
          </tr>
        </thead>
        <tbody>
          {courses.map(course => (
            <tr key={course.id}>
              <td>{course.id}</td>
              <td>{course.name}</td>
              <td>{course.code}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Card>
  );
};

export default Courses;