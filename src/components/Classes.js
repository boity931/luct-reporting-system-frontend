import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Card, InputGroup, FormControl, Form, Button, Alert, Modal } from 'react-bootstrap';

const Classes = ({ role, onReportUpdate }) => {
  const [classes, setClasses] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editingClassId, setEditingClassId] = useState(null);
  const [editFormData, setEditFormData] = useState({ class_name: '', venue: '' });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newClassData, setNewClassData] = useState({ class_name: '', venue: '' });

  useEffect(() => {
    fetchClasses();
  }, [onReportUpdate]);

  const fetchClasses = async (q = '') => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/classes${q ? `?q=${q}` : ''}`,
        {
          headers: {
            'x-auth-token': localStorage.getItem('token'),
          },
        }
      );
      setClasses(res.data || []);
      setError(null);
      setSuccess(null);
    } catch (err) {
      console.error('Error fetching classes:', err);
      setError(err.response?.data?.message || 'Error fetching classes');
      setSuccess(null);
      setClasses([]);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearch(value);
    fetchClasses(value);
  };

  const startEdit = (cls) => {
    setEditingClassId(cls.class_id);
    setEditFormData({
      class_name: cls.class_name,
      venue: cls.venue,
    });
    setError(null);
    setSuccess(null);
  };

  const handleEditChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const submitEdit = async (classId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No authentication token.');
      return;
    }

    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/classes/${classId}`,
        editFormData,
        {
          headers: { 'x-auth-token': token },
        }
      );
      setEditingClassId(null);
      setSuccess('Class updated successfully');
      setError(null);
      fetchClasses(search);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating class');
      setSuccess(null);
    }
  };

  const handleDelete = async (classId) => {
    if (!window.confirm('Are you sure you want to delete this class?')) return;
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No authentication token.');
      return;
    }

    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/classes/${classId}`,
        {
          headers: { 'x-auth-token': token },
        }
      );
      setSuccess('Class deleted successfully');
      setError(null);
      fetchClasses(search);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting class');
      setSuccess(null);
    }
  };

  const handleNewClassChange = (e) => {
    setNewClassData({ ...newClassData, [e.target.name]: e.target.value });
  };

  const submitNewClass = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No authentication token.');
      return;
    }

    if (!newClassData.class_name || !newClassData.venue) {
      setError('Both class name and venue are required.');
      return;
    }

    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/classes`,
        newClassData,
        {
          headers: { 'x-auth-token': token },
        }
      );
      setShowCreateModal(false);
      setNewClassData({ class_name: '', venue: '' });
      setSuccess('New class created successfully');
      setError(null);
      fetchClasses(search);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating class');
      setSuccess(null);
    }
  };

  return (
    <Card className="p-4">
      <h2>Classes</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <InputGroup className="mb-3 search-input">
        <FormControl
          placeholder="Search classes..."
          value={search}
          onChange={handleSearch}
        />
        {role === 'lecturer' && (
          <Button variant="primary" onClick={() => setShowCreateModal(true)}>
            Add New Class
          </Button>
        )}
      </InputGroup>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Venue</th>
            {(role === 'lecturer' || role === 'pl') && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {classes.length > 0 ? (
            classes.map((cls) => (
              <tr key={cls.class_id}>
                <td>{cls.class_id}</td>
                <td>{cls.class_name}</td>
                <td>{cls.venue}</td>
                {(role === 'lecturer' || role === 'pl') && (
                  <td>
                    {editingClassId === cls.class_id ? (
                      <Form
                        onSubmit={(e) => {
                          e.preventDefault();
                          submitEdit(cls.class_id);
                        }}
                      >
                        <Form.Group className="mb-2">
                          <Form.Control
                            type="text"
                            name="class_name"
                            value={editFormData.class_name}
                            onChange={handleEditChange}
                            placeholder="Class Name"
                            required
                          />
                        </Form.Group>
                        <Form.Group className="mb-2">
                          <Form.Control
                            type="text"
                            name="venue"
                            value={editFormData.venue}
                            onChange={handleEditChange}
                            placeholder="Venue"
                            required
                          />
                        </Form.Group>
                        <Button type="submit" variant="primary" className="me-2">
                          Save
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => setEditingClassId(null)}
                        >
                          Cancel
                        </Button>
                      </Form>
                    ) : (
                      <>
                        {role === 'lecturer' && (
                          <>
                            <Button
                              variant="warning"
                              className="me-2"
                              onClick={() => startEdit(cls)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="danger"
                              onClick={() => handleDelete(cls.class_id)}
                            >
                              Delete
                            </Button>
                          </>
                        )}
                      </>
                    )}
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={(role === 'lecturer' || role === 'pl') ? 4 : 3}
                className="text-center"
              >
                No classes found.
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Create New Class Modal */}
      {role === 'lecturer' && (
        <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Add New Class</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Class Name</Form.Label>
                <Form.Control
                  type="text"
                  name="class_name"
                  value={newClassData.class_name}
                  onChange={handleNewClassChange}
                  placeholder="Enter class name"
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Venue</Form.Label>
                <Form.Control
                  type="text"
                  name="venue"
                  value={newClassData.venue}
                  onChange={handleNewClassChange}
                  placeholder="Enter venue"
                  required
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={submitNewClass}>
              Create
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </Card>
  );
};

export default Classes;