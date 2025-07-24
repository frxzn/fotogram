// backend/src/models/User.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const crypto = require('crypto'); // Token oluşturmak için

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Lütfen bir kullanıcı adı girin.'],
        unique: true, // Kullanıcı adının benzersiz olmasını sağlar
        trim: true, // Başındaki ve sonundaki boşlukları kaldırır
        lowercase: true, // TÜM KULLANICI ADLARINI KÜÇÜK HARFE ÇEVİRİR
        minlength: [3, 'Kullanıcı adı en az 3 karakter olmalıdır.'],
        maxlength: [30, 'Kullanıcı adı en fazla 30 karakter olmalıdır.'],
        validate: {
            validator: function(v) {
                return /^[a-zA-Z0-9_.]+$/.test(v); // Sadece harf, rakam, alt çizgi ve nokta içerebilir
            },
            message: 'Kullanıcı adı sadece harf, rakam, alt çizgi (_) ve nokta (.) içerebilir.'
        }
    },
    email: {
        type: String,
        required: [true, 'Lütfen bir e-posta adresi girin.'],
        unique: true, // E-postanın benzersiz olmasını sağlar
        lowercase: true, // Tüm e-postaları küçük harfe çevirir
        validate: [validator.isEmail, 'Lütfen geçerli bir e-posta adresi girin.']
    },
    password: {
        type: String,
        required: [true, 'Lütfen bir şifre girin.'],
        minlength: [6, 'Şifre en az 6 karakter olmalıdır.'],
        select: false // Şifrenin sorgularda dönmesini engeller (güvenlik için)
    },
    passwordConfirm: { // Bu alan sadece validasyon için, DB'ye kaydedilmez
        type: String,
        // required: [true, 'Lütfen şifrenizi tekrar girin.'], // Bu kısım frontend'de hallediliyor
        validate: {
            // Bu sadece CREATE ve SAVE üzerinde çalışır!
            validator: function(el) {
                return el === this.password;
            },
            message: 'Şifreler eşleşmiyor!'
        },
        select: false
    },
    isVerified: {
        type: Boolean,
        default: false // E-posta doğrulanana kadar false olacak
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    passwordChangedAt: Date,
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    photo: {
        type: String,
        default: 'default.jpg' // Varsayılan profil fotoğrafı
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Şifreyi kaydetmeden önce hash'le
userSchema.pre('save', async function(next) {
    // Şifre değiştirilmediyse veya yeni oluşturulmuyorsa bir şey yapma
    if (!this.isModified('password')) return next();

    // Şifreyi hash'le (12 tuzlama turu ile)
    this.password = await bcrypt.hash(this.password, 12);

    // passwordConfirm alanını DB'ye kaydetme
    this.passwordConfirm = undefined; 
    next();
});

// Şifre sıfırlama token'ı oluşturma metodu
userSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 dakika

    return resetToken;
};

// E-posta doğrulama token'ı oluşturma metodu
userSchema.methods.createEmailVerificationToken = function() {
    const verificationToken = crypto.randomBytes(32).toString('hex');

    this.emailVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
    this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 saat

    return verificationToken;
};

// Şifre karşılaştırma metodu
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
