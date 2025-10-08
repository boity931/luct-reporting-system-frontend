import React, { useState, useEffect, useCallback } from 'react';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import axios from 'axios';
import * as XLSX from 'xlsx';

const API_URL = process.env.REACT_APP_API_URL || 'https://luct-backend-2.onrender.com/api';

const Reports = ({ role }) => {
  const [formData, setFormData] = useState({
    faculty_name: '',
    class_name: '',
    week_of_reporting: '',
    date_of_lecture: '',
    course_name: '',
    course_code: '',
    lecturer_name: '',
    actual_students: '',
    total_registered: '',
    venue: '',
    scheduled_time: '',
    topic_taught: '',
    learning_outcomes: '',
    recommendations: '',
    lecturer_id: ''
  });

  const [classes, setClasses] = useState([]);
  const [reports, setReports] = useState([]);
  const [error, setError] = useState(null);
  const [feedbacks, setFeedbacks] = useState({});
  const [expandedReportId, setExpandedReportId] = useState(null);
  const [editReportId, setEditReportId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [defaultTotalRegistered, setDefaultTotalRegistered] = useState('');

  useEffect(() => {
    setFormData({
      faculty_name: '',
      class_name: '',
      week_of_reporting: '',
      date_of_lecture: '',
      course_name: '',
      course_code: '',
      lecturer_name: '',
      actual_students: '',
      total_registered: '',
      venue: '',
      scheduled_time: '',
      topic_taught: '',
      learning_outcomes: '',
      recommendations: '',
      lecturer_id: ''
    });
    setReports([]);
    setError(null);
    setFeedbacks({});
    setExpandedReportId(null);
    setEditReportId(null);
    setEditFormData({});
    setDefaultTotalRegistered('');
  }, [role]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      if (name === 'class_name') {
        const selectedClass = classes.find((cls) => cls.class_name.toLowerCase() === value.toLowerCase());
        return { ...prev, [name]: value, class_id: selectedClass ? selectedClass.class_id : '' };
      }
      return { ...prev, [name]: value };
    });
  };

  const fetchReports = useCallback(async (q = '') => {
    const token = localStorage.getItem('token');
    if (!token) return;

    let url;
    if (role === 'pl') {
      url = `${API_URL.replace(/\/$/, '')}/reports/prl-feedback`;
    } else {
      url = `${API_URL.replace(/\/$/, '')}/reports${q ? `?q=${q}` : ''}`;
    }

    try {
      const response = await axios.get(url, { headers: { 'x-auth-token': token } });
      setReports(response.data);
      if (response.data.length > 0 && !defaultTotalRegistered) {
        setDefaultTotalRegistered(response.data[0].total_number_of_registered_students || '');
      }
      if (role !== 'pl') setError(null);
    } catch (err) {
      console.error('Fetch error:', err);
      if (role !== 'pl') setError('Error fetching reports');
    }
  }, [role, defaultTotalRegistered]);

  const fetchClasses = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await axios.get(`${API_URL.replace(/\/$/, '')}/classes`, {
        headers: { 'x-auth-token': token }
      });
      setClasses(response.data || []);
    } catch (err) {
      console.error('Fetch classes error:', err);
      if (role !== 'pl') setError('Error fetching classes');
    }
  }, [role]);

  const onSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return;

    let classId = formData.class_id;
    if (!classId && formData.class_name) {
      try {
        const response = await axios.post(
          `${API_URL.replace(/\/$/, '')}/classes`,
          { class_name: formData.class_name, venue: formData.venue || '' },
          { headers: { 'x-auth-token': token } }
        );
        classId = response.data.class_id;
      } catch (err) {
        if (role !== 'pl') setError('Error creating new class. Please try again or use an existing class name.');
        return;
      }
    } else if (!classId) {
      if (role !== 'pl') setError('Please enter a class name.');
      return;
    }

    try {
      const submitData = {
        faculty_name: formData.faculty_name,
        class_id: parseInt(classId),
        week_of_reporting: parseInt(formData.week_of_reporting) || 0,
        date_of_lecture: new Date(formData.date_of_lecture).toISOString().split('T')[0],
        course_name: formData.course_name,
        course_code: formData.course_code,
        lecturer_name: formData.lecturer_name,
        actual_number_of_students_present: parseInt(formData.actual_students) || 0,
        total_number_of_registered_students: formData.total_registered || defaultTotalRegistered || 0,
        venue: formData.venue,
        scheduled_lecture_time: formData.scheduled_time,
        topic_taught: formData.topic_taught,
        learning_outcomes: formData.learning_outcomes,
        recommendations: formData.recommendations,
        lecturer_id: formData.lecturer_id || null
      };

      await axios.post(`${API_URL.replace(/\/$/, '')}/reports`, submitData, { headers: { 'x-auth-token': token } });

      alert('Report submitted successfully');
      setFormData({ ...formData, total_registered: defaultTotalRegistered || '' });
      fetchReports();
    } catch (err) {
      console.error('Submit error:', err);
      if (role !== 'pl') setError('Error submitting report');
    }
  };

  const handleFeedbackSubmit = async (e, reportId) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return alert('You must be logged in to submit feedback.');

    const feedback = feedbacks[reportId]?.trim();
    if (!feedback) return alert('Please enter feedback before submitting.');

    const url = `${API_URL.replace(/\/$/, '')}/reports/feedback/${reportId}`;
    console.log('Submitting feedback to:', url);

    try {
      const response = await axios.post(url, { feedback }, { headers: { 'x-auth-token': token } });
      alert(response.data.message || 'Feedback submitted successfully');
      setFeedbacks(prev => ({ ...prev, [reportId]: '' }));
      fetchReports();
    } catch (err) {
      console.error('Feedback submission error:', err);
      if (err.response) {
        const status = err.response.status;
        if (status === 403) alert('Access denied: Only PRL can submit feedback.');
        else if (status === 404) alert('Report not found. Refresh and try again.');
        else alert(err.response.data.message || 'Error submitting feedback');
      } else {
        alert('Network or server error. Check console for details.');
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await axios.delete(`${API_URL.replace(/\/$/, '')}/reports/${id}`, { headers: { 'x-auth-token': token } });
      fetchReports();
    } catch (err) {
      console.error('Delete error:', err);
      if (role !== 'pl') setError('Error deleting report');
    }
  };

  const handleEditClick = (report) => {
    setEditReportId(report.id);
    setEditFormData({
      faculty_name: report.faculty_name,
      class_name: report.class_name,
      week_of_reporting: report.week_of_reporting,
      date_of_lecture: report.date_of_lecture,
      course_name: report.course_name,
      course_code: report.course_code,
      lecturer_name: report.lecturer_name,
      actual_number_of_students_present: report.actual_number_of_students_present,
      total_number_of_registered_students: report.total_number_of_registered_students,
      venue: report.venue,
      scheduled_time: report.scheduled_lecture_time,
      topic_taught: report.topic_taught,
      learning_outcomes: report.learning_outcomes,
      recommendations: report.recommendations,
      class_id: report.class_id
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => {
      if (name === 'class_name') {
        const selectedClass = classes.find((cls) => cls.class_name.toLowerCase() === value.toLowerCase());
        return { ...prev, [name]: value, class_id: selectedClass ? selectedClass.class_id : prev.class_id || '' };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleEditSubmit = async (id) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    let classId = editFormData.class_id;
    if (editFormData.class_name && !classes.some((cls) => cls.class_name.toLowerCase() === editFormData.class_name.toLowerCase())) {
      try {
        const response = await axios.post(`${API_URL.replace(/\/$/, '')}/classes`, { class_name: editFormData.class_name, venue: editFormData.venue || '' }, { headers: { 'x-auth-token': token } });
        classId = response.data.class_id;
      } catch (err) {
        if (role !== 'pl') setError('Error creating new class. Please try again or use an existing class name.');
        return;
      }
    } else if (!editFormData.class_name) {
      if (role !== 'pl') setError('Please enter a class name.');
      return;
    }

    try {
      await axios.put(`${API_URL.replace(/\/$/, '')}/reports/${id}`, { ...editFormData, class_id: parseInt(classId) }, { headers: { 'x-auth-token': token } });
      setEditReportId(null);
      fetchReports();
    } catch (err) {
      console.error('Edit error:', err);
      if (role !== 'pl') setError('Error editing report');
    }
  };

  const downloadExcel = () => {
    const worksheetData = reports.map((report) => ({
      'Faculty Name': report.faculty_name,
      'Class ID': report.class_id,
      'Class Name': report.class_name,
      'Week of Reporting': report.week_of_reporting,
      'Date of Lecture': report.date_of_lecture,
      'Course Name': report.course_name,
      'Course Code': report.course_code,
      'Lecturer Name': report.lecturer_name,
      'Actual Students Present': report.actual_number_of_students_present,
      'Total Registered Students': report.total_number_of_registered_students,
      'Venue': report.venue,
      'Scheduled Time': report.scheduled_lecture_time,
      'Topic Taught': report.topic_taught,
      'Learning Outcomes': report.learning_outcomes,
      'Recommendations': report.recommendations,
      'Lecturer ID': report.lecturer_id,
      'Feedback': report.feedback || 'None'
    }));
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Lecture Reports');
    XLSX.writeFile(workbook, 'Lecture_Reports.xlsx');
  };

  useEffect(() => {
    fetchReports();
    fetchClasses();
  }, [fetchReports, fetchClasses]);

  return (
    <Card className="p-4">
      <h2>
        {role === 'lecturer' ? 'Submit Report' 
         : role === 'prl' ? 'View Lecture Reports & Add Feedback' 
         : role === 'pl' ? 'View PRL Reports'
         : 'View Reports'}
      </h2>

      {error && role !== 'pl' && <Alert variant="danger">{error}</Alert>}

      {role === 'lecturer' && (
        <Form onSubmit={onSubmit}>
          {Object.entries(formData).map(([key, value]) => (
            <Form.Group controlId={key} className="mb-3" key={key}>
              <Form.Label>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</Form.Label>
              <Form.Control
                type={key.includes('date') ? 'date' : 'text'}
                name={key}
                value={value}
                onChange={onChange}
                required={key !== 'venue' && key !== 'recommendations' && key !== 'total_registered'}
              />
            </Form.Group>
          ))}
          <Button variant="primary" type="submit">Submit Report</Button>
        </Form>
      )}

      <h3 className="mt-4">Reports</h3>
      <Button variant="success" className="mb-3" onClick={downloadExcel}>Download Reports as Excel</Button>

      {reports.length ? (
        <ul>
          {reports.map((report) => (
            <li key={report.id} className="mb-3">
              <Button
                variant="link"
                onClick={() => setExpandedReportId(expandedReportId === report.id ? null : report.id)}
              >
                {expandedReportId === report.id ? 'Hide Details' : 'View Details'} - {report.topic_taught} - {report.date_of_lecture} - {report.lecturer_name}
              </Button>

              {expandedReportId === report.id && (
                <div className="mt-2 p-2 border">
                  {editReportId === report.id ? (
                    <>
                      {Object.entries(editFormData).map(([key, value]) => (
                        <Form.Group controlId={key} className="mb-2" key={key}>
                          <Form.Label>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</Form.Label>
                          <Form.Control
                            type={key.includes('date') ? 'date' : 'text'}
                            name={key}
                            value={value}
                            onChange={handleEditChange}
                          />
                        </Form.Group>
                      ))}
                      <Button variant="primary" className="me-2" onClick={() => handleEditSubmit(report.id)}>Save</Button>
                      <Button variant="secondary" onClick={() => setEditReportId(null)}>Cancel</Button>
                    </>
                  ) : (
                    <>
                      <p><strong>Faculty Name:</strong> {report.faculty_name}</p>
                      <p><strong>Class ID:</strong> {report.class_id}</p>
                      <p><strong>Class Name:</strong> {report.class_name}</p>
                      <p><strong>Week of Reporting:</strong> {report.week_of_reporting}</p>
                      <p><strong>Date of Lecture:</strong> {report.date_of_lecture}</p>
                      <p><strong>Course Name:</strong> {report.course_name}</p>
                      <p><strong>Course Code:</strong> {report.course_code}</p>
                      <p><strong>Lecturer Name:</strong> {report.lecturer_name}</p>
                      <p><strong>Actual Students:</strong> {report.actual_number_of_students_present}</p>
                      <p><strong>Total Registered:</strong> {report.total_number_of_registered_students}</p>
                      <p><strong>Venue:</strong> {report.venue}</p>
                      <p><strong>Scheduled Time:</strong> {report.scheduled_lecture_time}</p>
                      <p><strong>Topic Taught:</strong> {report.topic_taught}</p>
                      <p><strong>Learning Outcomes:</strong> {report.learning_outcomes}</p>
                      <p><strong>Recommendations:</strong> {report.recommendations}</p>
                      <p><strong>Lecturer ID:</strong> {report.lecturer_id}</p>
                      <p><strong>Feedback:</strong> {report.feedback || 'None'}</p>

                      {role === 'lecturer' && (
                        <>
                          <Button variant="warning" className="me-2" onClick={() => handleEditClick(report)}>Edit</Button>
                          <Button variant="danger" onClick={() => handleDelete(report.id)}>Delete</Button>
                        </>
                      )}

                      {role === 'prl' && (
                        <Form onSubmit={(e) => handleFeedbackSubmit(e, report.id)} className="mt-2">
                          <Form.Control
                            type="text"
                            name="feedback"
                            value={feedbacks[report.id] || ''}
                            onChange={(e) => setFeedbacks((prev) => ({ ...prev, [report.id]: e.target.value }))}
                            placeholder="Add feedback"
                          />
                          <Button variant="secondary" type="submit" className="mt-1">Submit Feedback</Button>
                        </Form>
                      )}
                    </>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>No reports available.</p>
      )}
    </Card>
  );
};

export default Reports;












