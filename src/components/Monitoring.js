import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Card, InputGroup, FormControl } from 'react-bootstrap';

const Monitoring = ({ role }) => {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchMonitoring();
  }, []);

  const fetchMonitoring = async (q = '') => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/monitoring${q ? `?q=${q}` : ''}`, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      setData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = e => {
    setSearch(e.target.value);
    fetchMonitoring(e.target.value);
  };

  return (
    <Card className="p-4">
      <InputGroup className="mb-3 search-input">
        <FormControl placeholder="Search monitoring..." value={search} onChange={handleSearch} />
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
          {data.map(item => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.course_name}</td>
              <td>{item.week_of_reporting}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Card>
  );
};

export default Monitoring;