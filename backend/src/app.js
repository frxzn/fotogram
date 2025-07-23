// backend/src/app.js
const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors'); // CORS'u ekle

dotenv.config({ path: './.env' });

const app = express();

// ... (Veritabanı bağlantısı ve diğer middleware'ler burada kalacak) ...

// CORS Ayarları
const allowedOrigins = [
    'http://localhost:5000', // Yerel backend testleri için
    'http://localhost:3000', // Yerel frontend testleri için
    'https://fotogram-app.onrender.com' // <-- BURAYA SENİN FRONTTEND ADRESİNİ YAZDIK!
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

// ... (API Rotaları ve statik dosya servis etme kısmı burada kalacak) ...

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Sunucu ${PORT} portunda çalışıyor.`));
