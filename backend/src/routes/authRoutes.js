// backend/server.js
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db'); // Veritabanı bağlantısı
const authRoutes = require('./src/routes/authRoutes'); // Auth rotaları
const cors = require('cors'); // CORS middleware
// const path = require('path'); // Path modülü - şimdilik kullanılmıyor

// .env dosyasındaki değişkenleri yükle
dotenv.config();

// Veritabanına bağlan
connectDB();

const app = express();

// CORS ayarları
app.use(cors({
    origin: process.env.CLIENT_URL, // Sadece frontend URL'ine izin ver
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parser middleware (JSON verilerini ayrıştırmak için)
app.use(express.json());

// API rotalarını kullan
app.use('/api/auth', authRoutes);

// Ana sayfa veya test rotası (isteğe bağlı)
app.get('/', (req, res) => {
    res.send('Fotogram Backend API is running...');
});

// Port belirle
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda çalışıyor.`);
});
