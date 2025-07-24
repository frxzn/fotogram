// backend/src/models/User.js

const mongoose = require('mongoose');
const validator = require('validator'); // npm install validator
const bcrypt = require('bcryptjs');     // npm install bcryptjs
const crypto = require('crypto');       // Node.js'in dahili modülü

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Kullanıcı adı gerekli'],
        unique: true,
        trim: true,
        maxlength: [30, 'Kullanıcı adı 30 karakterden fazla olamaz.']
    },
    email: {
        type: String,
        required: [true, 'E-posta adresi gerekli'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Geçerli bir e-posta adresi girin.']
    },
    password: {
        type: String,
        required: [true, 'Şifre gerekli'],
        minlength: [6, 'Şifre en az 6 karakter olmalıdır.'],
        select: false // Şifrenin sorgularda dönmesini engelle
    },
    // passwordConfirm: Bu alanı direkt modelde tutmak yerine, controller'da validasyon için kullanmak daha güvenlidir.
    // Eğer illa ki tutmak istersen, select: false ekle ve pre('save') hook'unda sil.
    photo: String, // Profil fotoğrafı için
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    emailVerificationToken: String, // E-posta doğrulama token'ı
    emailVerificationExpires: Date, // E-posta doğrulama token'ının süresi
    isVerified: { // E-posta doğrulanmış mı?
        type: Boolean,
        default: false // Varsayılan olarak doğrulanmamış
    },
    active: { // Kullanıcı hesabı aktif mi (silinmemiş mi)?
        type: Boolean,
        default: true,
        select: false
    }
}, { timestamps: true }); // createdAt ve updatedAt otomatik eklenecek

// Şifreyi kaydetmeden önce hashleme
userSchema.pre('save', async function(next) {
    // Şifre değiştirilmediyse bir sonraki adıma geç
    if (!this.isModified('password')) return next();

    // Şifreyi hashle (12 salt faktörü ile)
    this.password = await bcrypt.hash(this.password, 12);

    // passwordConfirm alanını veritabanına kaydetmeden sil (çünkü sadece validasyon için kullanılır)
    // this.passwordConfirm = undefined; // Eğer modelde bu alanı tutmuyorsan bu satıra gerek yok.
    next();
});

// Şifre değiştirildiğinde passwordChangedAt alanını güncelle
userSchema.pre('save', function(next) {
    if (!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 1000; // Token verilmeden önce şifre değiştirildi olarak işaretle
    next();
});

// Kullanıcının girdiği şifreyi veritabanındaki hashlenmiş şifre ile karşılaştırma metodu
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

// Şifre sıfırlama token'ı oluşturma metodu
userSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex'); // Şifrelenmemiş token
    
    // Token'ı hashleyip veritabanına kaydet
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 dakika geçerlilik süresi

    return resetToken; // E-postaya gönderilecek şifrelenmemiş token'ı döndür
};

// E-posta doğrulama token'ı oluşturma metodu
userSchema.methods.createEmailVerificationToken = function() {
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Token'ı hashleyip veritabanına kaydet
    this.emailVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
    this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 saat geçerli

    return verificationToken; // E-postaya gönderilecek şifrelenmemiş token'ı döndür
};


const User = mongoose.model('User', userSchema);
module.exports = User;
