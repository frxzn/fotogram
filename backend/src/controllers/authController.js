// backend/src/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto'); // Built-in Node.js module for cryptography

// JWT Token Oluşturma Fonksiyonu
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '1h', // Token'ın süresi, örneğin 1 saat
    });
};

// @desc    Register user with email (Step 1)
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
    const { email } = req.body;

    // E-posta zaten kayıtlı mı kontrol et
    const userExists = await User.findOne({ email });

    if (userExists && userExists.isVerified) {
        return res.status(400).json({ message: 'Bu e-posta adresi zaten kayıtlı.' });
    }

    // Eğer doğrulanmamış bir kullanıcı varsa, mevcut kaydı kullan veya yeni oluştur
    let user;
    if (userExists && !userExists.isVerified) {
        user = userExists; // Mevcut doğrulanmamış kullanıcıyı kullan
        user.registrationToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' }); // Yeni token oluştur
        await user.save();
    } else {
        // Yeni kullanıcı oluştur
        user = await User.create({ email });
        // Kayıt doğrulama token'ı oluştur (sadece bu aşamada kullanılacak)
        user.registrationToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        await user.save();
    }

    if (user) {
        try {
            // Frontend'in kayıt tamamlama sayfasının URL'i
            // CLIENT_URL'in sonunda slash OLMAMALIDIR. (Örn: https://fotogram-app.onrender.com)
            const registerUrl = `${process.env.CLIENT_URL}/?registerToken=${user.registrationToken}`;

            await sendEmail({
                email: user.email,
                subject: 'Fotogram Kaydınızı Tamamlayın',
                message: registerUrl, // E-posta mesajına linki gönder
            });

            res.status(200).json({
                message: 'Kaydı tamamlamak için e-posta adresinize bir bağlantı gönderildi.',
                registerToken: user.registrationToken // Sadece geliştirme/test amaçlı, gerçek uygulamada gönderilmemeli
            });
        } catch (error) {
            console.error('E-posta gönderim hatası:', error);
            // E-posta gönderme başarısız olursa kullanıcıyı sil (isteğe bağlı, tutulabilir de)
            await user.deleteOne();
            res.status(500).json({ message: 'E-posta gönderilirken bir hata oluştu.' });
        }
    } else {
        res.status(400).json({ message: 'Geçersiz kullanıcı verisi.' });
    }
};

// @desc    Complete user registration (Step 2: Set username and password)
// @route   POST /api/auth/complete-register
// @access  Public (with token in Authorization header)
const completeRegister = async (req, res) => {
    const { username, password } = req.body;
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1]; // Bearer token

    if (!token) {
        return res.status(401).json({ message: 'Doğrulama token\'ı bulunamadı.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: 'Hesap zaten doğrulanmış.' });
        }

        // Token'ın bu kullanıcıya ait olup olmadığını ve güncel olup olmadığını kontrol et
        if (user.registrationToken !== token) {
            return res.status(400).json({ message: 'Geçersiz veya süresi dolmuş kayıt token\'ı. Lütfen tekrar kayıt olun.' });
        }

        // Kullanıcı adı zaten kullanımda mı kontrol et
        const usernameExists = await User.findOne({ username });
        if (usernameExists && usernameExists._id.toString() !== user._id.toString()) {
            return res.status(400).json({ message: 'Bu kullanıcı adı zaten alınmış.' });
        }

        user.username = username;
        user.password = password; // Mongoose pre-save hook hashleyecektir
        user.isVerified = true;
        user.registrationToken = undefined; // Token'ı temizle
        await user.save();

        res.status(200).json({
            message: 'Kaydınız başarıyla tamamlandı. Artık giriş yapabilirsiniz.',
            user: {
                id: user._id,
                email: user.email,
                username: user.username,
            },
            token: generateToken(user._id), // Giriş için token oluştur
        });
    } catch (error) {
        console.error('Kayıt tamamlama hatası:', error);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Kayıt bağlantınızın süresi doldu. Lütfen tekrar kayıt olun.' });
        }
        res.status(401).json({ message: 'Geçersiz token veya işlem başarısız.' });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    const { email, password } = req.body;

    // ÖNEMLİ DÜZELTME: password alanını açıkça seçiyoruz.
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
        if (!user.isVerified) {
            return res.status(401).json({ message: 'Hesabınız doğrulanmamış. Lütfen e-postanızı kontrol edin.' });
        }
        res.json({
            message: 'Giriş başarılı.',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
            },
            token: generateToken(user._id),
        });
    } else {
        res.status(401).json({ message: 'Geçersiz e-posta veya şifre.' });
    }
};

// @desc    Request password reset link
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        return res.status(404).json({ message: 'Bu e-posta adresine kayıtlı bir kullanıcı bulunamadı.' });
    }

    // Şifre sıfırlama token'ı oluştur (rastgele ve güvenli)
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 dakika geçerli
    await user.save();

    // Frontend'in şifre sıfırlama sayfasının URL'i
    const resetUrl = `${process.env.CLIENT_URL}/?resetToken=${resetToken}`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Fotogram Şifre Sıfırlama',
            message: `Şifrenizi sıfırlamak için lütfen bu bağlantıya tıklayın: ${resetUrl}\n\nBu bağlantı 10 dakika içinde geçerliliğini yitirecektir.`
        });

        res.status(200).json({ message: 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.' });
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();
        console.error('Şifre sıfırlama e-postası gönderilirken hata:', error);
        res.status(500).json({ message: 'E-posta gönderilirken bir hata oluştu.' });
    }
};

// @desc    Reset password using token
// @route   POST /api/auth/reset-password
// @access  Public (with token in Authorization header for security)
const resetPassword = async (req, res) => {
    const { password } = req.body;
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1]; // Bearer token

    if (!token) {
        return res.status(401).json({ message: 'Doğrulama token\'ı bulunamadı.' });
    }

    // Hashlenmiş token'ı veritabanında ara
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // ÖNEMLİ DÜZELTME: password alanını açıkça seçiyoruz.
    const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpire: { $gt: Date.now() } // Süresi dolmamış
    }).select('+password');

    if (!user) {
        return res.status(400).json({ message: 'Geçersiz veya süresi dolmuş şifre sıfırlama bağlantısı.' });
    }

    user.password = password; // Mongoose pre-save hook hashleyecektir
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ message: 'Şifreniz başarıyla sıfırlandı. Şimdi giriş yapabilirsiniz.' });
};

module.exports = { register, completeRegister, login, forgotPassword, resetPassword };
