import React, { useState } from 'react';

const Products: React.FC = () => {

  const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('featured');

    const products = [
        { id: 1, title: "Super Mario World (SNES)", price: 50000, desc: "Cartucho original, en buen estado.", image: "snes.jpg" },
        { id: 2, title: "Controller SNES - Repro", price: 25000, desc: "Control réplica con cable largo.", image: "controlSNES.jpg" },
        { id: 3, title: "PlayStation 1 - Slim", price: 80000, desc: "Consola PS1 edición Slim.", image: "ps1.jpg" },
        { id: 4, title: "Polera Retro • SNES Palette", price: 25000, desc: "Polera de algodón, diseño SNES pixel art.", image: "poleraSNES.jpg" },
        { id: 5, title: "The Legend of Zelda (N64)", price: 60000, desc: "Cartucho N64, versión completa.", image: "tlozOcarina.jpg" },
        { id: 6, title: "Game Boy Color • Bundle", price: 70000, desc: "Game Boy Color + cargador + juego.", image: "gbColor.jpg" },
        { id: 7, title: "Mega Drive — Headset", price: 150000, desc: "Auriculares retro compatibles.", image: "segaVR.jpg" },
        { id: 8, title: "Cartucho Pokémon Snap (N64)", price: 45000, desc: "Cartucho original, probado.", image: "pokemonSnap.jpg" },
    ];

    const filteredProducts = products
        .filter(product => product.title.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => {
            if (sortOrder === 'price-asc') return a.price - b.price;
            if (sortOrder === 'price-desc') return b.price - a.price;
            return 0; // 'featured' or any other case
        });


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
                    <button className="btn view-btn">Ver</button>
                    <button className="btn outline add-cart">Añadir</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    );
}

export default Products;