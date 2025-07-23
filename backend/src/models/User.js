// backend/src/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Şifreleri hashlemek için

const UserSchema = mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Lütfen bir e-posta adresi girin.'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Lütfen geçerli bir e-posta adresi girin.'
        ]
    },
    username: {
        type: String,
        unique: true,
        sparse: true, // username alanı boş olabilirken unique olmasını sağlar (ilk kayıt anı için)
        minlength: [3, 'Kullanıcı adı en az 3 karakter olmalıdır.'],
        maxlength: [20, 'Kullanıcı adı en fazla 20 karakter olmalıdır.']
    },
    password: {
        type: String,
        minlength: [6, 'Şifre en az 6 karakter olmalıdır.'],
        select: false // Şifre sorgularda varsayılan olarak dönmez
    },
    isVerified: {
        type: Boolean,
        default: false // E-posta doğrulanana kadar false
    },
    registrationToken: String, // E-posta doğrulama için kullanılan geçici token
    resetPasswordToken: String, // Şifre sıfırlama için kullanılan token
    resetPasswordExpire: Date, // Şifre sıfırlama token'ının geçerlilik süresi
}, {
    timestamps: true // createdAt ve updatedAt alanlarını otomatik ekler
});

// Şifreyi kaydetmeden önce hashle
UserSchema.pre('save', async function(next) {
    // Şifre değiştirilmemişse veya yeni oluşturulmuyorsa bir şey yapma
    if (!this.isModified('password')) {
        next();
    }
    // Şifreyi hashle
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Girilen şifrenin hashlenmiş şifre ile eşleşip eşleşmediğini kontrol et
UserSchema.methods.matchPassword = async function(enteredPassword) {
    // select: false olduğu için şifreyi bu yöntemle çekmeliyiz
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
