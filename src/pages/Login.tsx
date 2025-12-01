import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import "../styles/loginStyles.css";

interface LoginProps {
  onLoginSuccess?: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; login?: string }>({});

  // MOVER: estado de carga y URL del servicio al nivel del componente
  const [loading, setLoading] = useState(false);
  const API_URL = "http://localhost:8081";

  const navigate = useNavigate();

  const validate = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = "El correo es obligatorio";
    } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
      newErrors.email = "Formato de correo inválido";
    }

    if (!password) {
      newErrors.password = "La contraseña es obligatoria";
    } else if (password.length < 4) {
      newErrors.password = "La contraseña debe tener al menos 4 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  if (!validate()) return;

  setLoading(true);
  axios.post(`${API_URL}/usuarios/login`, { correo: email, password })
    .then(resp => {
      // Guardar el usuario completo con su rol
      localStorage.setItem("user", JSON.stringify(resp.data));
      localStorage.setItem("isLoggedIn", "true");
      setErrors({});
      if (onLoginSuccess) onLoginSuccess();
      navigate("/");
    })
    .catch(err => {
      console.error("Login error:", err);
      if (err.response && err.response.status === 401) {
        setErrors({ login: "Correo o contraseña incorrectos" });
      } else {
        setErrors({ login: "No se pudo conectar al servicio de usuarios" });
      }
    })
    .finally(() => setLoading(false));
};

  return (
    <form id="loginForm" onSubmit={handleSubmit}>
      <h2>Iniciar Sesión</h2>

      <div className="form-input usuario">
        <label htmlFor="email">Correo</label>
        <input
          type="email"
          id="email"
          className={`form-control ${errors.email ? "is-invalid" : ""}`}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {errors.email && <div className="invalid-feedback">{errors.email}</div>}
        <p className="mensajeError"></p>
      </div>

      <div className="form-input password">
        <label htmlFor="password">Contraseña</label>
        <input
          type="password"
          id="password"
          className={`form-control ${errors.password ? "is-invalid" : ""}`}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {errors.password && <div className="invalid-feedback">{errors.password}</div>}
        <p className="mensajeError"></p>
      </div>
      {errors.login && <p className="text-danger text-center">{errors.login}</p>}

      <button type="submit" disabled={loading}>{loading ? "Ingresando..." : "Ingresar"}</button>
      <Link to="/signin" className="btn btn-primary volver-btn" role="button">Registrarse</Link>
    </form>
  );
}

export default Login;