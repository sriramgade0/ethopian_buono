import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import './BuonoBot.css';

const BuonoBot = () => {
  const [messages, setMessages] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [userData, setUserData] = useState({
    age: '',
    height: '',
    weight: '',
    gender: '',
    activityMode: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { token, user } = useAuth();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const initializedRef = useRef(false);

  const questions = useMemo(() => [
    {
      key: 'age',
      question: `Hi ${user?.username || 'there'}! I'm Buono Bot, your meal planning assistant. Let's get to know you better! What is your age?`,
      type: 'number',
      placeholder: 'Enter your age',
      validation: (value) => value >= 1 && value <= 120
    },
    {
      key: 'height',
      question: "Great! What is your height in centimeters?",
      type: 'number',
      placeholder: 'Enter your height in cm',
      validation: (value) => value >= 50 && value <= 300
    },
    {
      key: 'weight',
      question: "Perfect! What is your weight in kilograms?",
      type: 'number',
      placeholder: 'Enter your weight in kg',
      validation: (value) => value >= 20 && value <= 500
    },
    {
      key: 'gender',
      question: "Almost there! What is your gender?",
      type: 'choice',
      options: [
        { value: 'male', label: 'Male' },
        { value: 'female', label: 'Female' }
      ]
    },
    {
      key: 'activityMode',
      question: "Last question! What is your activity level?",
      type: 'choice',
      options: [
        { value: 'sedentary', label: 'Sedentary (Little or no exercise)' },
        { value: 'light', label: 'Light (Exercise 1-3 days/week)' },
        { value: 'moderate', label: 'Moderate (Exercise 3-5 days/week)' },
        { value: 'active', label: 'Active (Exercise 6-7 days/week)' },
        { value: 'very-active', label: 'Very Active (Very heavy exercise, physical job)' }
      ]
    }
  ], [user]);

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }

    // Add initial bot message only once
    if (!initializedRef.current) {
      initializedRef.current = true;
      addBotMessage(questions[0].question);
    }
  }, [token, navigate, questions]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addBotMessage = (message) => {
    setMessages(prev => [...prev, { type: 'bot', text: message }]);
  };

  const addUserMessage = (message) => {
    setMessages(prev => [...prev, { type: 'user', text: message }]);
  };

  const handleNumberInput = () => {
    const currentQuestion = questions[currentStep];
    const value = parseFloat(userInput);

    if (!userInput || isNaN(value)) {
      setError('Please enter a valid number');
      return;
    }

    if (currentQuestion.validation && !currentQuestion.validation(value)) {
      setError(`Please enter a valid ${currentQuestion.key}`);
      return;
    }

    setError('');
    addUserMessage(userInput);
    setUserData({ ...userData, [currentQuestion.key]: value });
    setUserInput('');

    setTimeout(() => {
      if (currentStep < questions.length - 1) {
        setCurrentStep(currentStep + 1);
        addBotMessage(questions[currentStep + 1].question);
      }
    }, 500);
  };

  const handleChoiceInput = (value, label) => {
    const currentQuestion = questions[currentStep];

    addUserMessage(label);
    setUserData({ ...userData, [currentQuestion.key]: value });

    setTimeout(() => {
      if (currentStep < questions.length - 1) {
        setCurrentStep(currentStep + 1);
        addBotMessage(questions[currentStep + 1].question);
      } else {
        // All questions answered, save TDEE data
        saveTDEEData({ ...userData, [currentQuestion.key]: value });
      }
    }, 500);
  };

  const saveTDEEData = async (completeData) => {
    setLoading(true);
    addBotMessage("Great! Let me calculate your TDEE...");

    try {
      const response = await axios.post(
        'http://localhost:5000/api/tdee/save',
        completeData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const { bmr, calculatedTDEE } = response.data.tdee;

      setTimeout(() => {
        addBotMessage(
          `Excellent! Your BMR is ${bmr} calories and your TDEE is ${calculatedTDEE} calories per day. This will help me create personalized meal plans for you!`
        );

        setTimeout(() => {
          addBotMessage("Click 'Continue to Meal Planner' to start planning your meals!");
          setCurrentStep(questions.length); // Mark as complete
          setLoading(false);
        }, 1000);
      }, 1000);
    } catch (err) {
      setError('Failed to save TDEE data. Please try again.');
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (questions[currentStep].type === 'number') {
      handleNumberInput();
    }
  };

  const isComplete = currentStep >= questions.length && !loading;
  const currentQuestion = questions[currentStep];

  return (
    <div className="buono-bot-page">
      <Container fluid className="h-100">
        <Row className="justify-content-center align-items-center h-100">
          <Col md={8} lg={6} className="py-4">
            <Card className="bot-card">
              <Card.Header className="bot-header">
                <h4 className="mb-0">Buono Bot</h4>
                <small>Let's personalize your meal plan</small>
              </Card.Header>

              <Card.Body className="bot-messages">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`message ${message.type === 'bot' ? 'bot-message' : 'user-message'}`}
                  >
                    <div className="message-content">
                      {message.text}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="message bot-message">
                    <div className="message-content typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </Card.Body>

              <Card.Footer className="bot-footer">
                {error && <Alert variant="danger" className="mb-2">{error}</Alert>}

                {!isComplete && currentQuestion && (
                  <>
                    {currentQuestion.type === 'number' && (
                      <Form onSubmit={handleSubmit}>
                        <div className="d-flex gap-2">
                          <Form.Control
                            type="number"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder={currentQuestion.placeholder}
                            disabled={loading}
                          />
                          <Button type="submit" variant="success" disabled={loading}>
                            Send
                          </Button>
                        </div>
                      </Form>
                    )}

                    {currentQuestion.type === 'choice' && (
                      <div className="choice-buttons">
                        {currentQuestion.options.map((option) => (
                          <Button
                            key={option.value}
                            variant="outline-success"
                            className="choice-btn"
                            onClick={() => handleChoiceInput(option.value, option.label)}
                            disabled={loading}
                          >
                            {option.label}
                          </Button>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {isComplete && (
                  <Button
                    variant="success"
                    className="w-100"
                    onClick={() => navigate('/meal-planner')}
                  >
                    Continue to Meal Planner
                  </Button>
                )}
              </Card.Footer>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default BuonoBot;
