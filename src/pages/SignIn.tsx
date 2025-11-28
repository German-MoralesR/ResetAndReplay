import React, { type FormEvent, useState, type ChangeEvent } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "../styles/signInStyles.css";

const SignIn: React.FC = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    password: '',
    cPassword: '',
    telefono: ''
  });

  const [errors, setErrors] = useState({
    nombre: '',
    correo: '',
    password: '',
    cPassword: '',
    telefono: '',
    submit: ''
  });

  const [loading, setLoading] = useState(false);
  const API_URL = "http://localhost:8081";
  const navigate = useNavigate();

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Limpiar números para el campo teléfono
    if (name === 'telefono') {
      const cleaned = value.replace(/\D+/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: cleaned
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validar = (e: FormEvent) => {
    e.preventDefault();
    let todoOk = true;
    const newErrors = { ...errors };

    // Validar nombre
    if (formData.nombre.length < 3 || formData.nombre.length > 20 || formData.nombre.trim() === '') {
      newErrors.nombre = 'Nombre debe contener 3 a 20 caracteres';
      todoOk = false;
    } else {
      newErrors.nombre = '';
    }

    // Validar correo
    if (formData.correo.trim() === '' || 
        !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.correo.trim())) {
      newErrors.correo = 'Correo debe tener un formato válido (usuario@dominio.com)';
      todoOk = false;
    } else if (formData.correo.length > 100) {
      newErrors.correo = 'Correo NO debe ser mayor a 100 caracteres';
      todoOk = false;
    } else {
      newErrors.correo = '';
    }

    // Validar contraseña
    if (formData.password.length < 8) {
      newErrors.password = 'La contraseña debe contener al menos 8 caracteres';
      todoOk = false;
    } else {
      newErrors.password = '';
    }

    // Validar confirmación de contraseña
    if (formData.cPassword !== formData.password) {
      newErrors.cPassword = 'La contraseña ingresada no coincide';
      todoOk = false;
    } else {
      newErrors.cPassword = '';
    }

    // Validar teléfono (opcional pero si se ingresa debe ser válido)
    if (formData.telefono && (formData.telefono.length < 8 || formData.telefono.length > 12)) {
      newErrors.telefono = 'El teléfono debe tener entre 8 y 12 números';
      todoOk = false;
    } else {
      newErrors.telefono = '';
    }

    setErrors(newErrors);

    if (todoOk) {
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    setLoading(true);
    const payload = {
      nombre: formData.nombre,
      correo: formData.correo,
      password: formData.password,
      telefono: formData.telefono || null
    };

    axios.post(`${API_URL}/usuarios`, payload)
      .then(resp => {
        console.log("Usuario registrado:", resp.data);
        setErrors({ ...errors, submit: '' });
        alert('¡Se ha registrado correctamente!');
        setFormData({
          nombre: '',
          correo: '',
          password: '',
          cPassword: '',
          telefono: ''
        });
        navigate("/login");
      })
      .catch(err => {
        console.error("Error al registrar:", err);
        if (err.response && err.response.status === 400) {
          setErrors({ ...errors, submit: err.response.data.message || "El correo ya está registrado" });
        } else {
          setErrors({ ...errors, submit: "No se pudo conectar con el servicio de registro" });
        }
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="abs-center">
      <form className="form" onSubmit={validar}>
        <h2>Registrarse</h2>

        <div className="form-input">
          <label htmlFor="nombre">Nombre</label>
          <input
            id="nombre"
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleInputChange}
            placeholder="Nombre"
          />
          {errors.nombre && <div className="mensajeError">{errors.nombre}</div>}
        </div>

        <div className="form-input">
          <label htmlFor="correo">Correo</label>
          <input
            id="correo"
            type="email"
            name="correo"
            value={formData.correo}
            onChange={handleInputChange}
            placeholder="Correo"
          />
          {errors.correo && <div className="mensajeError">{errors.correo}</div>}
        </div>

        <div className="form-input">
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Contraseña"
          />
          {errors.password && <div className="mensajeError">{errors.password}</div>}
        </div>

        <div className="form-input">
          <label htmlFor="cPassword">Confirmar Contraseña</label>
          <input
            id="cPassword"
            type="password"
            name="cPassword"
            value={formData.cPassword}
            onChange={handleInputChange}
            placeholder="Confirmar Contraseña"
          />
          {errors.cPassword && <div className="mensajeError">{errors.cPassword}</div>}
        </div>

        <div className="form-input telefono">
          <label htmlFor="telefono">Teléfono (Opcional)</label>
          <input
            id="telefono"
            type="tel"
            name="telefono"
            value={formData.telefono}
            onChange={handleInputChange}
            placeholder="Teléfono"
            inputMode="numeric"
            autoComplete="tel"
          />
          {errors.telefono && <div className="mensajeError">{errors.telefono}</div>}
        </div>

        {errors.submit && <div className="mensajeError text-center">{errors.submit}</div>}
        
        <div className="form-actions d-flex">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => window.history.back()}>Volver</button>
        </div>
      </form>
    </div>
  );
};

export default SignIn;