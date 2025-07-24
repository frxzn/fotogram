// backend/src/controllers/authController.js

const User = require('../models/User');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail'); 
const crypto = require('crypto');
const { promisify } = require('util');

// JWT Token Oluşturma Fonksiyonu
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN, // Bu ortam değişkeninin Render'da doğru ayarlandığından emin ol!
    });
};

// @desc    Yeni kullanıcı kaydetme işlemi
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res) => {
    const { username, email, password, confirmPassword } = req.body;

    if (!username || !email || !password || !confirmPassword) {
        return res.status(400).json({ message: 'Lütfen tüm alanları doldurun.' });
    }
    if (password !== confirmPassword) {
        return res.status(400).json({ message: 'Şifreler eşleşmiyor.' });
    }
    if (password.length < 6) {
        return res.status(400).json({ message: 'Şifre en az 6 karakter olmalıdır.' });
    }

    try {
        const userExists = await User.findOne({ $or: [{ username }, { email }] });
        if (userExists) {
            return res.status(400).json({ message: 'Bu kullanıcı adı veya e-posta zaten kayıtlı.' });
        }

        const newUser = await User.create({ username, email, password });

        // E-posta doğrulama token'ı oluştur
        const verificationToken = newUser.createEmailVerificationToken();
        await newUser.save({ validateBeforeSave: false });

        // E-posta doğrulama linkini yeni HTML dosyası adına göre güncelle
        const verifyURL = `${process.env.FRONTEND_URL}/email-verification-status.html?token=${verificationToken}`;

        try {
            await sendEmail({
                email: newUser.email,
                subject: 'Fotogram Hesabınızı Doğrulayın',
                message: `Merhaba ${username},\n\nFotogram hesabınızı oluşturma talebinizi aldık. Kayıt işlemini tamamlamak için lütfen aşağıdaki butona tıklayın:`,
                actionButton: {
                    text: 'Kaydı Tamamla',
                    link: verifyURL
                }
            });
            console.log(`Kayıt doğrulama maili ${newUser.email} adresine gönderildi.`);
        } catch (mailError) {
            console.error(`Kayıt doğrulama maili gönderme hatası (${newUser.email}):`, mailError);
            return res.status(500).json({
                message: 'Kayıt başarılı ancak doğrulama e-postası gönderilemedi. Lütfen daha sonra tekrar deneyin.'
            });
        }

        res.status(201).json({
            status: 'success',
            message: 'Kayıt başarılı! Hesabınızı doğrulamak için lütfen e-postanızı kontrol edin.'
        });

    } catch (error) {
        console.error('Kayıt sırasında hata:', error);
        res.status(400).json({ message: error.message || 'Kullanıcı oluşturulamadı. Geçersiz kullanıcı verileri.' });
    }
};

// @desc    Kullanıcı girişi (login)
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Lütfen e-posta ve şifrenizi girin.' });
    }

    try {
        const user = await User.findOne({ email }).select('+password +isVerified');

        if (!user) {
            return res.status(401).json({ message: 'E-posta veya şifre hatalı.' });
        }

        const isMatch = await user.correctPassword(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'E-posta veya şifre hatalı.' });
        }

        // E-posta doğrulanmış mı kontrol et
        if (!user.isVerified) {
            return res.status(401).json({ message: 'Lütfen e-posta adresinizi doğrulayın. Doğrulama linki e-postanıza gönderilmiştir.' });
        }

        const token = generateToken(user._id);
        user.password = undefined;

        res.json({
            status: 'success',
            message: 'Giriş Başarılı!',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                photo: user.photo,
            },
        });
    } catch (error) {
        console.error('Giriş sırasında hata:', error);
        res.status(500).json({ message: 'Sunucu hatası: Giriş yapılamadı.' });
    }
};

// @desc    E-posta doğrulama linki ile hesabın aktif edilmesi
// @route   GET /api/auth/verify-email/:token
// @access  Public
exports.verifyEmail = async (req, res) => {
    console.log('--- BACKEND: verifyEmail fonksiyonu çağrıldı ---'); // Bu logu görmeliyiz!
    try {
        // Token'ı query params'tan alıyoruz (örneğin ?token=XYZ)
        // Frontend'den gelen token'ın URL'de parametre olarak geldiğini varsayıyoruz.
        const tokenFromQuery = req.query.token; 
        if (!tokenFromQuery) {
            console.error('Doğrulama tokenı URL parametrelerinde bulunamadı.');
            return res.status(400).json({
                status: 'fail',
                message: 'Doğrulama linki eksik veya hatalı.'
            });
        }

        const hashedToken = crypto.createHash('sha256').update(tokenFromQuery).digest('hex');
        console.log('Hashed Token:', hashedToken);

        const user = await User.findOne({
            emailVerificationToken: hashedToken,
            emailVerificationExpires: { $gt: Date.now() }
        });

        if (!user) {
            console.error('Geçersiz doğrulama linki veya süresi dolmuş. Kullanıcı bulunamadı.');
            return res.status(400).json({
                status: 'fail',
                message: 'Geçersiz doğrulama linki veya süresi dolmuş.'
            });
        }

        user.isVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        await user.save({ validateBeforeSave: false }); // Doğrulama sonrası validasyon yapma

        console.log(`Kullanıcı ${user.email} başarıyla doğrulandı.`);
        res.status(200).json({
            status: 'success',
            message: 'E-posta adresiniz başarıyla doğrulandı! Artık giriş yapabilirsiniz.'
        });

    } catch (error) {
        console.error('E-posta doğrulama sırasında beklenmeyen hata:', error);
        res.status(500).json({
            status: 'error',
            message: 'E-posta doğrulama sırasında bir hata oluştu.'
        });
    }
};

// @desc    Şifre sıfırlama talebi
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Lütfen kayıtlı e-posta adresinizi girin.' });
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(200).json({ message: 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi (varsa).' });
        }

        const resetToken = user.createPasswordResetToken();
        await user.save({ validateBeforeSave: false });

        const resetURL = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Fotogram - Şifre Sıfırlama Talebi',
                message: 'Şifrenizi sıfırlamak için aşağıdaki butona tıklayabilirsiniz. Bu link 10 dakika içinde geçerliliğini yitirecektir. Eğer bu isteği siz yapmadıysanız, lütfen bu e-postayı dikkate almayın.',
                actionButton: {
                    text: 'Şifreyi Sıfırla',
                    link: resetURL
                }
            });

            res.status(200).json({ message: 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.' });
        } catch (emailError) {
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            await user.save({ validateBeforeSave: false });

            console.error('Şifre sıfırlama maili gönderme hatası:', emailError);
            return res.status(500).json({ message: 'E-posta gönderilirken bir hata oluştu. Lütfen tekrar deneyin.' });
        }

    } catch (error) {
        console.error('Şifre sıfırlama hatası:', error);
        res.status(500).json({ message: 'Sunucu hatası: Şifre sıfırlama talebi gönderilemedi.' });
    }
};

// @desc    Şifre sıfırlama (token ile)
// @route   PUT /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res) => {
    // req.params.token'ı kullanıyoruz çünkü authRoutes'da :token olarak tanımlandı.
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const { password, confirmPassword } = req.body;

    if (!password || !confirmPassword) {
        return res.status(400).json({ message: 'Lütfen yeni şifre ve şifre onayını doldurun.' });
    }
    if (password !== confirmPassword) {
        return res.status(400).json({ message: 'Şifreler uyuşmuyor.' });
    }
    if (password.length < 6) {
        return res.status(400).json({ message: 'Şifre en az 6 karakter olmalıdır.' });
    }

    try {
        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Geçersiz veya süresi dolmuş şifre sıfırlama bağlantısı.' });
        }

        user.password = password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        user.passwordChangedAt = Date.now();

        await user.save();

        res.status(200).json({ message: 'Şifreniz başarıyla sıfırlandı. Şimdi yeni şifrenizle giriş yapabilirsiniz.' });

    } catch (error) {
        console.error('Şifre sıfırlama hatası:', error);
        res.status(500).json({ message: 'Sunucu hatası: Şifre sıfırlama işlemi yapılamadı.' });
    }
};
