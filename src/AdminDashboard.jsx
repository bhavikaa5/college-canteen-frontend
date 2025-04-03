import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dishes');
  const [dishes, setDishes] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingDish, setEditingDish] = useState(null);
  const [newDish, setNewDish] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    category: ''
  });

  useEffect(() => {
    if (activeTab === 'dishes') {
      fetchDishes();
    } else if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab]);

  const fetchDishes = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/dishes`);
      const data = await response.json();
      setDishes(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dishes:', error);
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders`);
      const data = await response.json();
      setOrders(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (editingDish) {
      setEditingDish({
        ...editingDish,
        [name]: name === 'price' ? parseFloat(value) : value
      });
    } else {
      setNewDish({
        ...newDish,
        [name]: name === 'price' ? parseFloat(value) : value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDish) {
        // Update existing dish
        await fetch(`${import.meta.env.VITE_API_URL}/api/dishes/${editingDish._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(editingDish)
        });
        setEditingDish(null);
      } else {
        // Create new dish
        await fetch(`${import.meta.env.VITE_API_URL}/api/dishes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newDish)
        });
        
        // Reset form
        setNewDish({
          name: '',
          description: '',
          price: '',
          image: '',
          category: ''
        });
      }
      
      // Refresh dishes
      fetchDishes();
    } catch (error) {
      console.error('Error saving dish:', error);
      alert('Failed to save dish. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this dish?')) {
      return;
    }
    
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/dishes/${id}`, {
        method: 'DELETE'
      });
      
      // Refresh dishes
      fetchDishes();
    } catch (error) {
      console.error('Error deleting dish:', error);
      alert('Failed to delete dish. Please try again.');
    }
  };

  const updateOrderStatus = async (id, status) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/orders/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      
      // Refresh orders
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const resetForm = () => {
    setEditingDish(null);
    setNewDish({
      name: '',
      description: '',
      price: '',
      image: '',
      category: ''
    });
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <div className="admin-tabs">
          <button 
            className={`tab-button ${activeTab === 'dishes' ? 'active' : ''}`}
            onClick={() => setActiveTab('dishes')}
          >
            Manage Menu
          </button>
          <button 
            className={`tab-button ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            Orders
          </button>
        </div>
      </div>

      <div className="admin-content">
        {activeTab === 'dishes' && (
          <div className="dishes-management">
            <h2>{editingDish ? 'Edit Dish' : 'Add New Dish'}</h2>
            <form onSubmit={handleSubmit} className="dish-form">
              <div className="form-group">
                <label htmlFor="name">Dish Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={editingDish ? editingDish.name : newDish.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={editingDish ? editingDish.description : newDish.description}
                  onChange={handleInputChange}
                  required
                ></textarea>
              </div>
              
              <div className="form-group">
                <label htmlFor="price">Price ($)</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  step="0.01"
                  value={editingDish ? editingDish.price : newDish.price}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="category">Category</label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  value={editingDish ? editingDish.category : newDish.category}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="image">Image URL</label>
                <input
                  type="text"
                  id="image"
                  name="image"
                  value={editingDish ? editingDish.image : newDish.image}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-actions">
                <button type="submit" className="save-button">
                  {editingDish ? 'Update Dish' : 'Add Dish'}
                </button>
                {editingDish && (
                  <button 
                    type="button" 
                    className="cancel-button"
                    onClick={resetForm}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>

            <h2>Menu Items</h2>
            {loading ? (
              <div className="loading">Loading dishes...</div>
            ) : (
              <div className="dishes-list">
                <table>
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Name</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dishes.map(dish => (
                      <tr key={dish._id}>
                        <td>
                          <img
                            src={dish.image}
                            alt={dish.name}
                            className="dish-thumbnail"
                          />
                        </td>
                        <td>{dish.name}</td>
                        <td>{dish.category}</td>
                        <td>${dish.price.toFixed(2)}</td>
                        <td>
                          <button
                            className="edit-button"
                            onClick={() => setEditingDish(dish)}
                          >
                            Edit
                          </button>
                          <button
                            className="delete-button"
                            onClick={() => handleDelete(dish._id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="orders-management">
            <h2>Recent Orders</h2>
            {loading ? (
              <div className="loading">Loading orders...</div>
            ) : (
              <div className="orders-list">
                {orders.length === 0 ? (
                  <p>No orders found.</p>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Items</th>
                        <th>Total</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(order => (
                        <tr key={order._id}>
                          <td>{order._id.substring(0, 8)}...</td>
                          <td>{order.customerInfo.name}</td>
                          <td>
                            {order.items.map(item => (
                              <div key={item._id || item.dishId} className="order-item">
                                {item.quantity} × {item.name}
                              </div>
                            ))}
                          </td>
                          <td>${order.totalPrice.toFixed(2)}</td>
                          <td>{formatDate(order.createdAt)}</td>
                          <td>
                            <span className={`status-badge ${order.status}`}>
                              {order.status}
                            </span>
                          </td>
                          <td>
                            <select
                              value={order.status}
                              onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                              className="status-dropdown"
                            >
                              <option value="pending">Pending</option>
                              <option value="preparing">Preparing</option>
                              <option value="ready">Ready</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;