// backend/src/app.js

// Ortam değişkenlerini en başta yükle
require('dotenv').config(); 
console.log('--- UYGULAMA BAŞLANGICI: Ortam değişkenleri yüklendi ---');

const express = require('express');
const mongoose = require('mongoose');
const path = require('path'); 
const cors = require('cors'); 

console.log('--- UYGULAMA BAŞLANGICI: Gerekli modüller yüklendi ---');

const app = express();
console.log('--- UYGULAMA BAŞLANGICI: Express uygulaması oluşturuldu ---');


// MongoDB Veritabanı Bağlantısı
const connectDB = async () => {
    console.log('--- VERİTABANI: Bağlantı denemesi başlıyor ---');
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('--- VERİTABANI: MongoDB başarıyla bağlandı! ---');
    } catch (err) {
        console.error('--- VERİTABANI HATASI: MongoDB bağlantı hatası: ---', err.message);
        if (!process.env.MONGO_URI) {
            console.error('--- VERİTABANI HATASI: MONGO_URI ortam değişkeni tanımlı değil veya boş! ---');
        }
        process.exit(1); 
    }
};

connectDB(); 
console.log('--- UYGULAMA BAŞLANGICI: connectDB fonksiyonu çağrıldı ---');


// Middleware'ler
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
console.log('--- UYGULAMA BAŞLANGICI: Middlewareler (JSON, URL-encoded) eklendi ---');

// --- YENİ EKLENEN KISIM: GENEL İSTEK LOGLAYICI ---
// Bu middleware, backend'e gelen her isteği loglar.
// CORS ayarlarından önce veya sonra olabilir, ancak genellikle en başta tanımlanır.
app.use((req, res, next) => {
    console.log(`--- İSTEK GELDİ --- Metot: ${req.method}, Yol: ${req.originalUrl}, IP: ${req.ip}`);
    next(); // Bir sonraki middleware'e geç
});
console.log('--- UYGULAMA BAŞLANGICI: Genel İstek Loglayıcı middleware eklendi ---');


// CORS Ayarları (HATA AYIKLAMA AMAÇLI - GEÇİCİ OLARAK TÜM ORIGINLERE AÇIK)
app.use(cors()); 
console.log(`--- UYGULAMA BAŞLANGICI: CORS middleware eklendi (Tüm originlere açık - HATA AYIKLAMA) ---`);


// API Rotaları
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/photos', require('./routes/photoRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
console.log('--- UYGULAMA BAŞLANGICI: API Rotaları yüklendi ---');

// Frontend dosyalarını servis etme kısmı DEVRE DIŞI BIRAKILDI
/*
if (process.env.NODE_ENV === 'production' || process.env.SERVE_FRONTEND) {
    app.use(express.static(path.join(__dirname, '../../frontend/public')));

    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../../frontend/public', 'index.html'));
    });
    console.log('--- UYGULAMA BAŞLANGICI: Frontend statik dosya sunumu aktif ---');
}
*/

// Sunucuyu Render'ın atadığı port üzerinde dinlemeye başla
const PORT = process.env.PORT || 5000; 
app.listen(PORT, () => {
    console.log(`--- SUNUCU BAŞLATILIYOR: Sunucu ${PORT} portunda çalışıyor. ---`);
});

console.log('--- UYGULAMA BAŞLANGICI: App.listen çağrısı yapıldı ---');
