// Örnek server.js veya app.js dosyası
const express = require('express');
const app = express();
const cors = require('cors'); // Burası

// ... diğer importlar (mongoose, dotenv vb.)

// Middleware'ler (öncelik sırası önemli!)
app.use(express.json()); // JSON body parser
app.use(express.urlencoded({ extended: true })); // URL-encoded body parser

// KESİN KONTROL: CORS middleware'i buraya gelmeli
app.use(cors({
  origin: '*' // TÜM KAYNAKLARDAN GELEN İSTEKLERE İZİN VER
}));

// Rota tanımlamaları
// Örnek: app.use('/api/auth', require('./routes/authRoutes'));

// ... diğer kodlar ve app.listen()
