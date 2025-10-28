import React from 'react';
import "../styles/checkoutSuccessStyles.css";

const CheckoutSuccess: React.FC = () => {
  return (
    <div className="checkout-success">
      <div className="success-container">
        <h1>¡Gracias por su compra!</h1>
        <div className="success-icon">✓</div>
        <p>Su pedido ha sido recibido y está siendo preparado para el envío.</p>
        <p>Le enviaremos un correo electrónico con los detalles del envío.</p>
      </div>
    </div>
  );
};

export default CheckoutSuccess;