const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors'); // CORS'u ekle

// .env dosyasındaki ortam değişkenlerini yükle
dotenv.config({ path: './.env' });

const app = express();

// MongoDB Veritabanı Bağlantısı
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            // Yeni Mongoose versiyonlarında bu seçenekler varsayılan olarak true'dur
            // ancak uyumluluk için bırakılabilir.
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB başarıyla bağlandı!');
    } catch (err) {
        // Bağlantı hatasında hatayı logla ve uygulamadan çık
        console.error('MongoDB bağlantı hatası:', err.message);
        process.exit(1); // Uygulamadan çıkmak, veritabanı bağlantısı olmadan çalışmamasını sağlar
    }
};

connectDB(); // Uygulama başladığında veritabanına bağlan

// Middleware'ler
// Gelen JSON istek gövdelerini ayrıştırmak için
app.use(express.json());
// URL-encoded istek gövdelerini ayrıştırmak için
app.use(express.urlencoded({ extended: true }));

// CORS Ayarları
// TÜM kaynaklardan gelen isteklere izin ver.
// Bu ayar sadece geliştirme ve hata ayıklama için kullanılmalı.
// Üretim ortamında daha spesifik `origin` ayarları önerilir.
app.use(cors());

// API Rotaları
// Rotları ilgili dosyalardan içe aktar ve Express uygulamasına ekle
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/photos', require('./routes/photoRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Frontend Dosyalarını Servis Etme (Eğer backend, frontend'i de sunuyorsa)
// Bu kısım, Render'da tek bir Web Service olarak hem backend hem de frontend'i sunuyorsan gereklidir.
// Örneğin, fotogram-backend.onrender.com adresine gidildiğinde index.html'in açılmasını sağlar.
// `process.env.SERVE_FRONTEND` kontrolü, bu özelliği bir ortam değişkeniyle açıp kapatmaya yarar.
if (process.env.NODE_ENV === 'production' || process.env.SERVE_FRONTEND) {
    // Statik dosyaların (HTML, CSS, JS, resimler) servis edileceği dizini belirt
    // `../../frontend/public` yolu, `backend/src/app.js`'ten `frontend/public`'e ulaşır.
    app.use(express.static(path.join(__dirname, '../../frontend/public')));

    // API rotalarına gitmeyen tüm diğer istekleri (örn: '/') index.html'e yönlendir
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../../frontend/public', 'index.html'));
    });
}


// Sunucuyu belirtilen PORT üzerinde dinlemeye başla
// Ortam değişkenlerinde PORT tanımlı değilse 5000'i kullan
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Sunucu ${PORT} portunda çalışıyor.`));
