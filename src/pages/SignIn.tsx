
import React, { type FormEvent, useState, type ChangeEvent } from 'react';

import "../styles/signInStyles.css";

const SignIn: React.FC = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    nombre_usu: '',
    password: '',
    cPassword: '',
    telefono: '',
    fec_nac: '',
    termCond: false
  });

  const [errors, setErrors] = useState({
    nombre: '',
    correo: '',
    nombre_usu: '',
    password: '',
    cPassword: '',
    telefono: '',
    fec_nac: '',
    termCond: ''
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
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
      [name]: type === 'checkbox' ? checked : value
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

    // Validar usuario
    if (formData.nombre_usu.length < 4 || formData.nombre_usu.length > 20 || formData.nombre_usu.trim() === '') {
      newErrors.nombre_usu = 'Usuario debe contener 4 a 20 caracteres';
      todoOk = false;
    } else {
      newErrors.nombre_usu = '';
    }

    // Validar fecha de nacimiento
    if (formData.fec_nac) {
      const today = new Date();
      const birth = new Date(formData.fec_nac);
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      if (age < 18) {
        newErrors.fec_nac = 'Debes ser mayor de 18 años para registrarte';
        todoOk = false;
      } else {
        newErrors.fec_nac = '';
      }
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

    // Validar teléfono
    if (formData.telefono && (formData.telefono.length < 8 || formData.telefono.length > 12)) {
      newErrors.telefono = 'El teléfono debe tener entre 8 y 12 números';
      todoOk = false;
    } else {
      newErrors.telefono = '';
    }

    // Validar términos y condiciones
    if (!formData.termCond) {
      newErrors.termCond = 'Debe aceptar los términos y condiciones';
      todoOk = false;
    } else {
      newErrors.termCond = '';
    }

    setErrors(newErrors);

    if (todoOk) {
      alert('¡Se ha registrado correctamente!');
      setFormData({
        nombre: '',
        correo: '',
        nombre_usu: '',
        password: '',
        cPassword: '',
        telefono: '',
        fec_nac: '',
        termCond: false
      });
    }
  };

  // ...existing code...
  return (
    <div className="abs-center">
      <form className="form" onSubmit={validar}>
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
          <label htmlFor="nombre_usu">Usuario</label>
          <input
            id="nombre_usu"
            type="text"
            name="nombre_usu"
            value={formData.nombre_usu}
            onChange={handleInputChange}
            placeholder="Usuario"
          />
          {errors.nombre_usu && <div className="mensajeError">{errors.nombre_usu}</div>}
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
          <label htmlFor="telefono">Teléfono</label>
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
          <label htmlFor="fec_nac">Fecha de Nacimiento</label>
          <input
            id="fec_nac"
            type="date"
            name="fec_nac"
            value={formData.fec_nac}
            onChange={handleInputChange}
          />
          {errors.fec_nac && <div className="mensajeError">{errors.fec_nac}</div>}
        </div>

        <div className="form-input termCond">
          <input
            id="termCond"
            type="checkbox"
            name="termCond"
            checked={formData.termCond}
            onChange={handleInputChange}
          />
          <label htmlFor="termCond">Acepto los términos y condiciones</label>
          {errors.termCond && <div className="mensajeError">{errors.termCond}</div>}
        </div>
        
        <div className="form-actions d-flex">
          <button type="submit" className="btn btn-primary">Registrarse</button>
          <button type="button" className="btn btn-secondary" onClick={() => window.history.back()}>Volver</button>
        </div>
      </form>
    </div>
  );
// ...existing code...
}
export default SignIn;

