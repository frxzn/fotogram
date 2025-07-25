// backend/src/app.js

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path'); // Path modülünü ekle
const authRouter = require('./routes/authRoutes'); // Auth rotalarını içe aktar
const postRouter = require('./routes/postRoutes'); // YENİ: Post rotalarını içe aktar

const app = express();

// CORS Ayarları (Geliştirme için geniş, production için daha kısıtlı olmalı)
app.use(cors({
    origin: process.env.FRONTEND_URL, // Frontend URL'niz
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// HTTP istek logları (Sadece geliştirme modunda)
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Body Parser: Gelen JSON verilerini okur
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Statik dosyaları sunmak için (Resimler, vb.)
// 'public' klasörü uygulamanın kök dizininde olmalı
app.use(express.static(path.join(__dirname, '../public')));

// Rotalar
app.use('/api/auth', authRouter);
app.use('/api/posts', postRouter); // YENİ: Post rotalarını kullan

// Tanımsız rotalar için 404 hatası
app.all('*', (req, res, next) => {
    res.status(404).json({
        status: 'fail',
        message: `Bu sunucuda ${req.originalUrl} yolu bulunamadı!`
    });
});

module.exports = app;

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda çalışıyor`);
});
