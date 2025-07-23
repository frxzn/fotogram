const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors'); // Frontend ile iletişimi sağlamak için
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const photoRoutes = require('./routes/photoRoutes');
const path = require('path'); // Statik dosyalar için

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // CORS'u etkinleştir
app.use(express.json()); // Body parser

// Veritabanı Bağlantısı
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB bağlantısı başarılı.'))
    .catch(err => console.error('MongoDB bağlantı hatası:', err));

// Statik Frontend Dosyalarını Servis Etme (Render.com'da ayrı proje olacak ama geliştirme için burada tutulabilir)
// Üretimde, frontend ve backend ayrı sunucularda çalıştığında bu kısım kaldırılabilir veya sadece geliştirme ortamında kullanılabilir.
app.use(express.static(path.join(__dirname, '../../frontend/public')));
app.use('/src/js', express.static(path.join(__dirname, '../../frontend/src/js')));


// API Rotaları
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/photos', photoRoutes);

// Herhangi bir route eşleşmezse frontend'in ana sayfasını gönder (SPA için)
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../frontend/public', 'index.html'));
});

// Sunucuyu Başlatma
app.listen(PORT, () => {
    console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor.`);
});
