import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { getUserErrorMessage } from '../api/api';

interface ContactForm {
  name: string;
  email: string;
  message: string;
}

const Contact: React.FC = () => {
  const [formData, setFormData] = useState<ContactForm>({
    name: '',
    email: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Simulate API call - replace with actual endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSubmitted(true);
      setFormData({ name: '', email: '', message: '' });
    } catch (err: any) {
      setError(getUserErrorMessage(
        err,
        'Failed to send your message. Please try again in a moment.'
      ));
      console.error('Contact form error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="container"
        style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <motion.div
          className="card"
          style={{ textAlign: 'center', maxWidth: '500px' }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(45deg, var(--neon-lime), var(--neon-cyan))',
              borderRadius: '50%',
              margin: '0 auto 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              boxShadow: 'var(--glow-lime)'
            }}
          >
            ✓
          </motion.div>
          
          <h1 style={{ 
            color: 'var(--neon-cyan)', 
            textShadow: 'var(--glow-cyan)',
            marginBottom: '20px',
            fontSize: '2rem'
          }}>
            Message Sent!
          </h1>
          
          <p style={{ 
            color: 'var(--text-secondary)',
            marginBottom: '30px',
            fontSize: '1.1rem'
          }}>
            Thank you for reaching out. We'll get back to you as soon as possible.
          </p>
          
          <motion.button
            className="btn btn-primary"
            onClick={() => setSubmitted(false)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Send Another Message
          </motion.button>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="container"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card"
        style={{ textAlign: 'center', marginTop: '50px' }}
      >
        <h1 style={{ 
          fontSize: '3rem', 
          marginBottom: '20px',
          color: 'var(--neon-cyan)',
          textShadow: 'var(--glow-cyan)'
        }}>
          Contact Us
        </h1>
        
        <p style={{ 
          fontSize: '1.2rem', 
          color: 'var(--text-secondary)',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          Have questions about consciousness research? Want to collaborate? 
          We'd love to hear from you.
        </p>
      </motion.div>

      {/* Contact Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card"
        style={{ marginTop: '30px', maxWidth: '600px', margin: '30px auto 0' }}
      >
        <h2 style={{ 
          color: 'var(--neon-magenta)', 
          textShadow: 'var(--glow-magenta)',
          marginBottom: '30px',
          fontSize: '1.8rem',
          textAlign: 'center'
        }}>
          Send us a Message
        </h2>

        {error && <div className="error" style={{ marginBottom: '20px' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="form-input"
              required
              placeholder="Your full name"
            />
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
              placeholder="your.email@example.com"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Message</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              className="form-input"
              required
              rows={6}
              placeholder="Tell us about your interest in consciousness research, collaboration ideas, or any questions you might have..."
              style={{ 
                resize: 'vertical',
                minHeight: '120px',
                fontFamily: 'inherit'
              }}
            />
          </div>

          <motion.button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', marginTop: '20px' }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <div className="spinner" style={{ margin: 0, width: '20px', height: '20px' }} />
                Sending...
              </div>
            ) : (
              'Send Message'
            )}
          </motion.button>
        </form>
      </motion.div>

      {/* Contact Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="card"
        style={{ marginTop: '30px', marginBottom: '50px' }}
      >
        <h2 style={{ 
          color: 'var(--neon-lime)', 
          textShadow: 'var(--glow-lime)',
          marginBottom: '20px',
          fontSize: '1.8rem',
          textAlign: 'center'
        }}>
          Other Ways to Connect
        </h2>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '20px',
          marginTop: '20px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '60px',
              height: '60px',
              background: 'linear-gradient(45deg, var(--neon-cyan), var(--neon-blue))',
              borderRadius: '50%',
              margin: '0 auto 15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              boxShadow: 'var(--glow-cyan)'
            }}>
              📧
            </div>
            <h3 style={{ color: 'var(--neon-cyan)', marginBottom: '10px' }}>Email</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              info@wisemanpsychedelics.com
            </p>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '60px',
              height: '60px',
              background: 'linear-gradient(45deg, var(--neon-magenta), var(--neon-purple))',
              borderRadius: '50%',
              margin: '0 auto 15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              boxShadow: 'var(--glow-magenta)'
            }}>
              🌐
            </div>
            <h3 style={{ color: 'var(--neon-magenta)', marginBottom: '10px' }}>Research</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Follow our latest research updates
            </p>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '60px',
              height: '60px',
              background: 'linear-gradient(45deg, var(--neon-lime), var(--neon-cyan))',
              borderRadius: '50%',
              margin: '0 auto 15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              boxShadow: 'var(--glow-lime)'
            }}>
              👥
            </div>
            <h3 style={{ color: 'var(--neon-lime)', marginBottom: '10px' }}>Community</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Join our consciousness research community
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Contact;
