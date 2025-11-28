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
    plataforma?: string;
    estado?: string;
    fotos?: string[];
}

interface Categoria {
    id_cat: number;
    nombre: string;
}

interface ProductsProps {
  addToCart: (product: { id: number; title: string; price: number; image: string }) => void;
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

    useEffect(() => {
      setLoading(true);
      axios.get<Product[]>('http://localhost:8082/productos')
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
      axios.get<Categoria[]>('http://localhost:8082/categorias')
        .then(resp => {
          setCategoria(resp.data);
        })
        .catch(err => {
          console.error(err);
          setError('No se pudieron cargar las categorías');
        })
    }, []);

    const filteredProducts = products
        .filter(product => product.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
        .filter(product => categoryFilter === 'all' ? true : product.categoria?.nombre === categoryFilter)
        .sort((a, b) => {
            if (sortOrder === 'price-asc') return a.precio - b.precio;
            if (sortOrder === 'price-desc') return b.precio - a.precio;
            return 0; // Por defecto, no ordenar (destacados)
        });

    const openModal = (product: Product) => {
        console.log("Producto seleccionado:", product);
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedProduct(null);
    };
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
              onChange={(e) => setSearchTerm(e.target.value)} // Update search term
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
              onChange={(e) => setSortOrder(e.target.value)} // Update sort order
            >
              <option value="featured">Destacados</option>
              <option value="price-asc">Precio: bajo → alto</option>
              <option value="price-desc">Precio: alto → bajo</option>
            </select>
          </div>

          <div id="products-grid" className="products-grid">
            {filteredProducts.map(product => (
              <article key={product.id_producto} className="product-card" data-id={product.id_producto} data-title={product.nombre} data-price={product.precio} data-desc={product.descripcion} data-image={product.fotos}>
                <img src={`/images/${product.fotos && product.fotos.length ? product.fotos[0] : 'placeholder.jpg'}`} alt={product.nombre}/>
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
                        image: product.fotos && product.fotos.length ? product.fotos[0] : 'placeholder.jpg'
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
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                  <button className="close" onClick={closeModal} aria-label="Cerrar">&times;</button>
                  <img src={`/images/${selectedProduct.fotos && selectedProduct.fotos.length ? selectedProduct.fotos[0] : 'placeholder.jpg'}`} alt={selectedProduct.nombre} />
                  <h4>{selectedProduct.nombre}</h4>
                  <p>{selectedProduct.descripcion}</p>
                  <p>Precio: ${selectedProduct.precio.toLocaleString()}</p>
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