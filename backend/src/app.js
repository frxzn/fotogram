const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');

console.log('--- UYGULAMA BAŞLANGICI: Gerekli modüller yüklendi ---'); // Log 1

// .env dosyasındaki ortam değişkenlerini yükle
dotenv.config({ path: './.env' });
console.log('--- UYGULAMA BAŞLANGICI: Ortam değişkenleri yüklendi ---'); // Log 2

const app = express();
console.log('--- UYGULAMA BAŞLANGICI: Express uygulaması oluşturuldu ---'); // Log 3


// MongoDB Veritabanı Bağlantısı
const connectDB = async () => {
    console.log('--- VERİTABANI: Bağlantı denemesi başlıyor ---'); // Log 4
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('--- VERİTABANI: MongoDB başarıyla bağlandı! ---'); // Log 5 (Başarılı)
    } catch (err) {
        console.error('--- VERİTABANI HATASI: MongoDB bağlantı hatası: ---', err.message); // Log 6 (Hata)
        // Eğer MONGO_URI boş veya hatalıysa buraya düşeriz
        if (!process.env.MONGO_URI) {
            console.error('--- VERİTABANI HATASI: MONGO_URI ortam değişkeni tanımlı değil veya boş! ---'); // Log 7
        }
        process.exit(1);
    }
};

connectDB(); // Uygulama başladığında veritabanına bağlan
console.log('--- UYGULAMA BAŞLANGICI: connectDB fonksiyonu çağrıldı ---'); // Log 8


// Middleware'ler
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
console.log('--- UYGULAMA BAŞLANGICI: Middlewareler (JSON, URL-encoded) eklendi ---'); // Log 9


// CORS Ayarları
// Geçici olarak, tüm kaynaklardan gelen isteklere izin veriyoruz.
app.use(cors());
console.log('--- UYGULAMA BAŞLANGICI: CORS middleware eklendi (Tüm originlere açık) ---'); // Log 10


// API Rotaları
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/photos', require('./routes/photoRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
console.log('--- UYGULAMA BAŞLANGICI: API Rotaları yüklendi ---'); // Log 11

// Frontend Dosyalarını Servis Etme (Eğer backend, frontend'i de sunuyorsa)
// Bu kısım, Render'da tek bir Web Service olarak hem backend hem de frontend'i sunuyorsan gereklidir.
if (process.env.NODE_ENV === 'production' || process.env.SERVE_FRONTEND) {
    app.use(express.static(path.join(__dirname, '../../frontend/public')));
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../../frontend/public', 'index.html'));
    });
    console.log('--- UYGULAMA BAŞLANGICI: Frontend statik dosya sunumu aktif ---'); // Log 12
}


// Sunucuyu belirtilen PORT üzerinde dinlemeye başla
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`--- SUNUCU BAŞLATILIYOR: Sunucu ${PORT} portunda çalışıyor. ---`); // Log 13 (En önemli loglardan)
});

console.log('--- UYGULAMA BAŞLANGICI: App.listen çağrısı yapıldı ---'); // Log 14
