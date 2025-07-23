// backend/src/controllers/authController.js

const User = require('../models/User'); // Kullanıcı modelin
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler'); // Varsa kullanıyorsan
const sendEmail = require('../utils/sendEmail'); // E-posta gönderme utilin

// Yeni bir kullanıcı kaydet
const register = asyncHandler(async (req, res) => {
    console.log('Backend Controller Log: register fonksiyonu başladı.'); // Yeni log
    const { email } = req.body;

    // Alan boş mu kontrol et (Gerekirse diğer alanları da ekle)
    if (!email) {
        console.error('Backend Controller Log: E-posta boş.'); // Yeni log
        res.status(400).json({ message: 'Lütfen bir e-posta adresi girin.' });
        return;
    }

    // Kullanıcı zaten var mı kontrol et
    const userExists = await User.findOne({ email });
    if (userExists) {
        console.error('Backend Controller Log: E-posta zaten kayıtlı.'); // Yeni log
        res.status(400).json({ message: 'Bu e-posta adresi zaten kayıtlı.' });
        return;
    }

    // Kayıt tokenı oluştur (Örnek)
    const registerToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('Backend Controller Log: Kayıt tokenı oluşturuldu.'); // Yeni log

    // Kayıt onay e-postası gönder
    const registerUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/?registerToken=${registerToken}`; // Frontend URL'in
    const message = `Hesabınızı tamamlamak için lütfen bu bağlantıya tıklayın: ${registerUrl}`;

    try {
        await sendEmail({
            email,
            subject: 'Fotogram - Kayıt Onayı',
            message
        });
        console.log('Backend Controller Log: Kayıt e-postası başarıyla gönderildi.'); // Yeni log
        res.status(200).json({
            message: 'Hesabınızı tamamlamak için e-posta adresinize bir bağlantı gönderildi.'
        });
    } catch (error) {
        console.error('Backend Controller Log: E-posta gönderirken hata oluştu:', error); // Yeni log
        res.status(500).json({ message: 'E-posta gönderilirken bir hata oluştu.' });
    }
});

// Kullanıcı girişi
const login = asyncHandler(async (req, res) => {
    console.log('Backend Controller Log: login fonksiyonu başladı.'); // Yeni log
    const { email, password } = req.body;

    if (!email || !password) {
        console.error('Backend Controller Log: E-posta veya şifre boş.'); // Yeni log
        res.status(400).json({ message: 'Lütfen tüm alanları doldurun.' });
        return;
    }

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
        console.log('Backend Controller Log: Kullanıcı giriş başarılı.'); // Yeni log
        res.json({
            message: 'Giriş başarılı.',
            token: generateToken(user._id)
        });
    } else {
        console.error('Backend Controller Log: Geçersiz kimlik bilgileri.'); // Yeni log
        res.status(401).json({ message: 'Geçersiz kimlik bilgileri.' });
    }
});

// JWT Token oluşturma (Yardımcı Fonksiyon)
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_LIFETIME || '1d',
    });
};

module.exports = {
    register,
    login,
    // ... diğer fonksiyonlar (getMe, forgotPassword, resetPassword, vs.)
};
