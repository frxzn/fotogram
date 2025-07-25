// backend/src/config/db.js

const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            // Bağlantı zaman aşımını da biraz arttıralım, garanti olsun
            connectTimeoutMS: 30000, // 30 saniye
            socketTimeoutMS: 45000, // 45 saniye
        });
        console.log(`✅ MongoDB Bağlantısı BAŞARILI: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ MongoDB Bağlantı HATASI: Bağlanılamadı! Detay: ${error.message}`);
        console.error(`❌ Lütfen MONGO_URI'nizi ve MongoDB Atlas ağ erişim izinlerinizi kontrol edin.`);
        process.exit(1); // Uygulamadan çık, çünkü veritabanı olmadan çalışamaz
    }
};

module.exports = connectDB;
