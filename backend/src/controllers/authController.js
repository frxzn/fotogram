// backend/src/controllers/authController.js

const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

const registerUser = async (req, res) => {
    const { username, email, password, confirmPassword } = req.body;

    if (!username || !email || !password || !confirmPassword) {
        return res.status(400).json({ message: 'Lütfen tüm alanları doldurun.' });
    }
    if (password !== confirmPassword) {
        return res.status(400).json({ message: 'Şifreler uyuşmuyor.' });
    }
    if (password.length < 6) {
        return res.status(400).json({ message: 'Şifre en az 6 karakter olmalı.' });
    }

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'Bu e-posta adresi zaten kayıtlı.' });
        }
        const usernameExists = await User.findOne({ username });
        if (usernameExists) {
            return res.status(400).json({ message: 'Bu kullanıcı adı zaten alınmış.' });
        }

        const user = await User.create({ username, email, password }); // plaintext password gönder, User.js hashleyecek

        if (user) {
            const token = generateToken(user._id);
            return res.status(201).json({
                _id: user._id,
                username: user.username,
                email: user.email,
                token: token,
                message: 'Kayıt başarılı! Giriş yapılıyor...',
            });
        } else {
            return res.status(400).json({ message: 'Geçersiz kullanıcı verisi.' });
        }
    } catch (error) {
        console.error('Kayıt Hatası:', error);
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ message: errors.join(', ') });
        }
        return res.status(500).json({ message: 'Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.' });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email }).select('+password'); // <-- BU SATIR KESİNLİKLE BÖYLE OLMALI

        if (!user) {
            return res.status(401).json({ message: 'Geçersiz e-posta veya şifre.' });
        }

        if (await user.matchPassword(password)) {
            const token = generateToken(user._id);
            return res.json({
                _id: user._id,
                username: user.username,
                email: user.email,
                token: token,
                message: 'Giriş Başarılı!'
            });
        } else {
            return res.status(401).json({ message: 'Geçersiz e-posta veya şifre.' });
        }
    } catch (error) {
        console.error('Login Hatası:', error);
        return res.status(500).json({ message: 'Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.' });
    }
};

module.exports = { registerUser, loginUser };
