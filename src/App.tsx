
import { Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

import "./styles/homeStyles.css";

import Home from "./pages/Home";
import Products from "./pages/Products";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Login from "./pages/Login";
import SignIn from "./pages/SignIn";


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate(); // para navegación interna
  const location = useLocation();

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
    navigate("/home"); // redirige al Home sin recargar la página
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
          <Link to="/home" className={location.pathname === "/home" ? "active" : ""}>Inicio</Link>
          <Link to="/products" className={location.pathname === "/products" ? "active" : ""}>Productos</Link>
          <a href="#categorias">Categorías</a>
          <a href="../../Evaluacion/Contacto/contacto.html">Contacto</a>

          <div className="header-actions">
            
            <button id="cart-btn" className="btn small">Carrito (0)</button>
          </div>
        </nav>
        
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/products" element={<Products />} />
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

          {/* Agrega otras rutas si tienes más páginas */}
        </Routes>
        
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