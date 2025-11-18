import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import ShoppingList from './ShoppingList';

const MealPlanner = () => {
  const [dietType, setDietType] = useState('veg');
  const [goal, setGoal] = useState('muscle-gain');
  const [days, setDays] = useState(7);
  const [mealPlan, setMealPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentDay, setCurrentDay] = useState(1);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [tdeeData, setTdeeData] = useState(null);
  const [showShoppingList, setShowShoppingList] = useState(false);

  const { user, token, signout } = useAuth();
  const navigate = useNavigate();

  // Fetch TDEE data on component mount
  useEffect(() => {
    const fetchTDEE = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/tdee/details', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTdeeData(response.data.tdee);
      } catch (err) {
        console.error('Failed to fetch TDEE data:', err);
      }
    };

    if (token) {
      fetchTDEE();
    }
  }, [token]);

  const handleLogout = () => {
    signout();
    navigate('/');
  };

  const generateMealPlan = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('http://localhost:5000/api/meal-plans/generate', {
        dietType,
        goal,
        days: parseInt(days)
      });
      
      setMealPlan(response.data.mealPlan);
    } catch (err) {
      setError('Failed to generate meal plan. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
      setCurrentDay(1); // Reset to day 1 when generating new meal plan
    }
  };

  const getMealTypeIcon = (mealType) => {
    switch(mealType) {
      case 'breakfast':
        return '🌅';
      case 'lunch':
        return '🍽️';
      case 'dinner':
        return '🌙';
      case 'snack':
        return '🍎';
      default:
        return '🍽️';
    }
  };

  const handleMealClick = (meal, mealType) => {
    setSelectedMeal({ ...meal, mealType });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedMeal(null);
  };

  return (
    <>
      {/* Header with user info and logout */}
      <header className="app-header bg-success text-white py-3 mb-4">
        <Container fluid className="px-5">
          <Row className="align-items-center">
            <Col md={6}>
              <h2 className="mb-0">BUONO</h2>
              <small>Welcome back, {user?.username}!</small>
            </Col>
            <Col md={6} className="text-md-end">
              {tdeeData && (
                <div className="d-inline-block me-3 text-end">
                  <small className="d-block">Your TDEE: <strong>{tdeeData.calculatedTDEE} cal/day</strong></small>
                  <small className="d-block">BMR: {tdeeData.bmr} cal/day</small>
                </div>
              )}
              <Button variant="light" size="sm" onClick={() => navigate('/tdee-bot')} className="me-2">
                Update TDEE
              </Button>
              <Button variant="outline-light" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </Col>
          </Row>
        </Container>
      </header>

      <Container fluid className="px-5">
        <Card className="shadow-sm mb-4 meal-planner-container">
        <Card.Header className="bg-white">
          <h3 className="mb-0 text-success">Buono Meal Planner</h3>
          <p className="text-muted mb-0">Customize your meal plan based on your dietary preferences</p>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={3}>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Diet Type</Form.Label>
                  <Form.Select 
                    value={dietType} 
                    onChange={(e) => setDietType(e.target.value)}
                    className="bg-light"
                  >
                    <option value="veg">Vegetarian</option>
                    <option value="non-veg">Non-Vegetarian</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Goal</Form.Label>
                  <Form.Select 
                    value={goal} 
                    onChange={(e) => setGoal(e.target.value)}
                    className="bg-light"
                  >
                    <option value="muscle-gain">Muscle Gain</option>
                    <option value="weight-loss">Weight Loss</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Number of Days</Form.Label>
                  <Form.Select 
                    value={days} 
                    onChange={(e) => setDays(e.target.value)}
                    className="bg-light"
                  >
                    {[...Array(14)].map((_, i) => (
                      <option key={i+1} value={i+1}>{i+1} Day{((i+1) > 1) ? 's' : ''}</option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Button 
                  variant="success" 
                  onClick={generateMealPlan}
                  disabled={loading}
                  className="w-100"
                >
                  {loading ? 'Generating...' : 'Generate Meal Plan'}
                </Button>
              </Form>
            </Col>

            <Col md={9}>
              {error && <Alert variant="danger">{error}</Alert>}
              
              {mealPlan ? (
                <div className="meal-plan-wrapper">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4 className="text-success mb-0">Your Buono Meal Plan</h4>
                    <Button
                      variant="success"
                      onClick={() => setShowShoppingList(true)}
                      className="d-flex align-items-center gap-2"
                    >
                      <span>🛒</span>
                      Generate Shopping List
                    </Button>
                  </div>
                  <div className="d-flex justify-content-center align-items-center mb-5">
                    <div className="d-flex align-items-center gap-2">
                      <Button
                        variant="outline-success"
                        onClick={() => setCurrentDay(Math.max(1, currentDay - 1))}
                        disabled={currentDay === 1}
                      >
                        ← Previous
                      </Button>
                      <span className="mx-3">
                        <strong>Day {currentDay} of {mealPlan.length}</strong>
                      </span>
                      <Button
                        variant="outline-success"
                        onClick={() => setCurrentDay(Math.min(mealPlan.length, currentDay + 1))}
                        disabled={currentDay === mealPlan.length}
                      >
                        Next →
                      </Button>
                    </div>
                  </div>

                  {mealPlan.filter((dayPlan) => dayPlan.day === currentDay).map((dayPlan) => (
                    <div key={dayPlan.day} className="py-3">
                      <h5 className="mb-5 text-center">Day {dayPlan.day} - Click on a meal to view details</h5>
                      <Row className="justify-content-center" style={{ rowGap: '1rem', columnGap: '1rem' }}>
                        {Object.keys(dayPlan.meals).map((mealType) => (
                          dayPlan.meals[mealType] && (
                            <Col key={mealType} xs={12} sm={6} md={4} lg={3} xl={3} className="mb-2 px-2">
                              <div
                                className="meal-type-card"
                                onClick={() => handleMealClick(dayPlan.meals[mealType], mealType)}
                                style={{ cursor: 'pointer' }}
                              >
                                <div className="meal-card-image-section">
                                  {dayPlan.meals[mealType].image ? (
                                    <img
                                      src={`/images/${dayPlan.meals[mealType].image}`}
                                      alt={dayPlan.meals[mealType].name}
                                      className="meal-card-bg-image"
                                    />
                                  ) : (
                                    <div className="meal-card-no-image">
                                      <span style={{ fontSize: '5rem', opacity: 0.3 }}>{getMealTypeIcon(mealType)}</span>
                                    </div>
                                  )}
                                  <div className="meal-card-image-overlay">
                                    <div className="meal-card-hover-text">Click to view full recipe</div>
                                  </div>
                                </div>
                                <div className="meal-card-info-section">
                                  <div className="meal-type-badge">
                                    <span className="meal-badge-icon">{getMealTypeIcon(mealType)}</span>
                                    <span className="meal-badge-text">{mealType.charAt(0).toUpperCase() + mealType.slice(1)}</span>
                                  </div>
                                  <h5 className="meal-card-dish-name">{dayPlan.meals[mealType].name}</h5>
                                  <div className="meal-card-calories-badge">{dayPlan.meals[mealType].calories} calories</div>
                                </div>
                              </div>
                            </Col>
                          )
                        ))}
                      </Row>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-5">
                  <div className="mb-4">
                    <span style={{fontSize: '4rem', color: '#4CAF50'}}>🍽️</span>
                  </div>
                  <h4 className="text-muted">Generate Your Buono Meal Plan</h4>
                  <p className="text-muted">
                    Select your preferences and click "Generate Meal Plan" to create your personalized meal plan.
                  </p>
                  <p className="text-muted">
                    Our meal planner will generate traditional dishes tailored to your dietary needs and fitness goals.
                  </p>
                </div>
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Modal for displaying meal details */}
      <Modal show={showModal} onHide={handleCloseModal} size="xl" centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="d-flex align-items-center gap-2">
            <span style={{ fontSize: '2rem' }}>{selectedMeal && getMealTypeIcon(selectedMeal.mealType)}</span>
            <span>{selectedMeal && selectedMeal.name}</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedMeal && (
            <div>
              <div className="d-flex justify-content-between align-items-start mb-4">
                <div className="flex-grow-1">
                  {selectedMeal.image && (
                    <div className="text-center mb-4">
                      <img
                        src={`/images/${selectedMeal.image}`}
                        alt={selectedMeal.name}
                        style={{
                          width: '100%',
                          maxWidth: '700px',
                          height: 'auto',
                          objectFit: 'cover',
                          borderRadius: '16px'
                        }}
                        className="recipe-image-modal"
                      />
                    </div>
                  )}
                  <p className="text-muted lead">{selectedMeal.description}</p>
                  <div className="d-flex gap-4 mb-4 justify-content-center">
                    <div className="text-center">
                      <div className="fw-bold text-success">⏱️ Prep Time</div>
                      <div>{selectedMeal.prepTime} min</div>
                    </div>
                    <div className="text-center">
                      <div className="fw-bold text-success">🍳 Cook Time</div>
                      <div>{selectedMeal.cookTime} min</div>
                    </div>
                    <div className="text-center">
                      <div className="fw-bold text-success">🍽️ Servings</div>
                      <div>{selectedMeal.servings}</div>
                    </div>
                  </div>
                </div>
              </div>

              <Card className="mb-4 bg-light border-0">
                <Card.Body>
                  <h5 className="text-success mb-3">Nutritional Information</h5>
                  <Row>
                    <Col xs={3} className="text-center">
                      <div className="fw-bold" style={{ fontSize: '1.5rem', color: '#2e7d32' }}>{selectedMeal.calories}</div>
                      <small className="text-muted">Calories</small>
                    </Col>
                    <Col xs={3} className="text-center">
                      <div className="fw-bold" style={{ fontSize: '1.5rem', color: '#2e7d32' }}>{selectedMeal.protein}g</div>
                      <small className="text-muted">Protein</small>
                    </Col>
                    <Col xs={3} className="text-center">
                      <div className="fw-bold" style={{ fontSize: '1.5rem', color: '#2e7d32' }}>{selectedMeal.carbs}g</div>
                      <small className="text-muted">Carbs</small>
                    </Col>
                    <Col xs={3} className="text-center">
                      <div className="fw-bold" style={{ fontSize: '1.5rem', color: '#2e7d32' }}>{selectedMeal.fats}g</div>
                      <small className="text-muted">Fats</small>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              <h5 className="text-success mb-3">Ingredients</h5>
              <ul className="list-unstyled mb-4">
                {selectedMeal.ingredients.map((ingredient, idx) => (
                  <li key={idx} className="mb-2">
                    <i className="text-success me-2">✓</i>
                    {ingredient}
                  </li>
                ))}
              </ul>

              <h5 className="text-success mb-3">Instructions</h5>
              <ol>
                {selectedMeal.instructions.map((instruction, idx) => (
                  <li key={idx} className="mb-3">{instruction}</li>
                ))}
              </ol>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="success" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Shopping List Modal */}
      <ShoppingList
        show={showShoppingList}
        onHide={() => setShowShoppingList(false)}
        mealPlan={mealPlan}
        dietType={dietType}
        goal={goal}
        days={days}
      />
      </Container>
    </>
  );
};

export default MealPlanner;