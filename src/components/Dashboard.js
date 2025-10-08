import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Table, Alert, Button, Form } from 'react-bootstrap';
import * as XLSX from 'xlsx';

const Dashboard = ({ role }) => {
  const [lectures, setLectures] = useState([]);
  const [reports, setReports] = useState([]);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ totalCourses: 0, totalLecturers: 0, totalLectures: 0, totalReports: 0 });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [lecturesRes, reportsRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL}/lectures`, { headers: { 'x-auth-token': localStorage.getItem('token') } }),
        axios.get(`${process.env.REACT_APP_API_URL}/lecturer-reports`, { headers: { 'x-auth-token': localStorage.getItem('token') } }),
      ]);

      const lecturesData = lecturesRes.data || [];
      const reportsData = reportsRes.data || [];

      setLectures(lecturesData);
      setReports(reportsData);

      const uniqueLecturers = new Set([...lecturesData, ...reportsData].map(item => item.lecturer_id).filter(id => id));
      setStats({
        totalCourses: new Set(lecturesData.map(l => l.course_id)).size, // Estimate based on lectures
        totalLecturers: uniqueLecturers.size,
        totalLectures: lecturesData.length,
        totalReports: reportsData.length,
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err.response?.data || err.message);
      setError('Failed to fetch dashboard data');
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredReports = reports.filter(report =>
    report.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.lecturer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.date_of_lecture.includes(searchTerm)
  );

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(reports.map(report => ({
      'Faculty Name': report.faculty_name,
      'Class Name': report.class_name,
      'Week of Reporting': report.week_of_reporting,
      'Date of Lecture': report.date_of_lecture,
      'Course Name': report.course_name,
      'Course Code': report.course_code,
      'Lecturer Name': report.lecturer_name,
      'Actual Students Present': report.actual_students_present,
      'Total Registered Students': report.total_registered_students,
      'Venue': report.venue,
      'Scheduled Lecture Time': report.scheduled_lecture_time,
      'Topic Taught': report.topic_taught,
      'Learning Outcomes': report.learning_outcomes,
      'Recommendations': report.lecturer_recommendations || 'N/A'
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'LUCT Reports');
    XLSX.writeFile(wb, 'luct_reports.xlsx');
  };

  return (
    <div className="p-4">
      <h1>LUCT Reporting System Dashboard</h1>
      {role !== 'student' && (
        <>
          {error && <Alert variant="danger">{error}</Alert>}

          {/* Summary Stats */}
          <div className="row mb-4">
            <div className="col-md-3">
              <Card className="p-3 text-center bg-light">
                <Card.Title>Total Courses</Card.Title>
                <Card.Text className="display-4">{stats.totalCourses}</Card.Text>
              </Card>
            </div>
            <div className="col-md-3">
              <Card className="p-3 text-center bg-light">
                <Card.Title>Total Lecturers</Card.Title>
                <Card.Text className="display-4">{stats.totalLecturers}</Card.Text>
              </Card>
            </div>
            <div className="col-md-3">
              <Card className="p-3 text-center bg-light">
                <Card.Title>Total Lectures</Card.Title>
                <Card.Text className="display-4">{stats.totalLectures}</Card.Text>
              </Card>
            </div>
            <div className="col-md-3">
              <Card className="p-3 text-center bg-light">
                <Card.Title>Total Reports</Card.Title>
                <Card.Text className="display-4">{stats.totalReports}</Card.Text>
              </Card>
            </div>
          </div>

          {/* Search and Export */}
          <div className="mb-4 d-flex">
            <Form.Control
              type="text"
              className="w-25 me-2"
              placeholder="Search by course, lecturer, or date..."
              value={searchTerm}
              onChange={handleSearch}
            />
            <Button variant="success" onClick={exportToExcel}>Export to Excel</Button>
          </div>

          {/* Lectures Table */}
          <Card className="mb-4">
            <Card.Header>Assigned Lectures</Card.Header>
            <Card.Body>
              <Table striped bordered hover responsive>
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
                  {lectures.length === 0 ? (
                    <tr><td colSpan="5" className="text-center">No lectures assigned</td></tr>
                  ) : (
                    lectures.map((lecture) => (
                      <tr key={lecture.id}>
                        <td>{lecture.id}</td>
                        <td>{lecture.course_name || 'N/A'}</td>
                        <td>{lecture.course_code || 'N/A'}</td>
                        <td>{lecture.lecturer_name || 'N/A'}</td>
                        <td>{lecture.date_of_lecture ? new Date(lecture.date_of_lecture).toLocaleDateString() : 'N/A'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>

          {/* Reports Table */}
          <Card>
            <Card.Header>Lecturer Reports</Card.Header>
            <Card.Body>
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Faculty</th>
                    <th>Class</th>
                    <th>Week</th>
                    <th>Date</th>
                    <th>Course</th>
                    <th>Code</th>
                    <th>Lecturer</th>
                    <th>Present</th>
                    <th>Registered</th>
                    <th>Venue</th>
                    <th>Time</th>
                    <th>Topic</th>
                    <th>Outcomes</th>
                    <th>Recommendations</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.length === 0 ? (
                    <tr><td colSpan="15" className="text-center">No reports found</td></tr>
                  ) : (
                    filteredReports.map((report) => (
                      <tr key={report.id}>
                        <td>{report.id}</td>
                        <td>{report.faculty_name}</td>
                        <td>{report.class_name}</td>
                        <td>{report.week_of_reporting}</td>
                        <td>{report.date_of_lecture}</td>
                        <td>{report.course_name}</td>
                        <td>{report.course_code}</td>
                        <td>{report.lecturer_name}</td>
                        <td>{report.actual_students_present}</td>
                        <td>{report.total_registered_students}</td>
                        <td>{report.venue}</td>
                        <td>{report.scheduled_lecture_time}</td>
                        <td>{report.topic_taught}</td>
                        <td>{report.learning_outcomes}</td>
                        <td>{report.lecturer_recommendations || 'N/A'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </>
      )}
      {role === 'student' && <Alert variant="warning">Access denied for students</Alert>}
    </div>
  );
};

export default Dashboard;