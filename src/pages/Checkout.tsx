import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/checkoutStyles.css';

interface CartItem {
  product: {
    id: number;
    title: string;
    price: number;
    image: string;
  };
  quantity: number;
}

interface CheckoutProps {
  cart: CartItem[];
  onCheckoutSuccess: () => void;
}

const Checkout: React.FC<CheckoutProps> = ({ cart, onCheckoutSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const SALES_SERVICE_URL = import.meta.env.VITE_SALES_SERVICE_URL || 'http://localhost:8083';

  const rawUser = (() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); }
    catch { return null; }
  })();
  const userId = rawUser && (rawUser.id_usuario ?? rawUser.id ?? rawUser.idUsuario);

  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const handleCheckout = async () => {
    if (!userId) {
      setError('Debes estar autenticado para realizar una compra');
      navigate('/login');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Preparar payload según el formato esperado por el backend
      const payload = {
        id_usuario: userId,  // <-- CAMBIO: idUsuario → id_usuario
        detalles: cart.map(item => ({
          id_producto: item.product.id,
          cantidad: item.quantity,
          precio: item.product.price,
          subtotal: item.product.price * item.quantity
        })),
        total: total,
        estado: 'pendiente'
      };

      console.log('Enviando compra:', payload);

      // POST a /compras para crear la compra
      const resp = await axios.post(`${SALES_SERVICE_URL}/compras`, payload);

      console.log('Compra creada:', resp.data);

      // Limpiar carrito y redirigir
      onCheckoutSuccess();
      navigate('/CheckoutSuccess');
    } catch (err: any) {
      console.error('Error al procesar compra:', err);
      if (err.response) {
        setError(`Error ${err.response.status}: ${err.response.data?.message || 'al procesar compra'}`);
      } else if (err.request) {
        setError('No se recibió respuesta del microservicio. Intenta más tarde.');
      } else {
        setError('Error: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <main className="container checkout-page">
        <h2>Carrito Vacío</h2>
        <p>No hay productos en tu carrito.</p>
        <button className="btn btn-primary" onClick={() => navigate('/products')}>
          Volver a Productos
        </button>
      </main>
    );
  }

  return (
    <main className="container checkout-page">
      <h2>Resumen de Compra</h2>

      <section className="checkout-summary">
        <div className="cart-items-review">
          <h3>Productos</h3>
          <table className="review-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio Unit.</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {cart.map(item => (
                <tr key={item.product.id}>
                  <td>{item.product.title}</td>
                  <td className="quantity">{item.quantity}</td>
                  <td className="price">${item.product.price.toLocaleString()}</td>
                  <td className="subtotal">
                    ${(item.product.price * item.quantity).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="checkout-total">
          <div className="total-row">
            <span>Subtotal:</span>
            <span>${total.toLocaleString()}</span>
          </div>
          <div className="total-row">
            <span>Impuestos:</span>
            <span>$0</span>
          </div>
          <div className="total-row final">
            <strong>Total:</strong>
            <strong>${total.toLocaleString()}</strong>
          </div>
        </div>
      </section>

      {error && <p className="mensajeError">{error}</p>}

      <div className="checkout-actions">
        <button 
          className="btn btn-secondary" 
          onClick={() => navigate('/products')}
          disabled={loading}
        >
          Continuar Comprando
        </button>
        <button 
          className="btn btn-primary" 
          onClick={handleCheckout}
          disabled={loading || cart.length === 0}
        >
          {loading ? 'Procesando compra...' : 'Confirmar Compra'}
        </button>
      </div>
    </main>
  );
};

export default Checkout;