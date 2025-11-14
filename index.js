// index.js - VERSÃO COM AUTENTICAÇÃO JWT COMPLETA

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

// Middlewares
app.use(cors());
app.use(express.json());

// Conexão MongoDB
console.log('🔄 Conectando ao MongoDB Atlas...');
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Conectado ao MongoDB Atlas'))
.catch(err => {
  console.error('❌ Erro MongoDB:', err);
  process.exit(1);
});

// ==================== MODELOS ====================

// Modelo de Produto
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  inStock: { type: Boolean, default: true },
  rating: { type: Number, min: 0, max: 5 },
  stock: { type: Number, default: 10 }
}, { timestamps: true });

// Modelo de Usuário
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String, default: '' }
}, { timestamps: true });

// Modelo de Pedido
const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    price: Number,
    quantity: Number,
    image: String
  }],
  total: { type: Number, required: true },
  status: { type: String, default: 'pending' }, // pending, confirmed, shipped, delivered
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  }
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);
const User = mongoose.model('User', userSchema);
const Order = mongoose.model('Order', orderSchema);

// ==================== MIDDLEWARES ====================

// Middleware de autenticação
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      error: 'Token de acesso requerido' 
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        success: false, 
        error: 'Token inválido' 
      });
    }
    req.user = user;
    next();
  });
};

// ==================== ROTAS DE AUTENTICAÇÃO ====================

// Registrar usuário
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validar dados
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Nome, email e senha são obrigatórios'
      });
    }

    // Verificar se usuário já existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Usuário já existe'
      });
    }

    // Criptografar senha
    const hashedPassword = await bcrypt.hash(password, 12);

    // Criar usuário
    const user = new User({
      name,
      email,
      password: hashedPassword
    });

    await user.save();

    // Gerar token JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email }, 
      JWT_SECRET, 
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        },
        token
      }
    });

  } catch (error) {
    console.error('❌ Erro no registro:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Login usuário
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar dados
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email e senha são obrigatórios'
      });
    }

    // Encontrar usuário
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Credenciais inválidas'
      });
    }

    // Verificar senha
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        error: 'Credenciais inválidas'
      });
    }

    // Gerar token JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email }, 
      JWT_SECRET, 
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        },
        token
      }
    });

  } catch (error) {
    console.error('❌ Erro no login:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// ==================== ROTAS DE PRODUTOS (PÚBLICAS) ====================

// Health Check
app.get('/', (req, res) => {
  res.json({
    message: '🚀 CresceVendas API - Sistema de Autenticação',
    status: 'OK',
    database: mongoose.connection.readyState === 1 ? 'Conectado' : 'Desconectado',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login'
      },
      products: {
        list: 'GET /api/products',
        byId: 'GET /api/products/:id'
      },
      orders: {
        create: 'POST /api/orders (autenticado)',
        myOrders: 'GET /api/orders/my-orders (autenticado)'
      }
    }
  });
});

// Listar produtos
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json({
      success: true,
      data: products,
      total: products.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar produtos'
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

// ==================== ROTAS DE PEDIDOS (PROTEGIDAS) ====================

// Criar pedido (autenticado)
app.post('/api/orders', authenticateToken, async (req, res) => {
  try {
    const { items, total, shippingAddress } = req.body;
    const userId = req.user.userId;

    // Validar dados
    if (!items || !total) {
      return res.status(400).json({
        success: false,
        error: 'Itens e total são obrigatórios'
      });
    }

    // Criar pedido
    const order = new Order({
      userId,
      items,
      total,
      shippingAddress: shippingAddress || {}
    });

    await order.save();

    // Popular dados do pedido
    await order.populate('userId', 'name email');

    res.status(201).json({
      success: true,
      message: 'Pedido criado com sucesso',
      data: order
    });

  } catch (error) {
    console.error('❌ Erro ao criar pedido:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Meus pedidos (autenticado)
app.get('/api/orders/my-orders', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 })
      .populate('userId', 'name email');

    res.json({
      success: true,
      data: orders,
      total: orders.length
    });
  } catch (error) {
    console.error('❌ Erro ao buscar pedidos:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// ==================== INICIALIZAR BANCO ====================

async function initializeDatabase() {
  try {
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      console.log('📦 Inicializando banco com produtos...');
      
      const initialProducts = [
        {
          name: "Smartphone Galaxy S24",
          price: 2999.99,
          category: "Electronics",
          description: "Latest smartphone with advanced AI features",
          image: "https://via.placeholder.com/300x300?text=Galaxy+S24",
          inStock: true,
          rating: 4.5,
          stock: 15
        },
        {
          name: "Wireless Bluetooth Headphones",
          price: 349.99,
          category: "Audio",
          description: "Noise-cancelling headphones with 30h battery",
          image: "https://via.placeholder.com/300x300?text=Headphones",
          inStock: true,
          rating: 4.3,
          stock: 8
        }
        // ... outros produtos (mantenha os que você já tem)
      ];

      await Product.insertMany(initialProducts);
      console.log('✅ Produtos inseridos no banco!');
    }
  } catch (error) {
    console.error('❌ Erro ao inicializar banco:', error);
  }
}

// ==================== INICIAR SERVIDOR ====================

app.listen(PORT, async () => {
  console.log(`🎯 Servidor rodando na porta ${PORT}`);
  console.log(`🔐 Sistema de autenticação JWT ativo`);
  console.log(`🌐 MongoDB: ${mongoose.connection.readyState === 1 ? 'Conectado' : 'Conectando...'}`);
  
  await initializeDatabase();
});