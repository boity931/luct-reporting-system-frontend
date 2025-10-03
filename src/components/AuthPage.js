// src/pages/AuthPage.js
import React, { useState } from 'react';
import Login from '../components/Login';
import Register from '../components/Register';
import { Card, Button } from 'react-bootstrap';

const AuthPage = ({ setRole }) => {
  const [activeForm, setActiveForm] = useState('login'); // 'login' or 'register'

  return (
    <Card className="p-4 mx-auto" style={{ maxWidth: '400px' }}>
      <div className="d-flex justify-content-center mb-3">
        <Button
          variant={activeForm === 'login' ? 'primary' : 'outline-primary'}
          className="me-2"
          onClick={() => setActiveForm('login')}
        >
          Login
        </Button>
        <Button
          variant={activeForm === 'register' ? 'primary' : 'outline-primary'}
          onClick={() => setActiveForm('register')}
        >
          Register
        </Button>
      </div>

      {activeForm === 'login' ? <Login setRole={setRole} /> : <Register />}
    </Card>
  );
};

export default AuthPage;


