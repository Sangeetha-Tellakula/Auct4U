import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function CreateAccount() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Username and password are required');
      return;
    }

    try {
      const res = await axios.post('http://localhost:5001/createaccount', {
        username,
        password
      });

      alert('Account created successful! Please Login.');
      navigate('/Login'); // Redirect to signin page
    } catch (err) {
      console.error('Signup Error:', err.response?.data || err.message);
      setError(err.response?.data?.message || ' failed to create account. Please try again.');
    }
  };

  return (
    <div className="form-container">
      <h2>Create Account</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSignup}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Create Account</button>
      </form>
    </div>
  );
}

export default CreateAccount;