import React, { useState, type FormEvent } from 'react';
import axios from 'axios';
import '../styles/contactStyles.css';

const Contacto: React.FC = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [response, setResponse] = useState('');
    const [responseColor, setResponseColor] = useState('');
    const [loading, setLoading] = useState(false);

    // nuevo estado para errores por campo
    const [errors, setErrors] = useState({
        email: '',
        message: ''
    });

    const REVIEWS_SERVICE_URL = import.meta.env.VITE_REVIEWS_SERVICE_URL || 'http://localhost:8084';

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const em = email.trim();
        const msg = message.trim();

        const newErrors = { email: '', message: '' };
        let valid = true;

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) {
            newErrors.email = 'Ingresa un correo válido (usuario@dominio.com)';
            valid = false;
        }

        if (msg.length < 5) {
            newErrors.message = 'El mensaje debe tener al menos 5 caracteres';
            valid = false;
        }

        setErrors(newErrors);

        if (valid) {
            setLoading(true);
            try {
                const payload = {
                    correo: em,
                    mensaje: msg
                };
                await axios.post(`${REVIEWS_SERVICE_URL}/contactos`, payload);
                
                setResponse(`¡Gracias por tu mensaje! Lo hemos recibido correctamente.`);
                setResponseColor('var(--accent-1)');
                setEmail('');
                setMessage('');
                setErrors({ email: '', message: '' });
            } catch (err: any) {
                console.error('Error al enviar contacto:', err);
                setResponse('Error al enviar el mensaje. Por favor intenta más tarde.');
                setResponseColor('var(--accent-3)');
            } finally {
                setLoading(false);
            }
        } else {
            setResponse('');
            setResponseColor('var(--accent-3)');
        }
    };

    return (
        <div className="contact-page">
            <section id="contact" className="section">
                <h2>Contacto</h2>
                <form id="contact-form" className="contact-form" onSubmit={handleSubmit}>
                    <label htmlFor="email">Correo electrónico:</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="ejemplo@correo.com"
                        value={email}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                    />
                    {errors.email && <div className="mensajeError">{errors.email}</div>}

                    <label htmlFor="message">Opinión o consulta:</label>
                    <textarea
                        id="message"
                        name="message"
                        rows={5}
                        placeholder="Escribe aquí tu mensaje"
                        value={message}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
                    />
                    {errors.message && <div className="mensajeError">{errors.message}</div>}

                    <button type="submit" className="btn" disabled={loading}>
                        {loading ? 'Enviando...' : 'Enviar'}
                    </button>
                </form>
                <p id="form-response" className="form-response" style={{ color: responseColor }}>
                    {response}
                </p>
            </section>
        </div>
    );
}

export default Contacto;