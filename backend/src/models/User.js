// backend/src/models/User.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Şifre hashleme ve karşılaştırma için
const crypto = require('crypto'); // Token oluşturma için

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Lütfen bir kullanıcı adı girin.'],
        unique: true,
        trim: true,
        minlength: [3, 'Kullanıcı adı en az 3 karakter olmalıdır.'],
    },
    email: {
        type: String,
        required: [true, 'Lütfen bir e-posta adresi girin.'],
        unique: true,
        lowercase: true,
        validate: {
            validator: function(v) {
                return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
            },
            message: props => `${props.value} geçerli bir e-posta adresi değil!`
        }
    },
    password: {
        type: String,
        required: [true, 'Lütfen bir şifre girin.'],
        minlength: [6, 'Şifre en az 6 karakter olmalıdır.'],
        select: false, // Varsayılan olarak sorgularda şifreyi döndürme
    },
    // passwordConfirm: { // Confirm alanı sadece frontend veya controller'da kullanılır, DB'ye kaydedilmez
    //     type: String,
    //     required: [true, 'Lütfen şifrenizi onaylayın.'],
    //     validate: {
    //         // Sadece CREATE ve SAVE üzerinde çalışır!
    //         validator: function(el) {
    //             return el === this.password;
    //         },
    //         message: 'Şifreler eşleşmiyor!'
    //     }
    // },
    photo: {
        type: String,
        default: 'default.jpg',
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    isVerified: {
        type: Boolean,
        default: false,
        select: false, // Varsayılan olarak sorgularda döndürme
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Şifre hashleme (Doküman kaydedilmeden önce çalışır)
userSchema.pre('save', async function(next) {
    // Sadece şifre değiştirildiğinde veya yeni oluşturulduğunda hash'le
    if (!this.isModified('password')) return next();

    // Şifreyi hash'le
    this.password = await bcrypt.hash(this.password, 12);
    
    // passwordConfirm alanını veritabanına kaydetmemek için sil
    // Eğer şemada tanımlıysa silmeye gerek yok, çünkü passwordConfirm'i schema'ya dahil etmedik
    next();
});

// passwordChangedAt alanını şifre güncellendiğinde ayarla (passwordResetExpires'tan ayrı)
userSchema.pre('save', function(next) {
    if (!this.isModified('password') || this.isNew) return next();
    this.passwordChangedAt = Date.now() - 1000; // Token'ın şifre değişimi sonrasına denk gelmemesi için 1 saniye geri
    next();
});

// Kullanıcı tarafından girilen şifreyi veritabanındaki hashlenmiş şifreyle karşılaştırma metodu
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

// Şifre sıfırlama token'ı oluşturma metodu
userSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Token 10 dakika sonra geçerliliğini yitirecek
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

// E-posta doğrulama token'ı oluşturma metodu
userSchema.methods.createEmailVerificationToken = function() {
    const verificationToken = crypto.randomBytes(32).toString('hex');

    this.emailVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');

    // Doğrulama token'ı 24 saat sonra geçerliliğini yitirecek
    this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;

    return verificationToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
