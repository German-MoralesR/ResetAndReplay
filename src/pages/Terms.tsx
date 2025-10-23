import React from "react";

import "../styles/termsStyles.css";

const Terms: React.FC = () => {
    return (
        <div className="app-container">
            <h2>Términos y Condiciones</h2>
            <p className="p-titulo">Bienvenido a <strong>RetroStore</strong>. Antes de usar este sitio o realizar compras, por favor lee detenidamente estos términos y condiciones. Al acceder o comprar en RetroStore aceptas estar sujeto a estos términos.</p>

            <section>
            <h3>1. Definiciones</h3>
            <p>“Tienda”, “nosotros” o “RetroStore”: el operador del sitio web. “Cliente”, “usted”: la persona que navega o compra. “Productos”: consolas, juegos, accesorios y merch ofrecidos en el sitio.</p>
            </section>

            <section>
            <h3>2. Pedidos y disponibilidad</h3>
            <p>Los pedidos están sujetos a disponibilidad. Nos reservamos el derecho de rechazar o cancelar pedidos si detectamos discrepancias en stock, precio o datos del pedido. En caso de cancelación le notificaremos por e-mail y reembolsaremos los montos pagados.</p>
            </section>

            <section>
            <h3>3. Precios y pagos</h3>
            <p>Los precios mostrados incluyen la moneda indicada en el sitio. Los métodos de pago aceptados serán detallados en el proceso de compra. Nos reservamos el derecho de corregir errores tipográficos en precios o descripciones.</p>
            </section>

            <section>
            <h3>4. Envíos y devoluciones</h3>
            <p>Los plazos de envío varían según la ubicación y la opción seleccionada. Para devoluciones aplican condiciones: el producto debe llegar en las condiciones comunicadas en la ficha (a menos que se indique lo contrario en productos de colección o usados). Gastos de envío asociados a devoluciones serán responsabilidad del cliente salvo acuerdo previo.</p>
            </section>

            <section>
            <h3>5. Productos usados y coleccionables</h3>
            <p>Algunos artículos pueden ser de segunda mano o coleccionables. Cada ficha especifica el estado (ej. “funcional — caja incluida”, “repro”, etc.). Aconsejamos leer la descripción antes de comprar y, si es necesario, preguntar por fotos adicionales.</p>
            </section>

            <section>
            <h3>6. Limitación de responsabilidad</h3>
            <p>Hasta donde permite la ley, RetroStore no será responsable por daños indirectos, lucro cesante o pérdida de datos derivados del uso del sitio o los productos, salvo en casos de dolo o negligencia grave comprobada.</p>
            </section>

            <section>
            <h3>7. Propiedad intelectual</h3>
            <p>Todo el contenido del sitio (textos, imágenes, logos, código) está protegido por derechos de autor. Queda prohibida la reproducción no autorizada.</p>
            </section>

            <section>
            <h3>8. Cambios a estos términos</h3>
            <p>Podemos actualizar estos términos en cualquier momento. Publicaremos la versión vigente en este documento con fecha de la última modificación. Es responsabilidad del usuario revisarlos periódicamente.</p>
            </section>

            <section>
            <h3>9. Contacto</h3>
            <p>Si tienes preguntas sobre estos términos, escríbenos a <a href="mailto:info@retrostoresimulado.com">info@retrostoresimulado.com</a>.</p>
            </section>

            <p className="p-disc"><em>Versión temática RetroStore — estilo SNES. Este documento es un ejemplo para fines académicos y puede requerir revisión legal para su uso real.</em></p>
        </div>
    );
}

export default Terms;