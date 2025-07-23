const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors'); // <-- CORS'u ekle

dotenv.config({ path: './.env' }); // .env dosyasını oku

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

// CORS Ayarları
// SADECE GELİŞTİRME ORTAMINDA HER YERDEN ERİŞİM İÇİN (GEÇİCİ VE GÜVENSİZ)
// app.use(cors());

// Üretim ortamı için daha güvenli CORS ayarları
// Buraya frontend projenin Render.com URL'sini yazmalısın
const allowedOrigins = [
    'http://localhost:5000', // Yerel geliştirme için (eğer frontend farklı portta çalışıyorsa)
    'http://localhost:3000', // Yerel geliştirme için (eğer frontend farklı portta çalışıyorsa)
    'https://fotogram-frontend.onrender.com' // <-- KESİNLİKLE KENDİ FRONTEND RENDER URL'İNİ YAZ!
];

app.use(cors({
    origin: function (origin, callback) {
        // İsteğin geldiği origin allowedOrigins içinde mi kontrol et
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true // Çerezleri (cookies) ve yetkilendirme başlıklarını göndermeye izin ver
}));


// API Rotaları
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/photos', require('./routes/photoRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Frontend dosyalarını servis etme (Eğer backend aynı zamanda frontend'i servis ediyorsa)
// Bu kısım seni backend linkine tıkladığında index.html'e atan kısım.
// Eğer frontend ve backend ayrı servislerde ise, bu kısmı Render'da frontend servisine taşımalısın.
if (process.env.NODE_ENV === 'production' || process.env.SERVE_FRONTEND) { // SERVE_FRONTEND ortam değişkeni ile kontrol et
    app.use(express.static(path.join(__dirname, '../../frontend/public')));

    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../../frontend/public', 'index.html'));
    });
}


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Sunucu ${PORT} portunda çalışıyor.`));
