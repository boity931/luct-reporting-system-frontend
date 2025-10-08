import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Card, InputGroup, FormControl, Alert } from 'react-bootstrap';

const API_URL = process.env.REACT_APP_API_URL || 'https://luct-backend-2.onrender.com/api';

const Monitoring = ({ role }) => {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMonitoring();
  }, []);

  const fetchMonitoring = async (q = '') => {
    try {
      const res = await axios.get(`${API_URL}/monitoring${q ? `?q=${q}` : ''}`, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      setData(res.data || []);
      setError(null);
    } catch (err) {
      console.error('Fetch monitoring error:', err);
      setError(err.response?.data?.message || 'Error fetching monitoring data');
      setData([]);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearch(value);
    fetchMonitoring(value);
  };

  return (
    <Card className="p-4">
      <h2>Monitoring</h2>

      {error && <Alert variant="danger">{error}</Alert>}

      <InputGroup className="mb-3">
        <FormControl
          placeholder="Search monitoring..."
          value={search}
          onChange={handleSearch}
        />
      </InputGroup>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Course Name</th>
            <th>Week</th>
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.course_name}</td>
                <td>{item.week_of_reporting}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3} className="text-center">
                No monitoring data found.
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </Card>
  );
};

export default Monitoring;

