import React, { type FormEvent, useState, type ChangeEvent } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "../styles/signInStyles.css";

const securityQuestions = [
  "¿Nombre de tu primera mascota?",
  "¿Ciudad donde naciste?",
  "¿Nombre de tu mejor amigo de la infancia?",
  "¿Cuál es tu comida favorita?",
  "¿Cuál es el nombre de tu escuela primaria?"
];

const SignIn: React.FC = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    password: '',
    cPassword: '',
    telefono: '',
    securityQuestion: '',
    securityAnswer: ''
  });

  const [errors, setErrors] = useState({
    nombre: '',
    correo: '',
    password: '',
    cPassword: '',
    telefono: '',
    securityQuestion: '',
    securityAnswer: '',
    submit: ''
  });

  const [loading, setLoading] = useState(false);
  const API_URL = "http://localhost:8081";
  const navigate = useNavigate();

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

    // Validar pregunta de seguridad
    if (!formData.securityQuestion) {
      newErrors.securityQuestion = 'Debes seleccionar una pregunta de seguridad';
      todoOk = false;
    } else {
      newErrors.securityQuestion = '';
    }

    // Validar respuesta de seguridad
    if (!formData.securityAnswer.trim()) {
      newErrors.securityAnswer = 'Debes proporcionar una respuesta a la pregunta de seguridad';
      todoOk = false;
    } else if (formData.securityAnswer.trim().length < 2) {
      newErrors.securityAnswer = 'La respuesta debe tener al menos 2 caracteres';
      todoOk = false;
    } else {
      newErrors.securityAnswer = '';
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
      telefono: formData.telefono || null,
      securityQuestion: formData.securityQuestion,
      securityAnswer: formData.securityAnswer.trim()
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
          telefono: '',
          securityQuestion: '',
          securityAnswer: ''
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

        <div className="form-input">
          <label htmlFor="securityQuestion">Pregunta de Seguridad</label>
          <select
            id="securityQuestion"
            name="securityQuestion"
            value={formData.securityQuestion}
            onChange={handleInputChange}
          >
            <option value="">Selecciona una pregunta</option>
            {securityQuestions.map((question, index) => (
              <option key={index} value={question}>{question}</option>
            ))}
          </select>
          {errors.securityQuestion && <div className="mensajeError">{errors.securityQuestion}</div>}
        </div>

        <div className="form-input">
          <label htmlFor="securityAnswer">Respuesta de Seguridad</label>
          <input
            id="securityAnswer"
            type="text"
            name="securityAnswer"
            value={formData.securityAnswer}
            onChange={handleInputChange}
            placeholder="Tu respuesta"
          />
          {errors.securityAnswer && <div className="mensajeError">{errors.securityAnswer}</div>}
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