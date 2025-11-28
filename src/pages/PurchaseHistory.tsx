import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/purchaseStyles.css';

interface Detalle {
  id_detalle?: number;
  id_producto: number;
  cantidad: number;
  precio: number;
  subtotal?: number;
  nombre?: string;
}

interface Venta {
  id_compra: number;
  idUsuario: number;
  fecha: string;
  total: number;
  estado?: string;
  detalles?: Detalle[];
}

const PurchaseHistory: React.FC = () => {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<number[]>([]);
  const [productosCache, setProductosCache] = useState<Map<number, string>>(new Map());
  const navigate = useNavigate();

  const SALES_SERVICE_URL = import.meta.env.VITE_SALES_SERVICE_URL || 'http://localhost:8083';
  const INVENTORY_SERVICE_URL = import.meta.env.VITE_INVENTORY_SERVICE_URL || 'http://localhost:8082';

  const rawUser = (() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); }
    catch { return null; }
  })();
  const userId = rawUser && (rawUser.id_usuario ?? rawUser.id ?? rawUser.idUsuario);

  // Función para parsear fechas en formato PostgreSQL
  const formatDate = (dateStr: string): string => {
    try {
      const date = new Date(dateStr.replace(' ', 'T'));
      return date.toLocaleString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  // Obtener nombre del producto desde el cache o desde el servicio
  const getProductoNombre = async (idProducto: number): Promise<string> => {
    if (productosCache.has(idProducto)) {
      return productosCache.get(idProducto) || '';
    }

    try {
      const resp = await axios.get(`${INVENTORY_SERVICE_URL}/productos/${idProducto}`);
      const nombre = resp.data.nombre || `Producto #${idProducto}`;
      setProductosCache(prev => new Map(prev).set(idProducto, nombre));
      return nombre;
    } catch (err) {
      console.error(`Error fetching producto ${idProducto}:`, err);
      return `Producto #${idProducto}`;
    }
  };

  useEffect(() => {
    if (!userId) {
      setError('No hay usuario autenticado');
      setLoading(false);
      return;
    }
    let isMounted = true;
    const fetchVentas = async () => {
      try {
        setLoading(true);
        const url = `${SALES_SERVICE_URL}/compras/usuario/${userId}`;
        const resp = await axios.get<Venta[]>(url);
        if (!isMounted) return;
        console.log('Ventas recibidas:', resp.data);

        // Cargar nombres de productos para todos los detalles
        const cache = new Map<number, string>();
        for (const venta of resp.data) {
          if (venta.detalles) {
            for (const detalle of venta.detalles) {
              if (!cache.has(detalle.id_producto)) {
                try {
                  const productoResp = await axios.get(`${INVENTORY_SERVICE_URL}/productos/${detalle.id_producto}`);
                  cache.set(detalle.id_producto, productoResp.data.nombre || `Producto #${detalle.id_producto}`);
                } catch (err) {
                  console.error(`Error fetching producto ${detalle.id_producto}:`, err);
                  cache.set(detalle.id_producto, `Producto #${detalle.id_producto}`);
                }
              }
            }
          }
        }
        setProductosCache(cache);
        setVentas(resp.data || []);
      } catch (err: any) {
        console.error('Error fetching purchases:', err);
        if (!isMounted) return;
        if (err.response) setError(`Error ${err.response.status}: ${err.response.data?.message || 'al obtener historial'}`);
        else if (err.request) setError('No se recibió respuesta del microservicio (CORS o servicio caído).');
        else setError('Error: ' + err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchVentas();
    return () => { isMounted = false; };
  }, [SALES_SERVICE_URL, INVENTORY_SERVICE_URL, userId]);

  const toggleExpand = (id: number) => {
    setExpandedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  if (loading) return <div className="container"><p>Cargando historial de compras...</p></div>;
  if (error) return <div className="container"><p className="mensajeError">{error}</p></div>;
  if (ventas.length === 0) return <div className="container"><p className="no-purchases">No hay compras registradas.</p></div>;

  return (
    <main className="container purchase-history-page">
      <h2>Historial de Compras</h2>
      <div className="purchases-list">
        {ventas.map(v => (
          <article key={v.id_compra} className="purchase-card">
            <div className="purchase-header">
              <div>
                <strong>Compra #{v.id_compra}</strong>
                <div className="muted">Fecha: {formatDate(v.fecha)}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="muted">Total</div>
                <div><strong>${v.total.toLocaleString()}</strong></div>
                <div className={`purchase-status status-${(v.estado || 'pendiente')?.toLowerCase()}`}>
                  {v.estado || 'Pendiente'}
                </div>
              </div>
            </div>

            <div className="purchase-actions">
              <button className="btn small" onClick={() => toggleExpand(v.id_compra)}>
                {expandedIds.includes(v.id_compra) ? 'Ocultar productos' : 'Ver productos'}
              </button>
            </div>

            {expandedIds.includes(v.id_compra) && (
              <div className="purchase-items">
                {v.detalles && v.detalles.length > 0 ? (
                  <ul>
                    {v.detalles.map((detalle, idx) => (
                      <li key={idx}>
                        {productosCache.get(detalle.id_producto) || `Producto #${detalle.id_producto}`} — ${detalle.precio.toLocaleString()} x {detalle.cantidad} = ${(detalle.subtotal || detalle.precio * detalle.cantidad).toLocaleString()}
                      </li>
                    ))}
                  </ul>
                ) : <p className="muted">No hay productos detallados en esta compra.</p>}
              </div>
            )}
          </article>
        ))}
      </div>
    </main>
  );
};

export default PurchaseHistory;