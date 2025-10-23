import React from "react";

import "../styles/privacyStyles.css";

const Terms: React.FC = () => {
  return (
    <div className="app-container">
        <h2>Política de Privacidad</h2>
        <p className= "p-titulo">En <strong>RetroStore</strong> respetamos tu privacidad. Esta política explica qué datos recolectamos, con qué propósito y cómo los protegemos — todo con la estética retro que nos caracteriza.</p>

        <section>
        <h3>1. Datos que recopilamos</h3>
        <ul>
            <li><strong>Datos de contacto:</strong> nombre, correo y dirección de envío, necesarios para procesar pedidos.</li>
            <li><strong>Información de pago:</strong> procesada por el proveedor de pagos; RetroStore no almacena números completos de tarjetas en nuestros servidores (salvo tokenización por el proveedor).</li>
            <li><strong>Datos de uso:</strong> registros de visitas, páginas vistas y preferencias (cookies, análisis).</li>
        </ul>
        </section>

        <section>
        <h3>2. Finalidad del tratamiento</h3>
        <p>Usamos tus datos para: procesar y enviar pedidos, responder consultas, gestionar devoluciones, mejorar la experiencia en el sitio y enviar comunicaciones comerciales si has aceptado recibirlas.</p>
        </section>

        <section>
        <h3>3. Cookies y tecnologías similares</h3>
        <p>Usamos cookies para funcionalidades esenciales (carrito, sesión) y para métricas/análisis. Puedes configurar o bloquear cookies desde tu navegador, aunque algunas funciones pueden verse limitadas.</p>
        </section>

        <section>
        <h3>4. Compartir datos con terceros</h3>
        <p>Compartimos datos solo con proveedores necesarios: servicios de pago, logística (envío) y plataformas de análisis. Todos nuestros proveedores están obligados a proteger tus datos y usarlos solo para cumplir sus funciones.</p>
        </section>

        <section>
        <h3>5. Seguridad</h3>
        <p>Implementamos medidas técnicas y administrativas razonables para proteger tus datos (protocolos seguros, acceso restringido). Sin embargo, ninguna transmisión por Internet es 100% segura.</p>
        </section>

        <section>
        <h3>6. Conservación de datos</h3>
        <p>Mantenemos los datos el tiempo necesario para los fines indicados (procesamiento de pedidos, obligaciones legales o hasta que solicites su supresión, cuando proceda).</p>
        </section>

        <section>
        <h3>7. Derechos de los usuarios</h3>
        <p>Dependiendo de la legislación aplicable, puedes solicitar acceso, rectificación, supresión o portabilidad de tus datos. Para ejercer tus derechos contáctanos en <a href="mailto:info@retrostoresimulado.com">info@retrostoresimulado.com</a>.</p>
        </section>

        <section>
        <h3>8. Cambios en la política</h3>
        <p>Podemos actualizar esta política. Publicaremos la versión vigente con su fecha de última modificación.</p>
        </section>

        <p className="p-disc"><em>Versión temática RetroStore — esta política es un ejemplo para fines académicos. Para uso real, considera la revisión por un especialista en protección de datos.</em></p>
    </div>
  );
}

export default Terms;