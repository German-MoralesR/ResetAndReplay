
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
import ForgotPassword from "./pages/ForgotPassword";
import Contact from "./pages/Contact";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import Profile from './pages/Profile';
import PurchaseHistory from './pages/PurchaseHistory';
import Checkout from './pages/Checkout';
import Inventory from './pages/Inventory';


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
  const [isAdmin, setIsAdmin] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
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

  const getIsAdminFromStorage = () => {
    try {
      const raw = localStorage.getItem('user');
      if (!raw) return false;
      const u = JSON.parse(raw);

      const rol = u?.rol;
      // 1) si rol es string: "ADMIN" o "ROLE_ADMIN"
      if (typeof rol === 'string') {
        return rol.toUpperCase().includes('ADMIN');
      }
      // 2) si rol es número directo
      if (typeof rol === 'number') {
        return Number(rol) === 1;
      }
      // 3) si rol es objeto: buscar id o nombre
      const roleId = rol?.id_rol ?? rol?.id ?? rol?.idRol;
      if (roleId != null) return Number(roleId) === 1;

      const roleName = (rol?.nombre ?? rol?.name ?? '').toString();
      if (roleName) return roleName.toUpperCase().includes('ADMIN');

      return false;
    } catch (e) {
      console.error('Error en getIsAdminFromStorage:', e);
      return false;
    }
  };

  // Verificar sesión guardada AL MONTAR
  useEffect(() => {
    const storedLogin = localStorage.getItem("isLoggedIn");
    if (storedLogin === "true") {
      setIsLoggedIn(true);
    }
    const adminStatus = getIsAdminFromStorage();
    setIsAdmin(adminStatus);
    console.log('App mounted: isAdmin =', adminStatus);
  }, []);

    // escuchar cambios en el evento "storage" de localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const adminStatus = getIsAdminFromStorage();
      setIsAdmin(adminStatus);
      console.log('Storage changed: isAdmin =', adminStatus);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Función para cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setIsAdmin(false);
    setIsUserMenuOpen(false);
    navigate("/");
  };

  const handleProfileClick = () => {
    setIsUserMenuOpen(false);
    navigate("/profile");
  };

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const userMenuBtn = document.getElementById("user-menu-btn");
      const userDropdown = document.getElementById("user-dropdown");
      
      if (userMenuBtn && userDropdown && 
          !userMenuBtn.contains(event.target as Node) && 
          !userDropdown.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [isUserMenuOpen]);


  const procederPago = () => {
    // Lógica para proceder al pago
    navigate("/CheckoutSuccess");

    // Vaciar el carrito después de proceder al pago
    setCart([]);

    // Cerrar el modal del carrito
    setIsCartOpen(false);
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
                <li className="nav-item user-menu-container">
                  <button
                    id="user-menu-btn"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="btn btn-outline-light ms-2 user-menu-btn"
                    style={{ borderRadius: "20px", padding: "5px 15px", fontSize: "13px" }}
                    aria-expanded={isUserMenuOpen}
                    aria-haspopup="true"
                  >
                    ⚙️ Mi Cuenta
                  </button>
                  
                  {isUserMenuOpen && (
                    <div id="user-dropdown" className="user-dropdown-menu">
                      <button 
                        className="dropdown-item"
                        onClick={handleProfileClick}
                      >
                        👤 Ver Perfil
                      </button>
                      <hr className="dropdown-divider" />
                      <button 
                        className="dropdown-item logout-item"
                        onClick={handleLogout}
                      >
                        🚪 Cerrar Sesión
                      </button>
                    </div>
                  )}
                </li>
              )}
          </div>
          <div className = "brand">
            <img src="/images/logo2.png" alt="RetroStore logo" className = "logo" />
            <h1>R&R</h1>
          </div>
          <Link to="/" className={location.pathname === "/" ? "active" : ""}>Inicio</Link>
          <Link to="/products" className={location.pathname === "/products" ? "active" : ""}>Productos</Link>
          {isAdmin && (
            <Link to="/inventory" className={location.pathname === "/inventory" ? "active" : ""}>
              Inventario
            </Link>
          )}
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
                                        // Actualizar isAdmin inmediatamente después de login
                                        const adminStatus = getIsAdminFromStorage();
                                        setIsAdmin(adminStatus);
                                        console.log('After login: isAdmin =', adminStatus, 'user =', JSON.parse(localStorage.getItem('user') || '{}'));
                                        navigate("/");
                                      }}
                                    />
                                  }
          />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/CheckoutSuccess" element={<CheckoutSuccess />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/historial" element={<PurchaseHistory />} />
          <Route path="/checkout" element={
            <Checkout 
              cart={cart} 
              onCheckoutSuccess={() => setCart([])}
            />
          } />
          <Route path="/inventory" element={<Inventory />} />
        </Routes>

          {/* Modal del Carrito */}
        {isCartOpen && createPortal(
          <div className="cart-modal" onClick={() => setIsCartOpen(false)}>
            <div className="cart-content" onClick={(e) => e.stopPropagation()}>
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
                  <button 
                className="btn btn-primary proceed-payment-btn"
                onClick={() => {
                  setIsCartOpen(false);
                  navigate('/checkout');
                }}
              >
                Proceder a Pago
              </button>
                </>
              )}
            </div>
          </div>, document.body
        )}
        {/* Footer */}
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