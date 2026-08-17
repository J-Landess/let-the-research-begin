import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Analytics } from '@vercel/analytics/react';
import './styles/theme.css';
import './styles/navbar.css';
import ErrorBoundary from './components/ErrorBoundary';
import Register from './components/Register';
import Login from './components/Login';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Payment from './pages/Payment';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Router>
        <div className="App">
          <AnimatePresence mode="wait">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected Routes with Layout */}
              <Route 
                path="/home" 
                element={
                  <PrivateRoute>
                    <Layout />
                  </PrivateRoute>
                } 
              >
                <Route index element={<Home />} />
              </Route>
              
              <Route 
                path="/about" 
                element={
                  <PrivateRoute>
                    <Layout />
                  </PrivateRoute>
                } 
              >
                <Route index element={<About />} />
              </Route>
              
              <Route 
                path="/contact" 
                element={
                  <PrivateRoute>
                    <Layout />
                  </PrivateRoute>
                } 
              >
                <Route index element={<Contact />} />
              </Route>
              
              <Route 
                path="/payment" 
                element={
                  <PrivateRoute>
                    <Layout />
                  </PrivateRoute>
                } 
              >
                <Route index element={<Payment />} />
              </Route>
            </Routes>
          </AnimatePresence>
        </div>
        <Analytics />
      </Router>
    </ErrorBoundary>
  );
};

export default App;