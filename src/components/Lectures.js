import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Form, Button, Table, Card, InputGroup, FormControl, Alert } from 'react-bootstrap';

const API_URL = "https://luct-backend-2.onrender.com"; // Backend URL

const Lectures = ({ role }) => {
  const [lectures, setLectures] = useState([]);
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState('');
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Fetch lectures
  const fetchLectures = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/lectures`, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      setLectures(res.data || []);
      setError(null);
    } catch (err) {
      console.error('Fetch lectures error:', err);
      setError(err.response?.data?.msg || 'Error fetching lectures');
    }
  }, []);

  // Fetch available reports for PL dropdown
  const fetchReports = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/lectures/available-reports`, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });

      // Filter out reports that are already assigned to lectures
      const availableReports = res.data.filter(report => {
        return !lectures.find(l => l.report_id === report.id);
      });

      setReports(availableReports);
      setError(null);
    } catch (err) {
      console.error('Fetch reports error:', err);
      setError(err.response?.data?.msg || 'Error fetching reports');
    }
  }, [lectures]);

  useEffect(() => {
    fetchLectures();
  }, [fetchLectures]);

  useEffect(() => {
    if (role === 'pl') fetchReports();
  }, [fetchReports, role]);

  // Assign lecture
  const onSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReport) return setError('Select a lecture from reports.');
    const token = localStorage.getItem('token');
    if (!token) return setError('No authentication token.');

    try {
      await axios.post(`${API_URL}/lectures`, { report_id: selectedReport }, {
        headers: { 'x-auth-token': token }
      });
      setSuccess('Lecture assigned successfully');
      setError(null);
      setSelectedReport('');
      fetchLectures();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Add lecture error:', err);
      setError(err.response?.data?.msg || 'Error assigning lecture');
      setSuccess(null);
    }
  };

  // Delete lecture
  const deleteLecture = async (id) => {
    if (!window.confirm('Are you sure you want to delete this lecture?')) return;
    const token = localStorage.getItem('token');
    if (!token) return setError('No authentication token.');

    try {
      await axios.delete(`${API_URL}/lectures/${id}`, {
        headers: { 'x-auth-token': token }
      });
      setSuccess('Lecture deleted successfully');
      setError(null);
      fetchLectures();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Delete lecture error:', err);
      setError(err.response?.data?.msg || 'Error deleting lecture');
      setSuccess(null);
    }
  };

  const filteredLectures = lectures.filter(l =>
    (l.course_name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card className="p-4">
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

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
                  {r.course_name || 'No Course'} — {r.course_code || 'N/A'} — Lecturer ID: {r.lecturer_id}
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
          {filteredLectures.length > 0 ? filteredLectures.map(l => (
            <tr key={l.id}>
              <td>{l.id}</td>
              <td>{l.course_name || 'No Course'}</td>
              <td>{l.course_id}</td>
              <td>{l.lecturer_id}</td>
              <td>{l.date_of_lecture?.split('T')[0]}</td>
              {role === 'pl' && (
                <td>
                  <Button variant="danger" size="sm" onClick={() => deleteLecture(l.id)}>Delete</Button>
                </td>
              )}
            </tr>
          )) : (
            <tr>
              <td colSpan={role === 'pl' ? 6 : 5} className="text-center">No lectures found.</td>
            </tr>
          )}
        </tbody>
      </Table>
    </Card>
  );
};

export default Lectures;











