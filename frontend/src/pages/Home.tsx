import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { authAPI, User, getUserErrorMessage } from '../api/api';

const Home: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await authAPI.getMe();
        setUser(userData);
      } catch (err: any) {
        setError(getUserErrorMessage(
          err,
          'Failed to load your profile. Your session may have expired — try logging in again.'
        ));
        console.error('Error fetching user:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="container"
    >
      {/* Welcome Section */}
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
          Welcome, {user?.name}!
        </h1>
        
        <p style={{ 
          fontSize: '1.5rem', 
          marginBottom: '30px',
          color: 'var(--text-secondary)'
        }}>
          from Wiseman Psychedelics
        </p>

        {user?.is_subscribed && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
            className="badge"
            style={{ fontSize: '1.2rem', padding: '15px 30px' }}
          >
            ✨ Subscribed to the Wiseman Newsletter ✨
          </motion.div>
        )}
      </motion.div>

      {/* Consciousness Resources Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card"
        style={{ marginTop: '30px' }}
      >
        <h2 style={{ 
          textAlign: 'center', 
          marginBottom: '30px',
          color: 'var(--neon-magenta)',
          textShadow: 'var(--glow-magenta)',
          fontSize: '2rem'
        }}>
          Consciousness Research & Resources
        </h2>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '20px',
          marginBottom: '30px'
        }}>
          {/* Video 1 */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="card video-card"
            style={{ padding: '20px', textAlign: 'center' }}
          >
            <h3 style={{ color: 'var(--neon-lime)', marginBottom: '15px' }}>
              Consciousness Research Video 1
            </h3>
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
              <iframe
                src="https://www.youtube.com/embed/Lf0YfMX_MFk"
                title="Consciousness Research Video 1"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  borderRadius: '10px'
                }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <p style={{ marginTop: '15px', color: 'var(--text-secondary)' }}>
              Exploring consciousness and awareness through scientific research.
            </p>
          </motion.div>

          {/* Video 2 */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="card video-card"
            style={{ padding: '20px', textAlign: 'center' }}
          >
            <h3 style={{ color: 'var(--neon-cyan)', marginBottom: '15px' }}>
              Consciousness Research Video 2
            </h3>
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
              <iframe
                src="https://www.youtube.com/embed/kxFTWk9lLDU?start=2992"
                title="Consciousness Research Video 2"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  borderRadius: '10px'
                }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <p style={{ marginTop: '15px', color: 'var(--text-secondary)' }}>
              Deep dive into consciousness studies and research findings.
            </p>
          </motion.div>

          {/* Video 3 */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="card video-card"
            style={{ padding: '20px', textAlign: 'center' }}
          >
            <h3 style={{ color: 'var(--neon-purple)', marginBottom: '15px' }}>
              Consciousness Research Video 3
            </h3>
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
              <iframe
                src="https://www.youtube.com/embed/fwZqVqbkyLM"
                title="Consciousness Research Video 3"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  borderRadius: '10px'
                }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <p style={{ marginTop: '15px', color: 'var(--text-secondary)' }}>
              Advanced research on consciousness and mind exploration.
            </p>
          </motion.div>
        </div>

        {/* Research Links */}
        <div style={{ marginTop: '30px' }}>
          <h3 style={{ 
            color: 'var(--neon-lime)', 
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            Additional Resources
          </h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '15px' 
          }}>
            <a 
              href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4813425/" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                display: 'block',
                padding: '15px',
                background: 'rgba(0, 240, 255, 0.1)',
                border: '1px solid rgba(0, 240, 255, 0.3)',
                borderRadius: '10px',
                color: 'var(--text-primary)',
                textDecoration: 'none',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0, 240, 255, 0.2)';
                e.currentTarget.style.boxShadow = 'var(--glow-cyan)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(0, 240, 255, 0.1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <strong>Psychedelics and Consciousness Research</strong>
              <br />
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Scientific studies on psychedelic substances
              </span>
            </a>

            <a 
              href="https://www.frontiersin.org/articles/10.3389/fpsyg.2014.00809/full" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                display: 'block',
                padding: '15px',
                background: 'rgba(255, 0, 255, 0.1)',
                border: '1px solid rgba(255, 0, 255, 0.3)',
                borderRadius: '10px',
                color: 'var(--text-primary)',
                textDecoration: 'none',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 0, 255, 0.2)';
                e.currentTarget.style.boxShadow = 'var(--glow-magenta)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 0, 255, 0.1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <strong>Consciousness and the Brain</strong>
              <br />
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Neuroscience research on consciousness
              </span>
            </a>

            <a 
              href="https://www.consciousness.arizona.edu/" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                display: 'block',
                padding: '15px',
                background: 'rgba(57, 255, 20, 0.1)',
                border: '1px solid rgba(57, 255, 20, 0.3)',
                borderRadius: '10px',
                color: 'var(--text-primary)',
                textDecoration: 'none',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(57, 255, 20, 0.2)';
                e.currentTarget.style.boxShadow = 'var(--glow-lime)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(57, 255, 20, 0.1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <strong>Center for Consciousness Studies</strong>
              <br />
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                University of Arizona research center
              </span>
            </a>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Home;
