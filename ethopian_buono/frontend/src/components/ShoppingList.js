import React, { useState, useCallback } from 'react';
import { Modal, Button, Form, Card, Badge, Row, Col, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './ShoppingList.css';

const ShoppingList = ({ show, onHide, mealPlan, dietType, goal, days }) => {
  const [shoppingList, setShoppingList] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const { token } = useAuth();

  const generateShoppingList = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        'http://localhost:5000/api/shopping-lists/generate',
        {
          mealPlan,
          dietType,
          goal,
          days
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setShoppingList(response.data.shoppingList);
    } catch (err) {
      setError('Failed to generate shopping list. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [mealPlan, dietType, goal, days, token]);

  const toggleItem = async (itemId) => {
    if (actionLoading) return;

    try {
      const listId = shoppingList.id || shoppingList._id;
      const response = await axios.put(
        `http://localhost:5000/api/shopping-lists/${listId}/toggle-item`,
        { itemId },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Update with the returned shoppingList, preserving the id field
      setShoppingList({
        ...response.data.shoppingList,
        id: listId
      });
    } catch (err) {
      console.error('Failed to toggle item:', err);
      setError('Failed to update item. Please try again.');
    }
  };

  const clearCheckedItems = async () => {
    if (actionLoading) return;
    setActionLoading(true);

    try {
      const listId = shoppingList.id || shoppingList._id;
      const response = await axios.put(
        `http://localhost:5000/api/shopping-lists/${listId}/clear-checked`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Update with the returned shoppingList, preserving the id field
      setShoppingList({
        ...response.data.shoppingList,
        id: listId
      });
    } catch (err) {
      console.error('Failed to clear checked items:', err);
      setError('Failed to clear items. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Group items by category
  const groupedItems = shoppingList?.items?.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  // Category emoji mapping
  const categoryEmojis = {
    'Vegetables': '🥬',
    'Proteins': '🥩',
    'Spices': '🌶️',
    'Legumes': '🥫',
    'Grains': '🌾',
    'Dairy': '🧈',
    'Other': '📦'
  };

  React.useEffect(() => {
    if (show && !shoppingList) {
      generateShoppingList();
    }
  }, [show, shoppingList, generateShoppingList]);

  // Calculate stats
  const totalItems = shoppingList?.items?.length || 0;
  const checkedItems = shoppingList?.items?.filter(item => item.checked).length || 0;
  const progressPercentage = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;

  return (
    <Modal show={show} onHide={onHide} size="lg" centered className="shopping-list-modal">
      <Modal.Header closeButton className="border-0">
        <div className="w-100">
          <Modal.Title>
            <span className="me-2">🛒</span>
            Shopping List
          </Modal.Title>
          {shoppingList && (
            <div className="progress-stats mt-2">
              <small className="text-white">
                <strong>{checkedItems}</strong> of <strong>{totalItems}</strong> items collected ({progressPercentage}%)
              </small>
              <div className="progress mt-1" style={{ height: '6px', background: 'rgba(255,255,255,0.3)' }}>
                <div
                  className="progress-bar"
                  role="progressbar"
                  style={{
                    width: `${progressPercentage}%`,
                    background: 'linear-gradient(90deg, #fff, #f0fff4)',
                    transition: 'width 0.5s ease'
                  }}
                  aria-valuenow={progressPercentage}
                  aria-valuemin="0"
                  aria-valuemax="100"
                />
              </div>
            </div>
          )}
        </div>
      </Modal.Header>

      <Modal.Body>
        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border text-success" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3 text-muted">Generating your shopping list...</p>
          </div>
        )}

        {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

        {shoppingList && !loading && (
          <>
            <div className="mb-4 info-banner">
              <Row className="g-2">
                <Col xs={4} className="text-center">
                  <div className="info-card">
                    <div className="info-icon">🥗</div>
                    <div className="info-label">Diet</div>
                    <div className="info-value">{dietType === 'veg' ? 'Vegetarian' : 'Non-Veg'}</div>
                  </div>
                </Col>
                <Col xs={4} className="text-center">
                  <div className="info-card">
                    <div className="info-icon">🎯</div>
                    <div className="info-label">Goal</div>
                    <div className="info-value">{goal === 'muscle-gain' ? 'Muscle' : 'Weight Loss'}</div>
                  </div>
                </Col>
                <Col xs={4} className="text-center">
                  <div className="info-card">
                    <div className="info-icon">📅</div>
                    <div className="info-label">Duration</div>
                    <div className="info-value">{days} Days</div>
                  </div>
                </Col>
              </Row>
              <p className="text-center text-muted mt-3 mb-0">
                <small>📝 Generated on {new Date(shoppingList.generatedDate).toLocaleDateString()}</small>
              </p>
            </div>

            <div className="shopping-list-categories">
              {Object.entries(groupedItems || {}).map(([category, items]) => (
                <Card key={category} className="mb-3 category-card">
                  <Card.Header className="bg-light">
                    <h5 className="mb-0">
                      <span className="me-2">{categoryEmojis[category] || '📦'}</span>
                      {category}
                      <Badge bg="secondary" className="ms-2">
                        {items.filter(i => !i.checked).length}/{items.length}
                      </Badge>
                    </h5>
                  </Card.Header>
                  <Card.Body>
                    {items.map((item) => (
                      <Form.Check
                        key={item._id}
                        type="checkbox"
                        id={`item-${item._id}`}
                        className="shopping-list-item mb-2"
                      >
                        <Form.Check.Input
                          type="checkbox"
                          checked={item.checked}
                          onChange={() => toggleItem(item._id)}
                        />
                        <Form.Check.Label
                          className={item.checked ? 'text-decoration-line-through text-muted' : ''}
                        >
                          {item.ingredient}
                        </Form.Check.Label>
                      </Form.Check>
                    ))}
                  </Card.Body>
                </Card>
              ))}
            </div>

            {shoppingList.items?.some(item => item.checked) && (
              <div className="text-center mt-3">
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={clearCheckedItems}
                  disabled={actionLoading}
                  className="clear-checked-btn"
                >
                  {actionLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Clearing...
                    </>
                  ) : (
                    <>
                      🗑️ Clear Checked Items ({checkedItems})
                    </>
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </Modal.Body>

      <Modal.Footer className="border-0 d-flex justify-content-between">
        <div>
          {shoppingList && totalItems > 0 && (
            <small className="text-muted">
              💡 Tip: Print or screenshot for easy shopping!
            </small>
          )}
        </div>
        <div className="d-flex gap-2">
          {shoppingList && (
            <Button variant="outline-success" onClick={handlePrint} className="action-btn">
              🖨️ Print
            </Button>
          )}
          <Button variant="success" onClick={onHide} className="action-btn">
            ✅ Done
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default ShoppingList;
