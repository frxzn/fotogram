// backend/src/app.js

// Ortam değişkenlerini en başta yükle
require('dotenv').config(); 
console.log('--- UYGULAMA BAŞLANGICI: Ortam değişkenleri yüklendi ---');

const express = require('express');
const mongoose = require('mongoose');
const path = require('path'); // Frontend statik dosya sunumu için gerekli olabilir, şimdilik dursun
const cors = require('cors'); // CORS middleware'i

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
        process.exit(1); // Uygulamadan çık
    }
};

connectDB(); // Veritabanı bağlantısını başlat
console.log('--- UYGULAMA BAŞLANGICI: connectDB fonksiyonu çağrıldı ---');


// Middleware'ler
app.use(express.json()); // JSON istek gövdelerini ayrıştırmak için
app.use(express.urlencoded({ extended: true })); // URL-encoded istek gövdelerini ayrıştırmak için
console.log('--- UYGULAMA BAŞLANGICI: Middlewareler (JSON, URL-encoded) eklendi ---');


// CORS Ayarları (HATA AYIKLAMA AMAÇLI - GEÇİCİ OLARAK TÜM ORIGINLERE AÇIK)
// Bu ayar, tüm originlerden gelen isteklere izin verir ve güvenlik riski taşır.
// Sadece sorunu tespit etmek için kullanın. Sorun çözüldüğünde eski spesifik haline döneceğiz.
app.use(cors()); 
console.log(`--- UYGULAMA BAŞLANGICI: CORS middleware eklendi (Tüm originlere açık - HATA AYIKLAMA) ---`);


// API Rotaları
// authRoutes, userRoutes, photoRoutes, adminRoutes dosyalarını dahil et
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/photos', require('./routes/photoRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
console.log('--- UYGULAMA BAŞLANGICI: API Rotaları yüklendi ---');

// --- DİKKAT: Frontend dosyalarını servis etme kısmı DEVRE DIŞI BIRAKILDI ---
// Çünkü frontend ayrı bir Render servisi olarak yayınlanıyor (örn: fotogram-app).
// Eğer frontend'i bu backend servisi üzerinden sunacaksanız, aşağıdaki kısmı aktif edin.
/*
if (process.env.NODE_ENV === 'production' || process.env.SERVE_FRONTEND) {
    // Frontend'in public klasörüne giden yolu ayarla
    app.use(express.static(path.join(__dirname, '../../frontend/public')));

    // Tüm diğer GET isteklerini index.html'e yönlendir (SPA için)
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../../frontend/public', 'index.html'));
    });
    console.log('--- UYGULAMA BAŞLANGICI: Frontend statik dosya sunumu aktif ---');
}
*/

// Sunucuyu Render'ın atadığı port üzerinde dinlemeye başla
const PORT = process.env.PORT || 5000; // Varsayılan olarak 5000 portunu kullan
app.listen(PORT, () => {
    console.log(`--- SUNUCU BAŞLATILIYOR: Sunucu ${PORT} portunda çalışıyor. ---`);
});

console.log('--- UYGULAMA BAŞLANGICI: App.listen çağrısı yapıldı ---');
