import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/profileStyles.css';

interface Usuario {
  id_usuario: number;
  nombre: string;
  correo: string;
  telefono?: string;
  foto_perfil?: string;
  rol?: { id_rol: number; nombre: string };
}

interface Producto {
  id_producto: number;
  nombre: string;
  precio: number;
}

interface Venta {
  id_compra: number;
  idUsuario: number;
  fecha: string;
  total: number;
  estado: string;
  detalles?: Producto[];
}

interface ProfileProps {
  userId?: number;
}

const Profile: React.FC<ProfileProps> = ({ userId }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'historial'>('info');

  const USER_SERVICE_URL = import.meta.env.VITE_USER_SERVICE_URL || "http://localhost:8081";
  const SALES_SERVICE_URL = import.meta.env.VITE_SALES_SERVICE_URL || "http://localhost:8083";
  const navigate = useNavigate();

  const rawUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch (e) {
      return null;
    }
  })();

  const extractedId = (rawUser && (rawUser.id_usuario ?? rawUser.id ?? rawUser?.idUsuario)) ?? null;
  const currentUserId = userId ?? extractedId;

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

  useEffect(() => {
    if (!currentUserId) {
      setError('No hay usuario autenticado');
      setLoading(false);
      console.warn('Profile: currentUserId is null/undefined. localStorage user:', rawUser);
      return;
    }

    let isMounted = true;

    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Profile: fetching user and ventas for id:', currentUserId);

        // Obtener datos del usuario
        const userUrl = `${USER_SERVICE_URL}/usuarios/${currentUserId}`;
        const userResp = await axios.get<Usuario>(userUrl);
        if (!isMounted) return;
        console.log('Usuario obtenido:', userResp.data);
        setUsuario(userResp.data);

        // Obtener historial de compras
        const ventasUrl = `${SALES_SERVICE_URL}/compras/usuario/${currentUserId}`;
        const ventasResp = await axios.get<Venta[]>(ventasUrl);
        if (!isMounted) return;
        console.log('Ventas obtenidas:', ventasResp.data);
        setVentas(ventasResp.data || []);
      } catch (err: any) {
        console.error('Error al cargar datos del perfil:', err);
        if (!isMounted) return;
        if (err.response) {
          const status = err.response.status;
          const url = err.config?.url;
          if (status === 404) {
            setError('Datos no encontrados (404). Verifica el ID y los endpoints.');
          } else if (status === 401 || status === 403) {
            setError('No autorizado al consultar el perfil (401/403).');
          } else if (status >= 500) {
            setError('Error en el servidor del microservicio.');
          } else {
            setError(`Error al cargar datos (${status}) en ${url}`);
          }
          console.debug('Response data:', err.response.data);
        } else if (err.request) {
          setError('No se recibió respuesta del microservicio. ¿Está corriendo y con CORS habilitado?');
          console.debug('Request made but no response:', err.request);
        } else {
          setError('Error inesperado al preparar la petición: ' + err.message);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchUserData();
    return () => { isMounted = false; };
  }, [currentUserId, USER_SERVICE_URL, SALES_SERVICE_URL]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleEditProfile = () => {
    navigate('/edit-profile');
  };

  if (loading) return <div className="container"><p>Cargando perfil...</p></div>;
  if (error) return <div className="container"><p className="mensajeError">{error}</p></div>;
  if (!usuario) return <div className="container"><p>Usuario no encontrado</p></div>;

  return (
    <main className="container profile-page">
      <section className="profile-header">
        <div className="profile-banner">
          {usuario.foto_perfil && (
            <img src={usuario.foto_perfil} alt="Foto de perfil" className="profile-avatar" />
          )}
          <div className="profile-info-header">
            <h1>{usuario.nombre}</h1>
            <p className="profile-email">{usuario.correo}</p>
            {usuario.rol && <span className="badge">{usuario.rol.nombre}</span>}
          </div>
        </div>
      </section>

      <section className="profile-tabs">
        <button
          className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`}
          onClick={() => setActiveTab('info')}
        >
          Información Personal
        </button>
        <button
          className={`tab-btn ${activeTab === 'historial' ? 'active' : ''}`}
          onClick={() => setActiveTab('historial')}
        >
          Historial de Compras ({ventas.length})
        </button>
      </section>

      {activeTab === 'info' && (
        <section className="profile-details">
          <h2>Detalles de la Cuenta</h2>
          <div className="details-grid">
            <div className="detail-item">
              <label>Nombre:</label>
              <p>{usuario.nombre}</p>
            </div>
            <div className="detail-item">
              <label>Correo:</label>
              <p>{usuario.correo}</p>
            </div>
            <div className="detail-item">
              <label>Teléfono:</label>
              <p>{usuario.telefono || 'No registrado'}</p>
            </div>
          </div>
        </section>
      )}

      {activeTab === 'historial' && (
        <section className="purchase-history">
          <h2>Historial de Compras</h2>
          {ventas.length === 0 ? (
            <p className="no-purchases">Aún no has realizado compras</p>
          ) : (
            <div className="purchases-list">
              {ventas.map(venta => (
                <article key={venta.id_compra} className="purchase-card">
                  <div className="purchase-header">
                    <span className="purchase-id">Compra #{venta.id_compra}</span>
                    <span className={`purchase-status status-${(venta.estado || 'pendiente').toLowerCase()}`}>
                      {venta.estado || 'Pendiente'}
                    </span>
                  </div>
                  <div className="purchase-details">
                    <p><strong>Fecha:</strong> {formatDate(venta.fecha)}</p>
                    <p><strong>Total:</strong> ${venta.total.toLocaleString()}</p>
                  </div>
                  <button className="btn btn-sm btn-outline" onClick={() => navigate(`/historial`)}>
                    Ver Detalles
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      )}
    </main>
  );
};

export default Profile;