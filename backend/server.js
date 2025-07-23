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
const cors = require('cors'); // cors paketini kurduğundan emin ol: npm install cors
app.use(cors({
  origin: '*' // Şimdilik tüm origin'lere izin veriyoruz
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
