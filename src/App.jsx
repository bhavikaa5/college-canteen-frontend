import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [dishes, setDishes] = useState([]);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    studentId: '',
    notes: ''
  });
  const [activeCategory, setActiveCategory] = useState('All');
  const [categories, setCategories] = useState(['All']);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    // Fetch dishes from backend when component mounts
    fetchDishes();
    
    // Retrieve cart from localStorage if available
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);
  
  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const fetchDishes = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/dishes`);
      const data = await response.json();
      setDishes(data);
      
      // Extract unique categories
      const uniqueCategories = ['All', ...new Set(data.map(dish => dish.category))];
      setCategories(uniqueCategories);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dishes:', error);
      setLoading(false);
    }
  };

  const filteredDishes = activeCategory === 'All' 
    ? dishes 
    : dishes.filter(dish => dish.category === activeCategory);

  const addToCart = (dish) => {
    const existingItem = cart.find(item => item._id === dish._id);
    if (existingItem) {
      setCart(cart.map(item => 
        item._id === dish._id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { ...dish, quantity: 1 }]);
    }
  };

  const removeFromCart = (id) => {
    const existingItem = cart.find(item => item._id === id);
    if (existingItem.quantity === 1) {
      setCart(cart.filter(item => item._id !== id));
    } else {
      setCart(cart.map(item => 
        item._id === id ? { ...item, quantity: item.quantity - 1 } : item
      ));
    }
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    
    // Prepare order items
    const orderItems = cart.map(item => ({
      dishId: item._id,
      name: item.name,
      price: item.price,
      quantity: item.quantity
    }));
    
    // Create order object
    const order = {
      items: orderItems,
      totalPrice,
      customerInfo
    };
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(order)
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setOrderId(result.orderId);
        setOrderSuccess(true);
        setCart([]);
        localStorage.removeItem('cart');
      } else {
        alert('Error creating order: ' + result.error);
      }
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('Error submitting order. Please try again.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="logo">
          <h1>Campus Bites</h1>
          <p>Your College Canteen</p>
        </div>
        <div className="cart-icon" onClick={() => setIsCartOpen(!isCartOpen)}>
          <span className="material-icons">🛒</span>
          {totalItems > 0 && <span className="cart-count">{totalItems}</span>}
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h2>Delicious Food for Hungry Minds</h2>
          <p>Quick, tasty, and affordable meals for busy college students</p>
          <button className="order-button" onClick={() => document.getElementById('menu').scrollIntoView({ behavior: 'smooth' })}>
            Order Now
          </button>
        </div>
      </section>

      {/* Menu Section */}
      <section id="menu" className="menu-section">
        <h2>Our Menu</h2>
        
        {/* Category Filter */}
        <div className="category-filter">
          {categories.map(category => (
            <button 
              key={category}
              className={`category-btn ${activeCategory === category ? 'active' : ''}`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
        
        {loading ? (
          <div className="loading">Loading menu...</div>
        ) : (
          <div className="dishes-grid">
            {filteredDishes.map(dish => (
              <div key={dish._id} className="dish-card">
                <div className="dish-image" style={{ backgroundImage: `url(${dish.image})` }}></div>
                <div className="dish-info">
                  <h3>{dish.name}</h3>
                  <p className="dish-category">{dish.category}</p>
                  <p className="dish-description">{dish.description}</p>
                  <div className="dish-footer">
                    <span className="dish-price">${dish.price.toFixed(2)}</span>
                    <button className="add-to-cart" onClick={() => addToCart(dish)}>
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Cart Sidebar */}
      <div className={`cart-sidebar ${isCartOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <h3>Your Order</h3>
          <button className="close-cart" onClick={() => setIsCartOpen(false)}>×</button>
        </div>
        
        {cart.length === 0 ? (
          <div className="empty-cart">
            <p>Your cart is empty</p>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cart.map(item => (
                <div key={item._id} className="cart-item">
                  <div className="item-info">
                    <h4>{item.name}</h4>
                    <p>${item.price.toFixed(2)}</p>
                  </div>
                  <div className="item-quantity">
                    <button onClick={() => removeFromCart(item._id)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => addToCart(item)}>+</button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="cart-footer">
              <div className="cart-total">
                <span>Total:</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <button className="checkout-button" onClick={() => {
                setIsCheckoutOpen(true);
                setIsCartOpen(false);
              }}>
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </div>

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <button className="close-modal" onClick={() => setIsCheckoutOpen(false)}>×</button>
            
            {orderSuccess ? (
              <div className="order-success">
                <h3>Order Placed Successfully!</h3>
                <p>Your order ID is: <strong>{orderId}</strong></p>
                <p>We'll notify you when your order is ready.</p>
                <button className="close-button" onClick={() => {
                  setIsCheckoutOpen(false);
                  setOrderSuccess(false);
                }}>
                  Close
                </button>
              </div>
            ) : (
              <>
                <h3>Complete Your Order</h3>
                <div className="order-summary">
                  <h4>Order Summary</h4>
                  {cart.map(item => (
                    <div key={item._id} className="summary-item">
                      <span>{item.quantity} × {item.name}</span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="summary-total">
                    <span>Total:</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                </div>
                
                <form onSubmit={handleCheckout}>
                  <div className="form-group">
                    <label htmlFor="name">Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={customerInfo.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={customerInfo.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="studentId">Student ID (Optional)</label>
                    <input
                      type="text"
                      id="studentId"
                      name="studentId"
                      value={customerInfo.studentId}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="notes">Special Instructions</label>
                    <textarea
                      id="notes"
                      name="notes"
                      value={customerInfo.notes}
                      onChange={handleInputChange}
                    ></textarea>
                  </div>
                  
                  <button type="submit" className="submit-order">
                    Place Order
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-info">
            <h3>Campus Bites</h3>
            <p>Student Union Building</p>
            <p>Open Mon-Fri: 8AM - 8PM</p>
            <p>Sat-Sun: 10AM - 6PM</p>
          </div>
          <div className="footer-contact">
            <h3>Contact Us</h3>
            <p>Email: campus.bites@college.edu</p>
            <p>Phone: (555) 123-4567</p>
            <p>Instagram: @campusbites</p>
          </div>
        </div>
        <div className="copyright">
          <p>© 2025 Campus Bites. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;