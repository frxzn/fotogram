// backend/src/app.js

const express = require('express');
const dotenv = require('dotenv');
const path = require('path'); // <<< Bu satırı buraya ekle!
const mongoose = require('mongoose'); // Mongoose'u require et!
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes'); // Post rotalarını da ekleyelim
const cors = require('cors');

// Ortam değişkenlerini yükle
dotenv.config();

// ----- Veritabanı Bağlantısını Buraya Taşıyoruz -----
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            connectTimeoutMS: 30000,
            socketTimeoutMS: 45000,
        });
        console.log(`✅ MongoDB Bağlantısı BAŞARILI: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ MongoDB Bağlantı HATASI: Bağlanılamadı! Detay: ${error.message}`);
        console.error(`❌ Lütfen MONGO_URI'nizi ve MongoDB Atlas ağ erişim izinlerinizi kontrol edin.`);
        process.exit(1);
    }
};
connectDB(); // Fonksiyonu çağır

// Express uygulamasını başlat
const app = express();

// Middleware'ler
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS Ayarları
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rotalar
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes); // Post rotalarını da buraya ekle

// Temel bir route
app.get('/', (req, res) => {
  res.send('Fotogram Backend API is running!');
});

// Port ayarlaması
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
