// backend/server.js
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db'); // Veritabanı bağlantısı
const authRoutes = require('./src/routes/authRoutes'); // Auth rotaları
const cors = require('cors'); // CORS middleware
const path = require('path'); // Path modülü

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

// Frontend dosyalarını sunma (sadece üretimde kullanılacak)
// Render.com'da frontend ayrı bir servis olduğu için bu kısım burada teknik olarak gereksiz olabilir
// Ama eğer backend aynı zamanda frontend'i de sunuyorsa kullanışlıdır.
// Şu an için Render'da ayrı servisler olduğu varsayımıyla bu kısım pasif kalabilir veya çıkarılabilir.
// Eğer çıkarmayacaksan, path'lerin doğru olduğundan emin olmalısın.
/*
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../frontend/public')));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../frontend', 'public', 'index.html'));
    });
}
*/

// Ana sayfa veya test rotası (isteğe bağlı)
app.get('/', (req, res) => {
    res.send('Fotogram Backend API is running...');
});

// Port belirle
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda çalışıyor.`);
});
