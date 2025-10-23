import React from "react";
import { Routes, Route } from "react-router-dom";
//import Layout from "./components/Layout";
import Home from "./pages/Home";
//import Products from "./pages/Products";
//import Contact from "./pages/Contact";
//import Terms from "./pages/Terms";
//import Privacy from "./pages/Privacy";
//import { CartProvider } from "./context/CartContext";

export default function App() {
  return (

    <Routes>
      <Route path="/" element={<Home />} />
      {/*<Route path="/productos" element={<Products />} />
      <Route path="/contacto" element={<Contact />} />
      <Route path="/terminos" element={<Terms />} />
      <Route path="/privacidad" element={<Privacy />} />*/}
    </Routes>
  );
}
