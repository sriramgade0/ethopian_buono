import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Container, Row, Col, Card, Form, Button, Alert, Tab, Tabs } from 'react-bootstrap';
import './Auth.css';

const Auth = () => {
  const [activeTab, setActiveTab] = useState('signin');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signin, signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/signin', {
        email: formData.email,
        password: formData.password
      });

      signin(response.data.user, response.data.token);

      // Check if user has TDEE data
      const tdeeResponse = await axios.get('http://localhost:5000/api/tdee/details', {
        headers: { Authorization: `Bearer ${response.data.token}` }
      });

      if (tdeeResponse.data.tdee) {
        // User has TDEE data, go to meal planner
        navigate('/meal-planner');
      } else {
        // User doesn't have TDEE data, go to TDEE bot
        navigate('/tdee-bot');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Sign in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/signup', {
        username: formData.username,
        email: formData.email,
        password: formData.password
      });

      signup(response.data.user, response.data.token);

      // After signup, always go to TDEE bot
      navigate('/tdee-bot');
    } catch (err) {
      setError(err.response?.data?.error || 'Sign up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Container>
        <Row className="justify-content-center align-items-center min-vh-100">
          <Col md={6} lg={5}>
            <div className="text-center mb-4">
              <h1 className="auth-title">BUONO</h1>
              <p className="auth-subtitle">Your Personal Buono Meal Planner</p>
            </div>

            <Card className="auth-card">
              <Card.Body className="p-4">
                <Tabs
                  activeKey={activeTab}
                  onSelect={(k) => {
                    setActiveTab(k);
                    setError('');
                    setFormData({ username: '', email: '', password: '', confirmPassword: '' });
                  }}
                  className="mb-4"
                >
                  <Tab eventKey="signin" title="Sign In">
                    <Form onSubmit={handleSignIn}>
                      {error && <Alert variant="danger">{error}</Alert>}

                      <Form.Group className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="Enter your email"
                          required
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="Enter your password"
                          required
                        />
                      </Form.Group>

                      <Button
                        variant="success"
                        type="submit"
                        className="w-100 mt-3"
                        disabled={loading}
                      >
                        {loading ? 'Signing In...' : 'Sign In'}
                      </Button>
                    </Form>
                  </Tab>

                  <Tab eventKey="signup" title="Sign Up">
                    <Form onSubmit={handleSignUp}>
                      {error && <Alert variant="danger">{error}</Alert>}

                      <Form.Group className="mb-3">
                        <Form.Label>Username</Form.Label>
                        <Form.Control
                          type="text"
                          name="username"
                          value={formData.username}
                          onChange={handleChange}
                          placeholder="Choose a username"
                          required
                          minLength={3}
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="Enter your email"
                          required
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="Create a password"
                          required
                          minLength={6}
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>Confirm Password</Form.Label>
                        <Form.Control
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          placeholder="Confirm your password"
                          required
                        />
                      </Form.Group>

                      <Button
                        variant="success"
                        type="submit"
                        className="w-100 mt-3"
                        disabled={loading}
                      >
                        {loading ? 'Creating Account...' : 'Sign Up'}
                      </Button>
                    </Form>
                  </Tab>
                </Tabs>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Auth;
