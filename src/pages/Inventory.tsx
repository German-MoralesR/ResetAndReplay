import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/inventoryStyles.css';

interface Categoria {
  id_cat: number;
  nombre: string;
}

interface Estado {
  id_estado: number;
  nombre: string;
}

interface Plataforma {
  id_plat: number;
  nombre: string;
}

interface Producto {
  id_producto: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  sku: string;
  categoria?: Categoria;
  estado?: Estado;
  plataforma?: Plataforma;
  foto?: string;
}

interface FormData {
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  sku: string;
  categoria?: { id_cat: number };
  estado?: { id_estado: number };
  plataforma?: { id_plat: number };
  foto?: string;
}

const Inventory: React.FC = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [estados, setEstados] = useState<Estado[]>([]);
  const [plataformas, setPlataformas] = useState<Plataforma[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    descripcion: '',
    precio: 0,
    stock: 0,
    sku: '',
    categoria: { id_cat: 1 },
    estado: { id_estado: 1 },
    plataforma: { id_plat: 1 },
    foto: ''
  });

  const INVENTORY_SERVICE_URL = import.meta.env.VITE_INVENTORY_SERVICE_URL || 'http://localhost:8082';

  // Cargar productos y opciones
  useEffect(() => {
    fetchProductos();
    fetchCategorias();
    fetchEstados();
    fetchPlataformas();
  }, []);

  const fetchProductos = async () => {
    try {
      setLoading(true);
      const resp = await axios.get<Producto[]>(`${INVENTORY_SERVICE_URL}/productos`);
      console.log('Productos cargados:', resp.data);
      setProductos(resp.data);
    } catch (err) {
      console.error('Error al cargar productos:', err);
      setError('No se pudieron cargar los productos');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategorias = async () => {
    try {
      const resp = await axios.get<Categoria[]>(`${INVENTORY_SERVICE_URL}/categorias`);
      setCategorias(resp.data);
    } catch (err) {
      console.error('Error al cargar categorías:', err);
    }
  };

  const fetchEstados = async () => {
    try {
      const resp = await axios.get<Estado[]>(`${INVENTORY_SERVICE_URL}/estados`);
      setEstados(resp.data);
    } catch (err) {
      console.error('Error al cargar estados:', err);
    }
  };

  const fetchPlataformas = async () => {
    try {
      const resp = await axios.get<Plataforma[]>(`${INVENTORY_SERVICE_URL}/plataformas`);
      setPlataformas(resp.data);
    } catch (err) {
      console.error('Error al cargar plataformas:', err);
    }
  };

  const handleOpenModal = (producto?: Producto) => {
    if (producto) {
      setEditingId(producto.id_producto);
      setFormData({
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        precio: producto.precio,
        stock: producto.stock,
        sku: producto.sku,
        categoria: producto.categoria ? { id_cat: producto.categoria.id_cat } : { id_cat: 1 },
        estado: producto.estado ? { id_estado: producto.estado.id_estado } : { id_estado: 1 },
        plataforma: producto.plataforma ? { id_plat: producto.plataforma.id_plat } : { id_plat: 1 },
        foto: producto.foto || ''
      });
    } else {
      setEditingId(null);
      setFormData({
        nombre: '',
        descripcion: '',
        precio: 0,
        stock: 0,
        sku: '',
        categoria: { id_cat: categorias[0]?.id_cat || 1 },
        estado: { id_estado: estados[0]?.id_estado || 1 },
        plataforma: { id_plat: plataformas[0]?.id_plat || 1 },
        foto: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'id_cat') {
      setFormData(prev => ({
        ...prev,
        categoria: { id_cat: parseInt(value) }
      }));
    } else if (name === 'id_estado') {
      setFormData(prev => ({
        ...prev,
        estado: { id_estado: parseInt(value) }
      }));
    } else if (name === 'id_plat') {
      setFormData(prev => ({
        ...prev,
        plataforma: { id_plat: parseInt(value) }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'precio' || name === 'stock' ? parseFloat(value) : value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nombre || !formData.sku || formData.precio <= 0 || formData.stock < 0) {
      setError('Por favor completa todos los campos correctamente');
      return;
    }

    try {
      if (editingId) {
        // Actualizar producto
        await axios.put(`${INVENTORY_SERVICE_URL}/productos/${editingId}`, formData);
        console.log('Producto actualizado');
      } else {
        // Crear producto
        await axios.post(`${INVENTORY_SERVICE_URL}/productos`, formData);
        console.log('Producto creado');
      }
      handleCloseModal();
      fetchProductos();
      setError(null);
    } catch (err: any) {
      console.error('Error al guardar producto:', err);
      setError(err.response?.data?.message || 'Error al guardar el producto');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      try {
        await axios.delete(`${INVENTORY_SERVICE_URL}/productos/${id}`);
        console.log('Producto eliminado');
        fetchProductos();
        setError(null);
      } catch (err: any) {
        console.error('Error al eliminar producto:', err);
        setError(err.response?.data?.message || 'Error al eliminar el producto');
      }
    }
  };

  if (loading) return <div className="container"><p>Cargando inventario...</p></div>;

  return (
    <main className="container inventory-page">
      <div className="inventory-header">
        <h2>Gestión de Inventario</h2>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          ➕ Agregar Producto
        </button>
      </div>

      {error && <p className="mensajeError">{error}</p>}

      <div className="products-table-wrapper">
        {productos.length === 0 ? (
          <p>No hay productos en el inventario.</p>
        ) : (
          <table className="products-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>SKU</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Categoría</th>
                <th>Estado</th>
                <th>Plataforma</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map(producto => (
                <tr key={producto.id_producto}>
                  <td>{producto.id_producto}</td>
                  <td className="nombre">{producto.nombre}</td>
                  <td>{producto.sku}</td>
                  <td className="precio">${producto.precio.toLocaleString()}</td>
                  <td className={`stock ${producto.stock <= 5 ? 'bajo' : ''}`}>
                    {producto.stock}
                  </td>
                  <td>{producto.categoria?.nombre || 'N/A'}</td>
                  <td>{producto.estado?.nombre || 'N/A'}</td>
                  <td>{producto.plataforma?.nombre || 'N/A'}</td>
                  <td className="acciones">
                    <button
                      className="btn btn-sm btn-edit"
                      onClick={() => handleOpenModal(producto)}
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button
                      className="btn btn-sm btn-delete"
                      onClick={() => handleDelete(producto.id_producto)}
                      title="Eliminar"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal para agregar/editar */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={handleCloseModal}>&times;</button>
            <h3>{editingId ? 'Editar Producto' : 'Nuevo Producto'}</h3>

            <form onSubmit={handleSubmit} className="product-form">
              <div className="form-group">
                <label htmlFor="nombre">Nombre *</label>
                <input
                  id="nombre"
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  placeholder="Nombre del producto"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="descripcion">Descripción</label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  placeholder="Descripción del producto"
                  rows={3}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="sku">SKU *</label>
                  <input
                    id="sku"
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleInputChange}
                    placeholder="SKU"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="precio">Precio *</label>
                  <input
                    id="precio"
                    type="number"
                    name="precio"
                    value={formData.precio}
                    onChange={handleInputChange}
                    placeholder="Precio"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="stock">Stock *</label>
                  <input
                    id="stock"
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    placeholder="Stock"
                    min="0"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="id_cat">Categoría *</label>
                  <select
                    id="id_cat"
                    name="id_cat"
                    value={formData.categoria?.id_cat || 1}
                    onChange={handleInputChange}
                    required
                  >
                    {categorias.map(cat => (
                      <option key={cat.id_cat} value={cat.id_cat}>
                        {cat.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="id_estado">Estado *</label>
                  <select
                    id="id_estado"
                    name="id_estado"
                    value={formData.estado?.id_estado || 1}
                    onChange={handleInputChange}
                    required
                  >
                    {estados.map(est => (
                      <option key={est.id_estado} value={est.id_estado}>
                        {est.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="id_plat">Plataforma *</label>
                  <select
                    id="id_plat"
                    name="id_plat"
                    value={formData.plataforma?.id_plat || 1}
                    onChange={handleInputChange}
                    required
                  >
                    {plataformas.map(plat => (
                      <option key={plat.id_plat} value={plat.id_plat}>
                        {plat.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="foto">URL Foto</label>
                <input
                  id="foto"
                  type="text"
                  name="foto"
                  value={formData.foto}
                  onChange={handleInputChange}
                  placeholder="URL de la imagen"
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingId ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default Inventory;