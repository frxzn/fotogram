// backend/server.js (veya app.js/index.js)

const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db'); // Veritabanı bağlantı dosyan
const authRoutes = require('./routes/authRoutes'); // Auth rotaların

// Ortam değişkenlerini yükle
dotenv.config();

// Veritabanı bağlantısı
connectDB();

const app = express();

// Middleware'ler
app.use(express.json()); // JSON body parser
app.use(express.urlencoded({ extended: true })); // URL-encoded form data parser

// CORS Ayarları - ÇOK KRİTİK!
// Geçici olarak tüm origin'lere izin veriyoruz.
// Frontend URL'in 'https://fotogram-app.onrender.com' olduğunda, daha sonra bu satırı değiştirebilirsin:
// app.use(cors({ origin: 'https://fotogram-app.onrender.com' }));
// ... (diğer require'lar ve başlangıç kodları)

const app = express();

// Middleware'ler
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// CORS Ayarları - ÇOK KRİTİK!
const cors = require('cors'); 

// Frontend URL'ini buraya yazmalısın. 
// Senin frontend Render üzerinde çalıştığı için 'https://fotogram-frontend.onrender.com' olmalı.
app.use(cors({
  origin: 'https://fotogram-frontend.onrender.com', // Kendi frontend URL'ini buraya yapıştır!
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // İzin verilen HTTP metotları
  allowedHeaders: ['Content-Type', 'Authorization'], // İzin verilen başlıklar
}));

// ... (diğer rotalar ve sunucu başlatma kodu)


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
