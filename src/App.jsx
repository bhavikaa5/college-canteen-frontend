import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [dishes, setDishes] = useState([]);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Sample dishes data to use if API fails
    const sampleDishes = [
      {
        id: 1,
        name: "Classic Cheese Burger",
        description: "Juicy beef patty with melted cheddar, lettuce, tomato, and our special sauce",
        price: 5.99,
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
      },
      {
        id: 2,
        name: "Crispy Chicken Wrap",
        description: "Crispy chicken strips with fresh veggies and ranch dressing in a tortilla wrap",
        price: 4.99,
        image: "https://images.unsplash.com/photo-1551782450-17144efb9c50?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
      }
    ];

    // Try to fetch from API, fallback to sample data
    const fetchDishes = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const response = await fetch(`${apiUrl}/api/dishes`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setDishes(data);
      } catch (error) {
        console.error('Error fetching dishes:', error);
        // Fallback to sample data if API fails
        setDishes(sampleDishes);
      } finally {
        setLoading(false);
      }
    };

    fetchDishes();
  }, []);

  const addToCart = (dish) => {
    const existingItem = cart.find(item => item.id === dish.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === dish.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { ...dish, quantity: 1 }]);
    }
  };

  const removeFromCart = (id) => {
    const existingItem = cart.find(item => item.id === id);
    if (existingItem.quantity === 1) {
      setCart(cart.filter(item => item.id !== id));
    } else {
      setCart(cart.map(item => 
        item.id === id ? { ...item, quantity: item.quantity - 1 } : item
      ));
    }
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
          <span>🛒</span>
          {totalItems > 0 && <span className="cart-count">{totalItems}</span>}
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h2>Delicious Food for Hungry Minds</h2>
          <p>Quick, tasty, and affordable meals for busy college students</p>
          <button className="order-button" onClick={()=>{
             document.getElementById('menu').scrollIntoView({ behavior: 'smooth' });
          }}>Order Now</button>
        </div>
      </section>

      {/* Menu Section */}
      <section id="menu" className="menu-section">
        <h2>Our Menu</h2>
        
        {loading ? (
          <div className="loading">Loading menu...</div>
        ) : (
          <div className="dishes-grid">
            {dishes.map(dish => (
              <div key={dish.id} className="dish-card">
                <div className="dish-image" style={{ backgroundImage: `url(${dish.image})` }}></div>
                <div className="dish-info">
                  <h3>{dish.name}</h3>
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
                <div key={item.id} className="cart-item">
                  <div className="item-info">
                    <h4>{item.name}</h4>
                    <p>${item.price.toFixed(2)}</p>
                  </div>
                  <div className="item-quantity">
                    <button onClick={() => removeFromCart(item.id)}>-</button>
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
              <button className="checkout-button">
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-info">
            <h3>Campus Bites</h3>
            <p>Student Union Building</p>
            <p>Open Mon-Fri: 8AM - 8PM</p>
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