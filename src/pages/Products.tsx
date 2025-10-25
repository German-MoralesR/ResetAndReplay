import React, { useState } from 'react';
import { createPortal } from 'react-dom';

import "../styles/productsStyles.css";

interface Product {
    id: number;
    title: string;
    price: number;
    desc: string;
    image: string;
    category: string;
}

const Products: React.FC = () => {

  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('featured');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

    const products: Product[] = [
        { id: 1, title: "Super Mario World (SNES)", price: 50000, desc: "Cartucho original, en buen estado.", image: "snes.jpg", category: "juegos" },
        { id: 2, title: "Controller SNES - Repro", price: 25000, desc: "Control réplica con cable largo.", image: "controlSNES.jpg", category: "accesorios" },
        { id: 3, title: "PlayStation 1 - Slim", price: 80000, desc: "Consola PS1 edición Slim.", image: "ps1.jpg", category: "consolas" },
        { id: 4, title: "Polera Retro • SNES Palette", price: 25000, desc: "Polera de algodón, diseño SNES pixel art.", image: "poleraSNES.jpg", category: "merchandising" },
        { id: 5, title: "The Legend of Zelda (N64)", price: 60000, desc: "Cartucho N64, versión completa.", image: "tlozOcarina.jpg", category: "juegos" },
        { id: 6, title: "Game Boy Color • Bundle", price: 70000, desc: "Game Boy Color + cargador + juego.", image: "gbColor.jpg", category: "consolas" },
        { id: 7, title: "Mega Drive — Headset", price: 150000, desc: "Auriculares retro compatibles.", image: "segaVR.jpg", category: "accesorios" },
        { id: 8, title: "Cartucho Pokémon Snap (N64)", price: 45000, desc: "Cartucho original, probado.", image: "pokemonSnap.jpg", category: "juegos" },
        { id: 9, title: "Pokemon Gold (GBC)", price: 55000, desc: "Cartucho Pokémon Gold para GBC.", image: "pokemonGold.jpg", category: "juegos" },
        { id:10, title: "Pokemon Silver (GBC)", price: 55000, desc: "Cartucho Pokémon Silver para GBC.", image: "pokemonSilver.jpg", category: "juegos" },
        { id:11, title: "Pokemon Crystal (GBC)", price: 60000, desc: "Cartucho Pokémon Crystal para GBC.", image: "pokemonCrystal.jpg", category: "juegos" },
        { id:12, title: "The Legend of Zelda: Majora's Mask (N64)", price: 65000, desc: "Cartucho N64 en excelente estado.", image: "tlozMajorasMask.jpg", category: "juegos" },
        { id:13, title: "Donkey Kong Country (SNES)", price: 50000, desc: "Cartucho original de Donkey Kong.", image: "dkCountry.jpg", category: "juegos" },
        { id:14, title: "Street Fighter II (SNES)", price: 55000, desc: "Cartucho original de Street Fighter II.", image: "streetFighter2.jpg", category: "juegos" },
        { id:15, title: "Consola Super Nintendo Entertainment System (SNES)", price: 120000, desc: "Consola SNES en buen estado de funcionamiento.", image: "consolaSnes.jpg", category: "consolas" },
        { id:16, title: "Super Mario World (SNES)", price: 50000, desc: "Cartucho original de Super Mario World para SNES.", image: "superMarioWorld.jpg", category: "juegos" },
    ];

    const filteredProducts = products
        .filter(product => product.title.toLowerCase().includes(searchTerm.toLowerCase()))
        .filter(product => categoryFilter === 'all' ? true : product.category === categoryFilter)
        .sort((a, b) => {
            if (sortOrder === 'price-asc') return a.price - b.price;
            if (sortOrder === 'price-desc') return b.price - a.price;
            return 0; // 'featured' or any other case
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
              <option value="juegos">Juegos</option>
              <option value="consolas">Consolas</option>
              <option value="accesorios">Accesorios</option>
              <option value="merchandising">Merchandising</option>
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
              <article key={product.id} className="product-card" data-id={product.id} data-title={product.title} data-price={product.price} data-desc={product.desc} data-image={product.image}>
                <img src={`/images/${product.image}`} alt={product.title}/>
                <div className="card-body">
                  <h4 className="product-title">{product.title}</h4>
                  <p className="price">${product.price.toLocaleString()}</p>
                  <div className="card-actions">
                    <button className="btn view-btn" onClick={() => openModal(product)}>Ver</button>
                    <button className="btn outline add-cart">Añadir</button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {isModalOpen && selectedProduct && createPortal(
            (
              <div className="modal" role="dialog" aria-modal="true" onClick={closeModal} style={{ display: 'flex' }}> {/* <- estilo necesario por alguna razon, siendo que esta aplicado en la hoja de estilos, pero sin hacerlo aqui este no aparece */}
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                  <button className="close" onClick={closeModal} aria-label="Cerrar">&times;</button>
                  <img src={`/images/${selectedProduct.image}`} alt={selectedProduct.title} />
                  <h4>{selectedProduct.title}</h4>
                  <p>{selectedProduct.desc}</p>
                  <p>Precio: ${selectedProduct.price.toLocaleString()}</p>
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