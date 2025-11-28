import React, { useState } from 'react';
import axios from 'axios';

interface Product {
    id: number;
    nombre: string;
    descripcion: string;
    precio: number;
    stock: number;
    image: string;
    sku: string;
    categoria: string;
    plataforma: string;
    estado: string;
    fotos: string[];
}