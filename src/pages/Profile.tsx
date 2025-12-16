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

interface Resena {
  id: number;
  idProducto: number;
  idUsuario: number;
  texto: string;
  calificacion: number;
  fecha: string;
}

const Profile: React.FC<ProfileProps> = ({ userId }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'historial' | 'resenas'>('info');

  const USER_SERVICE_URL = import.meta.env.VITE_USER_SERVICE_URL || "http://localhost:8081";
  const SALES_SERVICE_URL = import.meta.env.VITE_SALES_SERVICE_URL || "http://localhost:8083";
  const REVIEWS_SERVICE_URL = import.meta.env.VITE_REVIEWS_SERVICE_URL || "http://localhost:8084";
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
  const token = localStorage.getItem('token');

  // Modal de reseña
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedProductForReview, setSelectedProductForReview] = useState<Producto | null>(null);
  const [reviewForm, setReviewForm] = useState<{ calificacion: number; texto: string }>({ calificacion: 5, texto: '' });
  const [existingReview, setExistingReview] = useState<Resena | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  // Nuevo: mapa de reseñas del usuario por producto y modo del modal
  const [userReviews, setUserReviews] = useState<Record<number, Resena>>({});
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'create'>('create');

  // Helper para obtener URL de la imagen del producto
  const INVENTORY_SERVICE_URL = import.meta.env.VITE_INVENTORY_SERVICE_URL || 'http://localhost:8082';
  const getProductImageUrl = (productId: number) => `${INVENTORY_SERVICE_URL}/productos/${productId}/foto`;

  // Cargar reseñas del usuario al montar / cuando cambien ventas / usuario
  useEffect(() => {
    if (!currentUserId) return;
    const fetchUserReviews = async () => {
      try {
        const url = `${REVIEWS_SERVICE_URL}/resenas/usuario/${currentUserId}`;
        const resp = await axios.get<Resena[]>(url);
        const map: Record<number, Resena> = {};
        resp.data.forEach(r => { map[r.idProducto] = r; });
        setUserReviews(map);
      } catch (err) {
        // silencioso: puede no tener reseñas
        setUserReviews({});
      }
    };
    fetchUserReviews();
  }, [currentUserId, REVIEWS_SERVICE_URL, ventas.length]);

  // Extraer productos comprados desde ventas (detalles)
  const productosComprados: Producto[] = React.useMemo(() => {
    const map = new Map<number, Producto>();
    ventas.forEach(v => {
      (v.detalles || []).forEach((p: Producto) => {
        if (p && !map.has(p.id_producto)) {
          map.set(p.id_producto, p);
        }
      });
    });
    return Array.from(map.values());
  }, [ventas]);

  // Abrir modal para crear/editar/ver reseña para un producto
  const openReviewModal = async (product: Producto) => {
    if (!currentUserId) {
      setReviewError('No hay usuario autenticado.');
      return;
    }
    setSelectedProductForReview(product);
    setReviewLoading(true);
    setReviewError(null);
    setExistingReview(null);
    setReviewForm({ calificacion: 5, texto: '' });

    // Si ya tenemos la reseña en el mapa, usarla inmediatamente
    const cached = userReviews[product.id_producto];
    if (cached) {
      setExistingReview(cached);
      setReviewForm({ calificacion: cached.calificacion || 5, texto: cached.texto || '' });
      setModalMode('view'); // ver reseña al abrir si ya existe
      setReviewLoading(false);
      setIsReviewModalOpen(true);
      return;
    }

    // Si no está en el mapa, intentar obtenerla (fallback)
    try {
      const url = `${REVIEWS_SERVICE_URL}/resenas/producto/${product.id_producto}/usuario/${currentUserId}`;
      const resp = await axios.get<Resena>(url);
      if (resp.status === 200 && resp.data) {
        setExistingReview(resp.data);
        setUserReviews(prev => ({ ...prev, [product.id_producto]: resp.data }));
        setReviewForm({ calificacion: resp.data.calificacion || 5, texto: resp.data.texto || '' });
        setModalMode('view');
      } else {
        setModalMode('create');
      }
    } catch (err: any) {
      if (!(err.response && err.response.status === 404)) {
        console.error('Error al obtener reseña existente:', err);
        setReviewError('No se pudo cargar la reseña existente.');
      }
      setModalMode('create');
    } finally {
      setReviewLoading(false);
      setIsReviewModalOpen(true);
    }
  };

  const closeReviewModal = () => {
    setIsReviewModalOpen(false);
    setSelectedProductForReview(null);
    setExistingReview(null);
    setReviewForm({ calificacion: 5, texto: '' });
    setReviewError(null);
    setModalMode('create');
  };

  const handleReviewChange = (field: 'calificacion' | 'texto', value: any) => {
    setReviewForm(prev => ({ ...prev, [field]: value }));
  };

  const submitReview = async () => {
    if (!selectedProductForReview || !currentUserId) return;
    if (reviewForm.calificacion < 1 || reviewForm.calificacion > 5) {
      setReviewError('La calificación debe estar entre 1 y 5.');
      return;
    }
    setReviewLoading(true);
    setReviewError(null);

    try {
      if (existingReview && modalMode === 'edit') {
        // Editar
        const url = `${REVIEWS_SERVICE_URL}/resenas/${existingReview.id}`;
        const body = { texto: reviewForm.texto, calificacion: reviewForm.calificacion };
        const resp = await axios.put<Resena>(url, body);
        // Actualizar mapa local con la reseña guardada
        setUserReviews(prev => ({ ...prev, [selectedProductForReview.id_producto]: resp.data }));
      } else {
        // Crear
        const url = `${REVIEWS_SERVICE_URL}/resenas`;
        const body = {
          idProducto: selectedProductForReview.id_producto,
          idUsuario: currentUserId,
          texto: reviewForm.texto,
          calificacion: reviewForm.calificacion
        };
        const resp = await axios.post<Resena>(url, body);
        // Añadir la nueva reseña al mapa local
        setUserReviews(prev => ({ ...prev, [selectedProductForReview.id_producto]: resp.data }));
      }
      // Cambiar a modo ver reseña después de crear/editar
      setExistingReview(userReviews[selectedProductForReview.id_producto] || null);
      setModalMode('view');
      // cerrar modal opcional o mantener abierto en modo ver
      setIsReviewModalOpen(false);
    } catch (err: any) {
      console.error('Error al enviar reseña:', err);
      if (err.response && err.response.status === 409) {
        setReviewError('Ya existe una reseña para este producto por este usuario.');
      } else {
        setReviewError('Error al guardar la reseña.');
      }
    } finally {
      setReviewLoading(false);
    }
  };

  const deleteReview = async () => {
    const reviewToDelete = existingReview || (selectedProductForReview && userReviews[selectedProductForReview.id_producto]);
    if (!reviewToDelete) return;
    setReviewLoading(true);
    setReviewError(null);
    try {
      const url = `${REVIEWS_SERVICE_URL}/resenas/${reviewToDelete.id}`;
      await axios.delete(url);
      // Remover del mapa local
      setUserReviews(prev => {
        const copy = { ...prev };
        delete copy[reviewToDelete.idProducto];
        return copy;
      });
      closeReviewModal();
    } catch (err) {
      console.error('Error al eliminar reseña:', err);
      setReviewError('No se pudo eliminar la reseña.');
    } finally {
      setReviewLoading(false);
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
        const userResp = await axios.get<Usuario>(userUrl, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!isMounted) return;
        console.log('Usuario obtenido:', userResp.data);
        setUsuario(userResp.data);

        // Obtener historial de compras
        const ventasUrl = `${SALES_SERVICE_URL}/compras/usuario/${currentUserId}`;
        const ventasResp = await axios.get<Venta[]>(ventasUrl, {
          headers: { Authorization: `Bearer ${token}` }
        });
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

  // Util para formatear fechas (compatible con ISO y LocalDateTime)
  function formatDate(value?: string | null) {
    if (!value) return '';
    try {
      const d = new Date(value);
      if (isNaN(d.getTime())) return value;
      return d.toLocaleString();
    } catch {
      return value;
    }
  }

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
        <button
          className={`tab-btn ${activeTab === 'resenas' ? 'active' : ''}`}
          onClick={() => setActiveTab('resenas')}
        >
          Reseñar productos
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

      {activeTab === 'resenas' && (
        <section className="purchased-products">
          <h2>Reseñar productos</h2>
          {productosComprados.length === 0 ? (
            <p>No se encontraron productos en tus compras.</p>
          ) : (
            <ul className="purchased-list">
              {productosComprados.map(prod => {
                const hasReview = !!userReviews[prod.id_producto];
                return (
                  <li key={prod.id_producto} className="purchased-item" style={{display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid #eee'}}>
                    <img
                      src={getProductImageUrl(prod.id_producto)}
                      alt={prod.nombre}
                      style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 6, background: '#f6f6f6' }}
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                    />
                    <div style={{flex: 1}}>
                      <div style={{fontWeight: 600}}>{prod.nombre}</div>
                      <div style={{color: '#666'}}>${prod.precio.toLocaleString()}</div>
                    </div>
                    <div>
                      <button
                        className="btn btn-sm"
                        onClick={() => openReviewModal(prod)}
                      >
                        {hasReview ? 'Ver reseña' : 'Calificar producto'}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}

      {/* Modal para reseñas: ahora soporta view / edit / create */}
      {isReviewModalOpen && selectedProductForReview && (
        <div className="modal-overlay" onClick={closeReviewModal} style={{background: 'rgba(0,0,0,0.4)'}}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ backgroundColor: '#fff', color: '#111', padding: 20, maxWidth: 640, width: '90%', borderRadius: 8, boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}
          >
            <button className="modal-close" onClick={closeReviewModal} style={{float: 'right', border: 'none', background: 'transparent', fontSize: 22}}>&times;</button>
            <h3 style={{marginTop: 0}}>
              {modalMode === 'view' ? 'Reseña' : modalMode === 'edit' ? 'Editar reseña' : 'Calificar producto'}
            </h3>
            <p><strong>{selectedProductForReview.nombre}</strong></p>

            {reviewError && <p className="mensajeError">{reviewError}</p>}

            {modalMode === 'view' && (userReviews[selectedProductForReview.id_producto] || existingReview) && (
              <>
                {(() => {
                  const r = userReviews[selectedProductForReview.id_producto] || existingReview!;
                  return (
                    <div>
                      <div style={{display: 'flex', gap: 8, alignItems: 'center', margin: '8px 0'}}>
                        {[1,2,3,4,5].map(n => (
                          <span key={n} style={{color: n <= r.calificacion ? '#f5b301' : '#ddd', fontSize: 20}}>★</span>
                        ))}
                      </div>
                      <p style={{whiteSpace: 'pre-wrap', marginTop: 8}}>{r.texto || <em>Sin texto</em>}</p>

                      <div style={{display: 'flex', gap: 8, marginTop: 12}}>
                        <button className="btn btn-primary" onClick={() => { setModalMode('edit'); setExistingReview(r); setReviewForm({ calificacion: r.calificacion, texto: r.texto }); }}>
                          Editar
                        </button>
                        <button className="btn btn-danger" onClick={deleteReview} disabled={reviewLoading}>
                          Borrar
                        </button>
                        <button className="btn btn-outline" onClick={closeReviewModal}>Cerrar</button>
                      </div>
                    </div>
                  );
                })()}
              </>
            )}

            {(modalMode === 'edit' || modalMode === 'create') && (
              <>
                <div className="form-group" style={{marginTop: 8}}>
                  <label>Calificación:</label>
                  <div className="stars" style={{display: 'flex', gap: 6, marginTop: 6}}>
                    {[1,2,3,4,5].map(n => (
                      <button
                        key={n}
                        type="button"
                        className={n <= reviewForm.calificacion ? 'star active' : 'star'}
                        onClick={() => handleReviewChange('calificacion', n)}
                        aria-label={`Dar ${n} estrellas`}
                        style={{fontSize: 20, background: 'transparent', border: 'none', cursor: 'pointer', color: n <= reviewForm.calificacion ? '#f5b301' : '#ccc'}}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group" style={{marginTop: 12}}>
                  <label>Reseña:</label>
                  <textarea
                    value={reviewForm.texto}
                    onChange={(e) => handleReviewChange('texto', e.target.value)}
                    rows={4}
                    placeholder="Escribe tu reseña..."
                    style={{width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ddd', background: '#fff'}}
                  />
                </div>

                <div className="modal-actions" style={{display: 'flex', gap: 8, marginTop: 12}}>
                  <button className="btn btn-primary" onClick={submitReview} disabled={reviewLoading}>
                    {modalMode === 'edit' ? 'Guardar cambios' : 'Enviar reseña'}
                  </button>
                  <button className="btn btn-outline" onClick={closeReviewModal}>Cancelar</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
};

export default Profile;