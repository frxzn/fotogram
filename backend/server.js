// backend/server.js - GÜNCEL VE SON VERSİYON

const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db'); // Veritabanı bağlantı dosyan
const authRoutes = require('./routes/authRoutes'); // Auth rotaların
const cors = require('cors'); // CORS modülünü require et

// Ortam değişkenlerini yükle
dotenv.config();

// Veritabanı bağlantısı
connectDB();

// Express uygulamasını başlat (SADECE BİR KEZ!)
const app = express();

// Middleware'ler
app.use(express.json()); // JSON body parser (önemli!)
app.use(express.urlencoded({ extended: true })); // URL-encoded form data parser

// CORS Ayarları - ÇOK KRİTİK!
// Frontend URL'ini buraya yazmalısın. 
// Senin frontend Render üzerinde çalıştığı için 'https://fotogram-frontend.onrender.com' olmalı.
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000', // Ortam değişkeninden al veya varsayılanı kullan
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // İzin verilen HTTP metotları
  allowedHeaders: ['Content-Type', 'Authorization'], // İzin verilen başlıklar
}));

// Rotalar
app.use('/api/auth', authRoutes); // Kimlik doğrulama rotaları

// Temel bir route (backend'in çalışıp çalışmadığını kontrol etmek için)
app.get('/', (req, res) => {
  res.send('Fotogram Backend API is running!');
});

// Port ayarlaması
// Render, kendi PORT ortam değişkenini atar. Eğer atanmamışsa 5000 kullan.
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
