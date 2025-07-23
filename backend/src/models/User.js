const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        match: /^[a-zA-Z0-9_]+$/ // Kullanıcı adı sadece harf, rakam ve alt çizgi içerebilir
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: /^\S+@\S+\.\S+$/
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    isVerified: { // E-posta doğrulaması
        type: Boolean,
        default: false
    },
    verificationToken: String, // E-posta doğrulama için tek kullanımlık token
    verificationTokenExpires: Date,
    passwordResetToken: String, // Şifre sıfırlama için tek kullanımlık token
    passwordResetExpires: Date,
    isAdmin: {
        type: Boolean,
        default: false
    },
    profilePicture: {
        type: String,
        default: '/assets/images/default-profile.png' // Varsayılan profil fotoğrafı
    },
    bio: {
        type: String,
        maxlength: 200,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', userSchema);
