// backend/src/models/User.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // npm install bcryptjs

// Kullanıcı şeması tanımı
const userSchema = mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, 'Kullanıcı adı gerekli'],
            unique: true,
            trim: true,
            minlength: [3, 'Kullanıcı adı en az 3 karakter olmalı'],
            maxlength: [30, 'Kullanıcı adı en fazla 30 karakter olmalı'],
        },
        email: {
            type: String,
            required: [true, 'E-posta gerekli'],
            unique: true,
            lowercase: true,
            match: [/.+@.+\..+/, 'Geçerli bir e-posta adresi girin'],
        },
        password: {
            type: String,
            required: [true, 'Şifre gerekli'],
            minlength: [6, 'Şifre en az 6 karakter olmalı'],
            // select: false, // <-- BU SATIR YORUM SATIRI OLMALI VEYA SİLİNMELİ.
                              // AuthController'da .select('+password') ile çekeceğiz.
        },
        profilePicture: {
            type: String,
            default: 'https://res.cloudinary.com/your_cloud_name/image/upload/v1/default_avatar.png', // Varsayılan avatar
        },
    },
    {
        timestamps: true, // createdAt ve updatedAt alanlarını otomatik ekler
    }
);

// Middleware: Şifreyi veritabanına kaydetmeden önce hashleme (PRE-SAVE HOOK)
userSchema.pre('save', async function (next) {
    // Şifre alanı değiştirilmediyse (yani yeni kullanıcı değilse veya şifre güncellenmiyorsa)
    if (!this.isModified('password')) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(10); // Hashleme gücü
        this.password = await bcrypt.hash(this.password, salt);
        next(); // Kaydetme işlemine devam et
    } catch (error) {
        next(error); // Hata durumunda sonraki middleware'e gönder
    }
});

// Instance Method: Kullanıcının girdiği şifreyi veritabanındaki hashlenmiş şifre ile karşılaştırma
userSchema.methods.matchPassword = async function (enteredPassword) {
    // Hata ayıklama için konsol logları (işlem bitince kaldırabilirsin)
    // console.log("matchPassword metodunda this.password (hashlenmiş):", this.password);
    // console.log("matchPassword metodunda enteredPassword (plaintext):", enteredPassword);

    if (!this.password) {
        console.error("matchPassword: Kullanıcının veritabanı şifresi (this.password) bulunamadı veya tanımsız.");
        return false; // Şifre karşılaştırması başarısız sayılır
    }

    // bcrypt.compare: Girdi şifresini hashler ve veritabanındaki hash ile eşleşip eşleşmediğini kontrol eder.
    return await bcrypt.compare(enteredPassword, this.password);
};

// Modeli oluştur ve dışa aktar
const User = mongoose.model('User', userSchema);

module.exports = User;
