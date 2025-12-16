import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ForgotPassword: React.FC = () => {
  const [step, setStep] = useState<'email' | 'question' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const API_URL = 'http://localhost:8081';
  const navigate = useNavigate();

  const handleGetQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_URL}/usuarios/security-question/${email}`);
      setQuestion(response.data.question);
      setStep('question');
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError('Usuario no encontrado o no tiene pregunta de seguridad configurada.');
      } else {
        setError('Error al obtener la pregunta de seguridad.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post(`${API_URL}/usuarios/verify-answer`, {
        correo: email,
        answer: answer.trim()
      });
      setStep('reset');
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError('Respuesta incorrecta.');
      } else {
        setError('Error al verificar la respuesta.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (newPassword.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await axios.put(`${API_URL}/usuarios/reset-password`, {
        correo: email,
        newPassword
      });
      alert('Contraseña restablecida exitosamente.');
      navigate('/login');
    } catch (err: any) {
      setError('Error al restablecer la contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="abs-center">
      <form className="form" onSubmit={step === 'email' ? handleGetQuestion : step === 'question' ? handleVerifyAnswer : handleResetPassword}>
        <h2>Recuperar Contraseña</h2>

        {step === 'email' && (
          <>
            <div className="form-input">
              <label htmlFor="email">Correo Electrónico</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ingresa tu correo"
                required
              />
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Cargando...' : 'Continuar'}
            </button>
          </>
        )}

        {step === 'question' && (
          <>
            <p><strong>Pregunta de seguridad:</strong> {question}</p>
            <div className="form-input">
              <label htmlFor="answer">Respuesta</label>
              <input
                type="text"
                id="answer"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Ingresa tu respuesta"
                required
              />
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Verificando...' : 'Verificar'}
            </button>
            <button type="button" onClick={() => setStep('email')} className="btn btn-secondary">Volver</button>
          </>
        )}

        {step === 'reset' && (
          <>
            <div className="form-input">
              <label htmlFor="newPassword">Nueva Contraseña</label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nueva contraseña"
                required
              />
            </div>
            <div className="form-input">
              <label htmlFor="confirmPassword">Confirmar Contraseña</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirma la contraseña"
                required
              />
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Restableciendo...' : 'Restablecer Contraseña'}
            </button>
          </>
        )}

        {error && <div className="mensajeError text-center">{error}</div>}

        <div className="form-actions">
          <button type="button" onClick={() => navigate('/login')} className="btn btn-secondary">Volver al Login</button>
        </div>
      </form>
    </div>
  );
};

export default ForgotPassword;