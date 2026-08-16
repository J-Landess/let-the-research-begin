import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authAPI, UserCreate, getUserErrorMessage } from '../api/api';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<UserCreate>({
    name: '',
    age: 18,
    email: '',
    password: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    is_subscribed: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox'
        ? checked
        : name === 'age'
          ? Number(value)
          : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Client-side validation
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }
    
    if (formData.password.length > 72) {
      setError('Password cannot be longer than 72 characters.');
      setLoading(false);
      return;
    }
    
    if (formData.age < 18 || formData.age > 120) {
      setError('Age must be between 18 and 120 years.');
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.register(formData);
      localStorage.setItem('token', response.access_token);
      navigate('/home');
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(getUserErrorMessage(
        err,
        'Registration failed. Check that your email is valid, you are 18 or older, and your password is 6–72 characters.'
      ));
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="container"
      style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <div className="card" style={{ maxWidth: '600px', width: '100%' }}>
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{ 
            textAlign: 'center', 
            marginBottom: '30px',
            color: 'var(--neon-cyan)',
            fontSize: '2.5rem'
          }}
        >
          Join Wiseman Psychedelics
        </motion.h1>

        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div className="form-group">
              <label className="form-label">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="form-input"
                required
                placeholder="Enter your full name"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Age</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                className="form-input"
                min="18"
                max="120"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-input"
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="form-input"
              required
              placeholder="Create a password"
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter your phone number"
            />
          </div>

          <h3 style={{ color: 'var(--neon-magenta)', margin: '30px 0 20px 0', textAlign: 'center' }}>
            Mailing Address
          </h3>

          <div className="form-group">
            <label className="form-label">Street Address</label>
            <input
              type="text"
              name="street"
              value={formData.street}
              onChange={handleChange}
              className="form-input"
              placeholder="Enter street address"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div className="form-group">
              <label className="form-label">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="form-input"
                placeholder="City"
              />
            </div>
            <div className="form-group">
              <label className="form-label">State</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="form-input"
                placeholder="State"
              />
            </div>
            <div className="form-group">
              <label className="form-label">ZIP</label>
              <input
                type="text"
                name="zip"
                value={formData.zip}
                onChange={handleChange}
                className="form-input"
                placeholder="ZIP"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Country</label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="form-input"
              placeholder="Country"
            />
          </div>

          <div className="form-group" style={{ marginTop: '30px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="is_subscribed"
                checked={formData.is_subscribed}
                onChange={handleChange}
                style={{ transform: 'scale(1.2)' }}
              />
              <span className="form-label" style={{ margin: 0 }}>
                Subscribe to the Wiseman Newsletter
              </span>
            </label>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', marginTop: '20px' }}
          >
            {loading ? <div className="spinner" style={{ margin: '0 auto' }} /> : 'Register'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <p style={{ color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--neon-cyan)', textDecoration: 'none' }}>
              Login here
            </Link>
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default Register;
