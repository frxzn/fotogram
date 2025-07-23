// backend/src/config/db.js

const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true, // Artık Mongoose 6+ ile varsayılan, ama belirtmek zarar vermez
            useUnifiedTopology: true, // Artık Mongoose 6+ ile varsayılan
        });
        console.log(`MongoDB Bağlantısı Başarılı: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB Bağlantı Hatası: ${error.message}`);
        process.exit(1); // Uygulamayı hata ile kapat
    }
};

module.exports = connectDB;
