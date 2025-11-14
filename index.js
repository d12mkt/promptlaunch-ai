// index.js

// 1. IMPORTAR BIBLIOTECAS
const express = require('express');
const cors = require('cors');

// 2. CRIAR A APLICAÇÃO EXPRESS
const app = express();
const PORT = 4000;

// 3. CONFIGURAR MIDDLEWARES (PLUGINS)
app.use(cors()); // Permite requests do frontend
app.use(express.json()); // Permite entender JSON nas requisições

// 4. DADOS MOCKADOS (vamos copiar do seu frontend)
const mockProducts = [
  {
    id: 1,
    name: "Smartphone Galaxy S24",
    price: 2999.99,
    category: "Electronics",
    description: "Latest smartphone with advanced AI features",
    image: "https://via.placeholder.com/300x300?text=Galaxy+S24",
    inStock: true,
    rating: 4.5
  },
  {
    id: 2,
    name: "Wireless Bluetooth Headphones",
    price: 349.99,
    category: "Audio",
    description: "Noise-cancelling headphones with 30h battery",
    image: "https://via.placeholder.com/300x300?text=Headphones",
    inStock: true,
    rating: 4.3
  },
  {
    id: 3,
    name: "Smart Watch Pro",
    price: 899.99,
    category: "Wearables",
    description: "Health and fitness tracker with GPS",
    image: "https://via.placeholder.com/300x300?text=Smart+Watch",
    inStock: false,
    rating: 4.7
  },
  {
    id: 4,
    name: "Laptop Ultra Thin",
    price: 4599.99,
    category: "Computers",
    description: "Lightweight laptop for professionals",
    image: "https://via.placeholder.com/300x300?text=Laptop",
    inStock: true,
    rating: 4.8
  },
  {
    id: 5,
    name: "Gaming Keyboard RGB",
    price: 299.99,
    category: "Accessories",
    description: "Mechanical keyboard with RGB lighting",
    image: "https://via.placeholder.com/300x300?text=Keyboard",
    inStock: true,
    rating: 4.4
  },
  {
    id: 6,
    name: "Wireless Mouse",
    price: 149.99,
    category: "Accessories",
    description: "Ergonomic wireless mouse",
    image: "https://via.placeholder.com/300x300?text=Mouse",
    inStock: true,
    rating: 4.2
  }
];

// 5. ROTA DE TESTE
app.get('/', (req, res) => {
  res.send('🚀 Backend do CresceVendas AI está funcionando!');
});

// 6. ROTA DE PRODUTOS (NOSSO OBJETIVO PRINCIPAL)
app.get('/api/products', (req, res) => {
  console.log('✅ Requisição recebida em /api/products');
  res.json(mockProducts);
});

// 7. INICIAR O SERVIDOR
app.listen(PORT, () => {
  console.log(`🎯 Servidor rodando em: http://localhost:${PORT}`);
  console.log(`📦 Endpoint de produtos: http://localhost:${PORT}/api/products`);
});