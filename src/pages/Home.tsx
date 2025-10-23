import React from 'react';
import "../styles/homeStyles.css";

const Home: React.FC = () => {
    return (
      <main>
          <section className="hero">
            <div className="container hero-inner">
              <div className="hero-text">
                <h2>Vuelve a jugar. Redescubre clásicos.</h2>
                <p>Encuentra consolas, cartuchos, accesorios y merch con la paleta SNES y todo el feeling retro.</p>
                <a href="/products" className="btn large">Ver Productos</a>
              </div>
              <div className="hero-art">
                <img src="/images/rrlogo.png" alt="Consola retro"/>
              </div>
            </div>
          </section>
        </main>

    );
}

export default Home;