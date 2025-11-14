// index.js - VERSÃO COM MONGODB ATLAS

// 1. IMPORTAR BIBLIOTECAS
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// 2. CRIAR A APLICAÇÃO EXPRESS
const app = express();
const PORT = process.env.PORT || 4000;

// 3. CONFIGURAR MIDDLEWARES
app.use(cors());
app.use(express.json());

// 4. CONECTAR COM MONGODB ATLAS
console.log('🔄 Conectando ao MongoDB Atlas...');
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/crescevendas', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Conectado ao MongoDB Atlas'))
.catch(err => {
  console.error('❌ Erro ao conectar com MongoDB:', err);
  process.exit(1);
});

// 5. MODELO DE PRODUTO
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  inStock: { type: Boolean, default: true },
  rating: { type: Number, min: 0, max: 5 }
}, { 
  timestamps: true 
});

const Product = mongoose.model('Product', productSchema);

// 6. INICIALIZAR BANCO COM DADOS (se estiver vazio)
async function initializeDatabase() {
  try {
    const count = await Product.countDocuments();
    if (count === 0) {
      console.log('📦 Inicializando banco com produtos...');
      
      const initialProducts = [
        {
          name: "Smartphone Galaxy S24",
          price: 2999.99,
          category: "Electronics",
          description: "Latest smartphone with advanced AI features",
          image: "https://via.placeholder.com/300x300?text=Galaxy+S24",
          inStock: true,
          rating: 4.5
        },
        {
          name: "Wireless Bluetooth Headphones",
          price: 349.99,
          category: "Audio",
          description: "Noise-cancelling headphones with 30h battery",
          image: "https://via.placeholder.com/300x300?text=Headphones",
          inStock: true,
          rating: 4.3
        },
        {
          name: "Smart Watch Pro",
          price: 899.99,
          category: "Wearables",
          description: "Health and fitness tracker with GPS",
          image: "https://via.placeholder.com/300x300?text=Smart+Watch",
          inStock: false,
          rating: 4.7
        },
        {
          name: "Laptop Ultra Thin",
          price: 4599.99,
          category: "Computers",
          description: "Lightweight laptop for professionals",
          image: "https://via.placeholder.com/300x300?text=Laptop",
          inStock: true,
          rating: 4.8
        },
        {
          name: "Gaming Keyboard RGB",
          price: 299.99,
          category: "Accessories",
          description: "Mechanical keyboard with RGB lighting",
          image: "https://via.placeholder.com/300x300?text=Keyboard",
          inStock: true,
          rating: 4.4
        },
        {
          name: "Wireless Mouse",
          price: 149.99,
          category: "Accessories",
          description: "Ergonomic wireless mouse",
          image: "https://via.placeholder.com/300x300?text=Mouse",
          inStock: true,
          rating: 4.2
        }
      ];

      await Product.insertMany(initialProducts);
      console.log('✅ Produtos inseridos no banco!');
    }
  } catch (error) {
    console.error('❌ Erro ao inicializar banco:', error);
  }
}

// 7. ROTAS ATUALIZADAS

// Health Check com status do banco
app.get('/', async (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'Conectado' : 'Desconectado';
  res.json({
    message: '🚀 Backend CresceVendas - MongoDB Edition',
    status: 'OK',
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

// Buscar todos os produtos (AGORA DO BANCO)
app.get('/api/products', async (req, res) => {
  try {
    console.log('📦 Buscando produtos do MongoDB...');
    const products = await Product.find();
    
    res.json({
      success: true,
      data: products,
      total: products.length,
      source: 'MongoDB Atlas'
    });
  } catch (error) {
    console.error('❌ Erro ao buscar produtos:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Buscar produto por ID
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Produto não encontrado'
      });
    }
    
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar produto'
    });
  }
});

// 8. INICIAR SERVIDOR
app.listen(PORT, async () => {
  console.log(`🎯 Servidor rodando na porta ${PORT}`);
  console.log(`🌐 MongoDB: ${mongoose.connection.readyState === 1 ? 'Conectado' : 'Conectando...'}`);
  
  // Inicializar banco se necessário
  await initializeDatabase();
});