import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import '../index.css';

const Rating = () => {
  const [role, setRole] = useState(null);
  const [items, setItems] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({});
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const fetchItems = useCallback(async (role, token) => {
    try {
      const endpoint = role === 'lecturer' ? 'students-to-rate' : 'lectures-to-rate';
      const res = await axios.get(`${API_URL}/${endpoint}`, {
        headers: { 'x-auth-token': token },
      });
      setItems(res.data || []);

      const initialForm = {};
      res.data.forEach(item => {
        initialForm[item.id] = { rating: '', comment: '' };
      });
      setFormData(initialForm);
    } catch (err) {
      console.error('Fetch items error:', err);
      setMessage('Failed to load items.');
    }
  }, [API_URL]);

  const fetchRatings = useCallback(async (token) => {
    try {
      const res = await axios.get(`${API_URL}/rating`, {
        headers: { 'x-auth-token': token },
      });
      setRatings(res.data.ratings || []);
    } catch (err) {
      console.error('Fetch ratings error:', err);
      setMessage('Failed to load ratings.');
    }
  }, [API_URL]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const decoded = JSON.parse(atob(token.split('.')[1]));
      setRole(decoded.role);
      fetchItems(decoded.role, token);
      fetchRatings(token);
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

  return (
    <div className="rating-container">
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
    </div>
  );
};

export default Rating;



























