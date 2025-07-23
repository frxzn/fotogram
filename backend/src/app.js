const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors'); // CORS'u ekle

dotenv.config({ path: './.env' });

const app = express();

// Veritabanı bağlantısı
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB başarıyla bağlandı!');
    } catch (err) {
        console.error('MongoDB bağlantı hatası:', err.message);
        process.exit(1);
    }
};

connectDB();

// Middleware'ler
app.use(express.json()); // Body parser
app.use(express.urlencoded({ extended: true })); // URL encoded verileri parse et

// --- CORS Ayarları ---
// Geçici olarak, tüm kaynaklardan gelen isteklere izin veriyoruz.
// Bu, sorunun CORS detaylarından mı, yoksa başka bir yerden mi kaynaklandığını anlamak için.
// Üretimde bu şekilde KULLANILMAMALIDIR! Güvenlik zafiyeti yaratır.
app.use(cors());

// Eski detaylı CORS ayarları yorum satırı yapıldı:
/*
const allowedOrigins = [
    'http://localhost:5000',
    'http://localhost:3000',
    'https://fotogram-app.onrender.com'
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
*/

// --- API Rotaları ---
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/photos', require('./routes/photoRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// --- Frontend Dosyalarını Servis Etme ---
// Eğer backend, frontend dosyalarını da servis ediyorsa bu kısım aktif kalmalı.
// Render'da tek bir Web Service olarak hem backend hem de frontend'i sunuyorsan geçerli.
if (process.env.NODE_ENV === 'production' || process.env.SERVE_FRONTEND) {
    app.use(express.static(path.join(__dirname, '../../frontend/public')));

    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../../frontend/public', 'index.html'));
    });
}


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Sunucu ${PORT} portunda çalışıyor.`));
