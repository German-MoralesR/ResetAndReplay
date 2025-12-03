import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';

import "../styles/productsStyles.css";

interface Product {
    id_producto: number;
    nombre: string;
    descripcion: string;
    precio: number;
    stock?: number;
    sku?: string;
    categoria?: Categoria;
    plataforma?: Plataforma;
    estado?: Estado;
}

interface Plataforma {
    id_plat: number;
    nombre: string;
}

interface Estado {
    id_estado: number;
    nombre: string;
}

interface Categoria {
    id_cat: number;
    nombre: string;
}

interface ProductsProps {
  addToCart: (product: { id: number; title: string; price: number; image: string }) => void;
}

interface Resena {
  id: number;
  idProducto: number;
  idUsuario: number;
  texto: string;
  calificacion: number;
  fecha: string;
}

interface ResenaWithUser extends Resena {
  nombreUsuario?: string;
}

const Products: React.FC<ProductsProps> = ({ addToCart }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categoria, setCategoria] = useState<Categoria[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('featured');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [productReviews, setProductReviews] = useState<Record<number, ResenaWithUser[]>>({});
    const [loadingReviews, setLoadingReviews] = useState(false);
    const INVENTORY_SERVICE_URL = 'http://localhost:8082';
    const REVIEWS_SERVICE_URL = 'http://localhost:8084';
    const USER_SERVICE_URL = 'http://localhost:8081';

    const getProductImageUrl = (productId: number) => {
      return `${INVENTORY_SERVICE_URL}/productos/${productId}/foto`;
    };

    useEffect(() => {
      setLoading(true);
      axios.get<Product[]>(`${INVENTORY_SERVICE_URL}/productos`)
        .then(resp => {
          setProducts(resp.data);
        })
        .catch(err => {
          console.error(err);
          setError('No se pudieron cargar los productos');
        })
        .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
      setLoading(true);
      axios.get<Categoria[]>(`${INVENTORY_SERVICE_URL}/categorias`)
        .then(resp => {
          setCategoria(resp.data);
        })
        .catch(err => {
          console.error(err);
          setError('No se pudieron cargar las categorías');
        })
        .finally(() => setLoading(false));
    }, []);

    const filteredProducts = products
        .filter(product => product.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
        .filter(product => categoryFilter === 'all' ? true : product.categoria?.nombre === categoryFilter)
        .sort((a, b) => {
            if (sortOrder === 'price-asc') return a.precio - b.precio;
            if (sortOrder === 'price-desc') return b.precio - a.precio;
            return 0; // Por defecto, no ordenar (destacados)
        });

    const loadProductReviews = async (productId: number) => {
        if (productReviews[productId]) {
            return; // Ya cargadas
        }
        setLoadingReviews(true);
        try {
            const resp = await axios.get<Resena[]>(`${REVIEWS_SERVICE_URL}/resenas/producto/${productId}`);
            
            // Obtener nombre de usuario para cada reseña
            const reviewsWithUser = await Promise.all(
                resp.data.map(async (review) => {
                    try {
                        const userResp = await axios.get<{ nombre: string }>(`${USER_SERVICE_URL}/usuarios/${review.idUsuario}`);
                        return { ...review, nombreUsuario: userResp.data.nombre };
                    } catch (err) {
                        console.error(`Error al obtener usuario ${review.idUsuario}:`, err);
                        return { ...review, nombreUsuario: `Usuario #${review.idUsuario}` };
                    }
                })
            );
            
            setProductReviews(prev => ({ ...prev, [productId]: reviewsWithUser }));
        } catch (err) {
            console.error('Error al cargar reseñas:', err);
        } finally {
            setLoadingReviews(false);
        }
    };

    const openModal = (product: Product) => {
        console.log("Producto seleccionado:", product);
        setSelectedProduct(product);
        setIsModalOpen(true);
        loadProductReviews(product.id_producto);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedProduct(null);
    };

    if (loading) return <div className="container"><p>Cargando productos...</p></div>;
    if (error) return <div className="container"><p className="error">{error}</p></div>;

    return (
      <main className="container">
        <section className="products">
          <h2 className="section-title">Catálogo Retro — Productos seleccionados</h2>

          <div className="controls">
            <label>Buscar producto:</label>
            <input 
              id="search" 
              className="search" 
              type="search" 
              placeholder="Buscar producto..." 
              aria-label="Buscar productos"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <br />

            <label htmlFor="category">Categoría:</label>
            <select 
              id="category" 
              aria-label="Filtrar por categoría" 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">Todas las categorías</option>
              {categoria.map(cat => (
                <option key={cat.id_cat} value={cat.nombre}>{cat.nombre}</option>
              ))}
            </select>

            <label htmlFor="sort">Ordenar por:</label>
            <select 
              id="sort" 
              aria-label="Ordenar productos" 
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="featured">Destacados</option>
              <option value="price-asc">Precio: bajo → alto</option>
              <option value="price-desc">Precio: alto → bajo</option>
            </select>
          </div>

          <div id="products-grid" className="products-grid">
            {filteredProducts.map(product => (
              <article key={product.id_producto} className="product-card" data-id={product.id_producto} data-title={product.nombre} data-price={product.precio} data-desc={product.descripcion}>
                <img src={getProductImageUrl(product.id_producto)} alt={product.nombre} onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/placeholder.jpg';
                }}/>
                <div className="card-body">
                  <h4 className="product-title">{product.nombre}</h4>
                  <p className="price">${product.precio.toLocaleString()}</p>
                  <div className="card-actions">
                    <button className="btn view-btn" onClick={() => openModal(product)}>Ver</button>
                    <button 
                      className="btn outline add-cart" 
                      onClick={() => addToCart({
                        id: product.id_producto,
                        title: product.nombre,
                        price: product.precio,
                        image: getProductImageUrl(product.id_producto)
                      })}
                    >
                      Añadir
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {isModalOpen && selectedProduct && createPortal(
            (
              <div className="modal" role="dialog" aria-modal="true" onClick={closeModal} style={{ display: 'flex' }}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxHeight: '90vh', overflowY: 'auto' }}>
                  <button className="close" onClick={closeModal} aria-label="Cerrar">&times;</button>
                  
                  {/* Imagen del producto */}
                  <img src={getProductImageUrl(selectedProduct.id_producto)} alt={selectedProduct.nombre} style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', borderRadius: '4px' }} onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/placeholder.jpg';
                  }} />
                  
                  {/* Información principal */}
                  <h4 style={{ marginTop: '16px' }}>{selectedProduct.nombre}</h4>
                  <p style={{ fontSize: '18px', fontWeight: '600', color: '#2c3e50' }}>
                    ${selectedProduct.precio.toLocaleString()}
                  </p>
                  
                  {/* Descripción */}
                  <div style={{ marginTop: '12px', marginBottom: '12px' }}>
                    <h5 style={{ marginBottom: '6px', color: '#555' }}>Descripción</h5>
                    <p style={{ whiteSpace: 'pre-wrap', color: '#666', fontSize: '14px' }}>
                      {selectedProduct.descripcion}
                    </p>
                  </div>

                  {/* Información adicional en grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px', marginBottom: '16px', padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                    <div>
                      <label style={{ fontWeight: '600', color: '#333', fontSize: '12px' }}>Stock disponible</label>
                      <p style={{ margin: '4px 0', fontSize: '16px', color: selectedProduct.stock && selectedProduct.stock > 0 ? '#27ae60' : '#e74c3c' }}>
                        {selectedProduct.stock ?? 'N/A'} unidades
                      </p>
                    </div>

                    <div>
                      <label style={{ fontWeight: '600', color: '#333', fontSize: '12px' }}>SKU</label>
                      <p style={{ margin: '4px 0', fontSize: '14px', color: '#666', fontFamily: 'monospace' }}>
                        {selectedProduct.sku ?? 'N/A'}
                      </p>
                    </div>

                    <div>
                      <label style={{ fontWeight: '600', color: '#333', fontSize: '12px' }}>Categoría</label>
                      <p style={{ margin: '4px 0', fontSize: '14px', color: '#666' }}>
                        {selectedProduct.categoria?.nombre ?? 'Sin categoría'}
                      </p>
                    </div>

                    <div>
                      <label style={{ fontWeight: '600', color: '#333', fontSize: '12px' }}>Plataforma</label>
                      <p style={{ margin: '4px 0', fontSize: '14px', color: '#666' }}>
                        {selectedProduct.plataforma?.nombre ?? 'N/A'}
                      </p>
                    </div>

                    <div>
                      <label style={{ fontWeight: '600', color: '#333', fontSize: '12px' }}>Estado</label>
                      <p style={{ margin: '4px 0', fontSize: '14px', color: '#666' }}>
                        {selectedProduct.estado?.nombre ?? 'N/A'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Botones de acción */}
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                    <button 
                      className="btn view-btn" 
                      onClick={() => addToCart({
                        id: selectedProduct.id_producto,
                        title: selectedProduct.nombre,
                        price: selectedProduct.precio,
                        image: getProductImageUrl(selectedProduct.id_producto)
                      })}
                      style={{ flex: 1 }}
                    >
                      Añadir al carrito
                    </button>
                    <button className="btn outline" onClick={closeModal} style={{ flex: 1 }}>
                      Cerrar
                    </button>
                  </div>

                  {/* Sección de reseñas */}
                  <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
                    <h5 style={{ marginBottom: '12px' }}>Reseñas de usuarios</h5>
                    {loadingReviews ? (
                      <p style={{ color: '#999' }}>Cargando reseñas...</p>
                    ) : productReviews[selectedProduct.id_producto] && productReviews[selectedProduct.id_producto].length > 0 ? (
                      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {productReviews[selectedProduct.id_producto].map(resena => (
                          <div key={resena.id} style={{ marginBottom: '15px', padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '4px', borderLeft: '4px solid #ffc107' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                              <strong style={{ color: '#333' }}>{resena.nombreUsuario || 'Usuario anónimo'}</strong>
                              <div style={{ display: 'flex', gap: '2px' }}>
                                {[1,2,3,4,5].map(n => (
                                  <span key={n} style={{ color: n <= resena.calificacion ? '#ffc107' : '#ddd', fontSize: '16px' }}>★</span>
                                ))}
                              </div>
                            </div>
                            <p style={{ margin: '8px 0', fontSize: '13px', color: '#666', whiteSpace: 'pre-wrap' }}>{resena.texto}</p>
                            <p style={{ margin: '4px 0', fontSize: '11px', color: '#999' }}>
                              {new Date(resena.fecha).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ color: '#999', fontSize: '14px' }}>No hay reseñas para este producto aún.</p>
                    )}
                  </div>
                </div>
              </div>
            ),
            document.body
          )}
        </section>
      </main>
    );
}

export default Products;