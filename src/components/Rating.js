import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import '../index.css';

const API_URL = process.env.REACT_APP_API_URL || 'https://luct-backend-2.onrender.com/api';

const Rating = () => {
  const [role, setRole] = useState(null);
  const [items, setItems] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({});

  // Fetch items to rate
  const fetchItems = useCallback(async (role, token) => {
    try {
      let endpoint;
      if (role === 'lecturer') endpoint = 'students-to-rate';
      else if (role === 'student') endpoint = 'lectures-to-rate';
      else {
        setItems([]);
        return; // PL/PRL should not fetch ratings
      }

      const res = await axios.get(`${API_URL}/${endpoint}`, {
        headers: { 'x-auth-token': token },
      });
      setItems(res.data || []);

      // Initialize formData
      const initialForm = {};
      res.data.forEach(item => {
        initialForm[item.id] = { rating: '', comment: '' };
      });
      setFormData(initialForm);
    } catch (err) {
      console.error('Fetch items error:', err);
      setMessage(err.response?.data?.msg || 'Failed to load items.');
      setItems([]);
    }
  }, []);

  // Fetch all ratings
  const fetchRatings = useCallback(async (token) => {
    try {
      const res = await axios.get(`${API_URL}/rating`, {
        headers: { 'x-auth-token': token },
      });
      setRatings(res.data.ratings || []);
    } catch (err) {
      console.error('Fetch ratings error:', err);
      setMessage(err.response?.data?.msg || 'Failed to load ratings.');
      setRatings([]);
    }
  }, []);

  // Load role and data on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      setRole(decoded.role);

      if (decoded.role === 'student' || decoded.role === 'lecturer') {
        fetchItems(decoded.role, token);
        fetchRatings(token);
      } else {
        setMessage('You do not have access to rate or view ratings.');
      }
    } catch (err) {
      console.error('Token decode error', err);
    }
  }, [fetchItems, fetchRatings]);

  const handleChange = (id, e) => {
    setFormData({
      ...formData,
      [id]: { ...formData[id], [e.target.name]: e.target.value },
    });
  };

  const handleSubmit = async (item) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const payload = {
        target_id: item.id,
        rating: formData[item.id].rating,
        comment: formData[item.id].comment || null,
      };

      const res = await axios.post(`${API_URL}/rating`, payload, {
        headers: { 'x-auth-token': token },
      });

      setMessage(res.data.message);
      setFormData({ ...formData, [item.id]: { rating: '', comment: '' } });
      fetchRatings(token);
    } catch (err) {
      console.error('Rating submit error:', err);
      setMessage(err.response?.data?.msg || 'Error submitting rating');
    }
  };

  if (!role) return <p>Loading...</p>;

  return (
    <div className="rating-container">
      {(role === 'lecturer' || role === 'student') ? (
        <>
          <h2>{role === 'lecturer' ? 'Rate Students' : 'Rate Lectures'}</h2>
          {message && <p className="rating-message">{message}</p>}

          <div className="rating-list">
            {items.length === 0 && <p>No items to rate.</p>}
            {items.map(item => (
              <div key={item.id} className="rating-card">
                <p>
                  <strong>{role === 'lecturer' ? 'Student:' : 'Lecture:'}</strong>{' '}
                  {role === 'lecturer'
                    ? item.username
                    : item.course_name || `Lecture ${item.id}`}
                </p>
                <input
                  type="number"
                  name="rating"
                  placeholder="Rating (1-5)"
                  min="1"
                  max="5"
                  value={formData[item.id]?.rating || ''}
                  onChange={(e) => handleChange(item.id, e)}
                />
                <textarea
                  name="comment"
                  placeholder="Comment (optional)"
                  value={formData[item.id]?.comment || ''}
                  onChange={(e) => handleChange(item.id, e)}
                />
                <button onClick={() => handleSubmit(item)}>Submit Rating</button>
              </div>
            ))}
          </div>

          <h3>All Ratings</h3>
          <div className="all-ratings">
            {ratings.length === 0 && <p>No ratings yet.</p>}
            {ratings.map(r => (
              <div key={r.id} className="rating-card">
                {role === 'lecturer' ? (
                  <>
                    <p><strong>Student:</strong> {r.student_name}</p>
                    <p><strong>Rating:</strong> {r.rating}</p>
                    <p><strong>Comment:</strong> {r.comment || '-'}</p>
                  </>
                ) : (
                  <>
                    <p><strong>Lecture:</strong> {r.course_name}</p>
                    <p><strong>Lecturer:</strong> {r.lecturer_name}</p>
                    <p><strong>Rating:</strong> {r.rating}</p>
                    <p><strong>Comment:</strong> {r.comment || '-'}</p>
                  </>
                )}
              </div>
            ))}
          </div>
        </>
      ) : (
        <p>{message || 'You do not have access to rate or view ratings.'}</p>
      )}
    </div>
  );
};

export default Rating;































