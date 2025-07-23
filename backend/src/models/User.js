// backend/src/models/User.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
            // select: false, // <-- BU SATIR BURADA OLMAMALI VEYA YORUM SATIRI OLMALI
        },
        // ... diğer alanlar
    },
    {
        timestamps: true,
    }
);

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    // console.log("matchPassword metodunda this.password:", this.password); // Hata ayıklama için geçici log
    if (!this.password) { // Şifrenin varlığını kontrol et
        console.error("matchPassword: Hashlenmiş şifre bulunamadı.");
        return false;
    }
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
