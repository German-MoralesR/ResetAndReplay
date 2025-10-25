
import { Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { createPortal } from 'react-dom';


import "./styles/homeStyles.css";

import Home from "./pages/Home";
import Products from "./pages/Products";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Login from "./pages/Login";
import SignIn from "./pages/SignIn";
import Contact from "./pages/Contact";

interface CartItem {
  product: {
    id: number;
    title: string;
    price: number;
    image: string;
  };
  quantity: number;
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const navigate = useNavigate(); // para navegación interna
  const location = useLocation();


  // Función para agregar al carrito
  const addToCart = (product: CartItem['product']) => {
    setCart(currentCart => {
      const existingItem = currentCart.find(item => item.product.id === product.id);
      if (existingItem) {
        return currentCart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...currentCart, { product, quantity: 1 }];
    });
  };

  // Función para actualizar cantidad
  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCart(currentCart =>
      currentCart.map(item =>
        item.product.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  // Función para eliminar del carrito
  const removeFromCart = (productId: number) => {
    setCart(currentCart => currentCart.filter(item => item.product.id !== productId));
  };

  // Calcular total de items en el carrito
  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0);

  // Verificar sesión guardada
  useEffect(() => {
    const storedLogin = localStorage.getItem("isLoggedIn");
    if (storedLogin === "true") {
      setIsLoggedIn(true);
    }
  }, []);

  // Función para cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
    navigate("/"); // redirige al Home sin recargar la página
  };
  return (
    <div className = "container">
        
        {/*-- Navbar-- */}
        <nav className="main-nav header-inner" aria-label="Navegación principal">
          <div>
              {!isLoggedIn ? (
                <li className="nav-item">
                  <Link className="nav-link" to="/login">Iniciar Sesion</Link>
                </li>
              ) : (
                <li className="nav-item">
                  <button
                    onClick={handleLogout}
                    className="btn btn-outline-light ms-2"
                    style={{ borderRadius: "20px", padding: "5px 15px", fontSize: "13px" }}
                  >
                    Cerrar sesión
                  </button>
                </li>
              )}
          </div>
          <div className = "brand">
            <img src="/images/logo2.png" alt="RetroStore logo" className = "logo" />
            <h1>R&R</h1>
          </div>
          <Link to="/" className={location.pathname === "/" ? "active" : ""}>Inicio</Link>
          <Link to="/products" className={location.pathname === "/products" ? "active" : ""}>Productos</Link>
          <Link to= "/contact" className={location.pathname === "/contact" ? "active" : ""}>Contacto</Link>

          <div className="header-actions">
            
            <button 
              id="cart-btn" 
              className="btn small"
              onClick={() => setIsCartOpen(true)}
            > Carrito ({cartItemsCount})
            </button>
          </div>
        </nav>


        
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products addToCart={addToCart} />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/login" element={
                                    <Login 
                                      onLoginSuccess={() => {
                                        localStorage.setItem("isLoggedIn", "true");
                                        setIsLoggedIn(true);
                                        navigate("/");
                                      }}
                                    />
                                  }
          />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/contact" element={<Contact />} />

          {/* Agrega otras rutas si tienes más páginas */}
        </Routes>

          {/* Modal del Carrito */}
        {isCartOpen && createPortal(
          <div className="modal" role="dialog" aria-modal="true" onClick={() => setIsCartOpen(false)} style={{ display: 'flex' }}>
            <div className="modal-content cart-modal" onClick={e => e.stopPropagation()}>
              <button className="close" onClick={() => setIsCartOpen(false)}>&times;</button>
              <h3>Carrito de Compras</h3>
              {cart.length === 0 ? (
                <p>El carrito está vacío</p>
              ) : (
                <>
                  {cart.map(item => (
                    <div key={item.product.id} className="cart-item">
                      <img src={`/images/${item.product.image}`} alt={item.product.title} style={{width: '50px'}} />
                      <div className="cart-item-details">
                        <h4>{item.product.title}</h4>
                        <p>${item.product.price.toLocaleString()}</p>
                        <div className="quantity-controls">
                          <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)}>-</button>
                          <span>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)}>+</button>
                        </div>
                      </div>
                      <button className="remove-btn" onClick={() => removeFromCart(item.product.id)}>Eliminar</button>
                    </div>
                  ))}
                  <div className="cart-total">
                    <strong>Total: ${cart.reduce((total, item) => total + (item.product.price * item.quantity), 0).toLocaleString()}</strong>
                  </div>
                  <button className="btn checkout-btn">Proceder al pago</button>
                </>
              )}
            </div>
          </div>, document.body
        )}
        <footer className="site-footer footer-inner">
          <small>© RetroStore 1995–2025</small>
          <div className="footer-links">
            <Link to="/Terms">Términos</Link>
            <Link to="/Privacy">Privacidad</Link>
          </div>
        </footer>
      </div>

      
    );

  
}
export default App;