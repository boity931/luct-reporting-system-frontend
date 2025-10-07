import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Form, Button, Table, Card, InputGroup, FormControl } from 'react-bootstrap';

const Lectures = ({ role }) => {
  const [lectures, setLectures] = useState([]);
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState('');
  const [search, setSearch] = useState('');

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Fetch lectures
  const fetchLectures = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/lectures`, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      setLectures(res.data);
    } catch (err) {
      console.error('Fetch lectures error:', err);
    }
  }, [API_URL]);

  // Fetch available reports
  const fetchReports = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/lectures/available-reports`, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      setReports(res.data);
    } catch (err) {
      console.error('Fetch reports error:', err);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchLectures();
    fetchReports();
  }, [fetchLectures, fetchReports]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReport) return alert('Error assigning lecture. Select a lecture from reports.');

    try {
      await axios.post(`${API_URL}/lectures`, { report_id: selectedReport }, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      setSelectedReport('');
      fetchLectures();
    } catch (err) {
      console.error('Add lecture error:', err);
    }
  };

  const deleteLecture = async (id) => {
    if (!window.confirm('Are you sure you want to delete this lecture?')) return;
    try {
      await axios.delete(`${API_URL}/lectures/${id}`, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      fetchLectures();
    } catch (err) {
      console.error('Delete lecture error:', err);
    }
  };

  const filteredLectures = lectures.filter(l =>
    (l.course_name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card className="p-4">
      {role === 'pl' && (
        <Form onSubmit={onSubmit} className="mb-4">
          <Form.Group controlId="reportSelect" className="mb-3">
            <Form.Label>Select Lecture (from Reports)</Form.Label>
            <Form.Select
              value={selectedReport}
              onChange={e => setSelectedReport(e.target.value)}
              required
            >
              <option value="">Select a lecture</option>
              {reports.map(r => (
                <option key={r.id} value={r.id}>
                  {r.course_name} — {r.course_code}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Button variant="primary" type="submit">Assign Lecture</Button>
        </Form>
      )}

      <InputGroup className="mb-3">
        <FormControl
          placeholder="Search lectures..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </InputGroup>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Course Name</th>
            <th>Course ID</th>
            <th>Lecturer ID</th>
            <th>Date</th>
            {role === 'pl' && <th>Action</th>}
          </tr>
        </thead>
        <tbody>
          {filteredLectures.map(l => (
            <tr key={l.id}>
              <td>{l.id}</td>
              <td>{l.course_name}</td>
              <td>{l.course_id}</td>
              <td>{l.lecturer_id}</td>
              <td>{l.date_of_lecture?.split('T')[0]}</td>
              {role === 'pl' && (
                <td>
                  <Button variant="danger" size="sm" onClick={() => deleteLecture(l.id)}>Delete</Button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </Table>
    </Card>
  );
};

export default Lectures;









