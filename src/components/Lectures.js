import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button, Table, Card, InputGroup, FormControl, Alert } from 'react-bootstrap';

const Lectures = ({ role }) => {
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({ course_id: '', lecturer_id: '', date_of_lecture: '' });
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async (q = '') => {
    try {
      console.log('Fetching courses from:', `${process.env.REACT_APP_API_URL}/courses${q ? `?q=${q}` : ''}`);
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/courses${q ? `?q=${q}` : ''}`,
        { headers: { 'x-auth-token': localStorage.getItem('token') } }
      );
      console.log('Courses response:', res.data);
      setCourses(res.data || []);
    } catch (err) {
      console.error('Error fetching courses:', err.response ? err.response.data : err.message);
      setError('Failed to fetch courses');
      setCourses([]);
    }
  };

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/lectures`,
        {
          course_id: Number(formData.course_id),
          lecturer_id: Number(formData.lecturer_id),
          date_of_lecture: formData.date_of_lecture,
        },
        { headers: { 'x-auth-token': localStorage.getItem('token') } }
      );
      setMessage(`Lecture assigned successfully: ID ${res.data.id}`);
      setFormData({ course_id: '', lecturer_id: '', date_of_lecture: '' });
      fetchCourses();
    } catch (err) {
      console.error('Error assigning lecture:', err.response ? err.response.data : err.message);
      setError(err.response?.data?.message || 'Failed to assign lecture');
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    fetchCourses(e.target.value);
  };

  // Extract unique lecturer_id and lecturer_name from courses
  const uniqueLecturers = Array.from(
    new Map(courses.map(course => [course.lecturer_id, { id: course.lecturer_id, name: course.lecturer_name }]))
      .values()
  ).filter(lecturer => lecturer.id !== null && lecturer.id !== undefined);

  return (
    <Card className="p-4">
      {role === 'pl' && (
        <Form onSubmit={onSubmit} className="mb-4">
          <h5>Assign Lecturer to Course</h5>
          {message && <Alert variant="success">{message}</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}
          <Form.Group controlId="course_id" className="mb-3">
            <Form.Label>Course ID</Form.Label>
            <Form.Control
              as="select"
              name="course_id"
              value={formData.course_id}
              onChange={onChange}
              required
            >
              <option value="">Select Course</option>
              {courses.length === 0 ? (
                <option disabled>No courses available</option>
              ) : (
                courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name || course.course_name} ({course.code || course.course_code})
                  </option>
                ))
              )}
            </Form.Control>
          </Form.Group>
          <Form.Group controlId="lecturer_id" className="mb-3">
            <Form.Label>Lecturer ID</Form.Label>
            <Form.Control
              as="select"
              name="lecturer_id"
              value={formData.lecturer_id}
              onChange={onChange}
              required
            >
              <option value="">Select Lecturer</option>
              {uniqueLecturers.length === 0 ? (
                <option disabled>No lecturers available</option>
              ) : (
                uniqueLecturers.map((lecturer) => (
                  <option key={lecturer.id} value={lecturer.id}>
                    {lecturer.name || `Lecturer ${lecturer.id}`}
                  </option>
                ))
              )}
            </Form.Control>
          </Form.Group>
          <Form.Group controlId="date_of_lecture" className="mb-3">
            <Form.Label>Date of Lecture</Form.Label>
            <Form.Control
              type="date"
              name="date_of_lecture"
              value={formData.date_of_lecture}
              onChange={onChange}
              required
            />
          </Form.Group>
          <Button variant="primary" type="submit">
            Assign Lecture
          </Button>
        </Form>
      )}

      <InputGroup className="mb-3">
        <FormControl
          placeholder="Search courses..."
          value={search}
          onChange={handleSearch}
        />
      </InputGroup>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Course Name</th>
            <th>Course Code</th>
            <th>Lecturer Name</th>
            <th>Date of Lecture</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course) => (
            <tr key={course.id}>
              <td>{course.id}</td>
              <td>{course.name || course.course_name}</td>
              <td>{course.code || course.course_code}</td>
              <td>{course.lecturer_name || 'N/A'}</td>
              <td>{course.date_of_lecture ? new Date(course.date_of_lecture).toLocaleDateString() : 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Card>
  );
};

export default Lectures;
