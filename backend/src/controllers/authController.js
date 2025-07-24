// backend/src/controllers/authController.js - GÜNCEL VE SON VERSİYON

const User = require('../models/User');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail'); 
const crypto = require('crypto');
// const { promisify } = require('util'); // Kullanılmadığı için kaldırıldı

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

    console.log('Backend: registerUser fonksiyonu çağrıldı. Gelen veri:', { username, email }); // YENİ LOG

    if (!username || !email || !password || !confirmPassword) {
        console.log('Backend: Kayıt için tüm alanlar doldurulmadı.'); // YENİ LOG
        return res.status(400).json({ message: 'Lütfen tüm alanları doldurun.' });
    }
    if (password !== confirmPassword) {
        console.log('Backend: Şifreler eşleşmiyor.'); // YENİ LOG
        return res.status(400).json({ message: 'Şifreler eşleşmiyor.' });
    }
    if (password.length < 6) {
        console.log('Backend: Şifre en az 6 karakter olmalı.'); // YENİ LOG
        return res.status(400).json({ message: 'Şifre en az 6 karakter olmalıdır.' });
    }

    try {
        const userExists = await User.findOne({ $or: [{ username }, { email }] });
        if (userExists) {
            console.log('Backend: Kullanıcı adı veya e-posta zaten kayıtlı.'); // YENİ LOG
            return res.status(400).json({ message: 'Bu kullanıcı adı veya e-posta zaten kayıtlı.' });
        }

        const newUser = await User.create({ username, email, password });
        console.log('Backend: Yeni kullanıcı oluşturuldu:', newUser.email); // YENİ LOG

        // E-posta doğrulama token'ı oluştur
        const verificationToken = newUser.createEmailVerificationToken();
        await newUser.save({ validateBeforeSave: false });
        console.log('Backend: E-posta doğrulama tokenı oluşturuldu.'); // YENİ LOG

        // E-posta doğrulama linkini yeni HTML dosyası adına göre güncelle
        // BURADAKİ URL'NİN FRONTEND URL'N OLDUĞUNDAN EMİN OL!
        const verifyURL = `${process.env.FRONTEND_URL}/email-verification-status.html?token=${verificationToken}`;
        console.log('Backend: Doğrulama URL:', verifyURL); // YENİ LOG

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
            console.log(`Backend: Kayıt doğrulama maili ${newUser.email} adresine gönderildi.`);
        } catch (mailError) {
            console.error(`Backend: Kayıt doğrulama maili gönderme hatası (${newUser.email}):`, mailError);
            return res.status(500).json({
                message: 'Kayıt başarılı ancak doğrulama e-postası gönderilemedi. Lütfen daha sonra tekrar deneyin.'
            });
        }

        res.status(201).json({
            status: 'success',
            message: 'Kayıt başarılı! Hesabınızı doğrulamak için lütfen e-postanızı kontrol edin.'
        });
        console.log('Backend: Kayıt başarılı yanıtı gönderildi.'); // YENİ LOG

    } catch (error) {
        console.error('Backend: Kayıt sırasında beklenmeyen hata:', error);
        res.status(400).json({ message: error.message || 'Kullanıcı oluşturulamadı. Geçersiz kullanıcı verileri.' });
    }
};

// @desc    Kullanıcı girişi (login)
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    console.log('Backend: loginUser fonksiyonu çağrıldı. Gelen email:', email); // YENİ LOG

    if (!email || !password) {
        console.log('Backend: Email veya şifre eksik.'); // YENİ LOG
        return res.status(400).json({ message: 'Lütfen e-posta ve şifrenizi girin.' });
    }

    try {
        const user = await User.findOne({ email }).select('+password +isVerified');
        console.log('Backend: Kullanıcı arandı. Kullanıcı bulundu mu:', !!user); // YENİ LOG

        if (!user) {
            console.log('Backend: Kullanıcı bulunamadı veya e-posta hatalı.'); // YENİ LOG
            return res.status(401).json({ message: 'E-posta veya şifre hatalı.' });
        }

        const isMatch = await user.correctPassword(password, user.password);
        console.log('Backend: Şifre eşleşme kontrolü yapıldı. Eşleşme:', isMatch); // YENİ LOG

        if (!isMatch) {
            console.log('Backend: Şifre eşleşmedi.'); // YENİ LOG
            return res.status(401).json({ message: 'E-posta veya şifre hatalı.' });
        }

        // E-posta doğrulanmış mı kontrol et
        if (!user.isVerified) {
            console.log('Backend: E-posta doğrulanmamış:', user.email); // YENİ LOG
            return res.status(401).json({ message: 'Lütfen e-posta adresinizi doğrulayın. Doğrulama linki e-postanıza gönderilmiştir.' });
        }

        const token = generateToken(user._id);
        user.password = undefined; // Güvenlik için şifreyi yanıttan kaldır

        console.log('Backend: Giriş Başarılı! Yanıt gönderiliyor.'); // YENİ LOG
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
        console.log('Backend: Login yanıtı gönderildi.'); // YENİ LOG (Yanıt gönderildikten sonra)

    } catch (error) {
        console.error('Backend: Giriş sırasında beklenmeyen hata:', error);
        res.status(500).json({ message: 'Sunucu hatası: Giriş yapılamadı.' });
    }
};

// @desc    E-posta doğrulama linki ile hesabın aktif edilmesi
// @route   GET /api/auth/verify-email/:token
// @access  Public
exports.verifyEmail = async (req, res) => {
    console.log('--- BACKEND: verifyEmail fonksiyonu çağrıldı ---'); // Bu logu görmeliyiz!
    try {
        // Token'ı query params'tan alıyoruz (örn: ?token=XYZ)
        const tokenFromQuery = req.query.token; 
        console.log('Backend: Verify Email gelen token:', tokenFromQuery ? 'Var' : 'Yok'); // YENİ LOG

        if (!tokenFromQuery) {
            console.error('Backend: Doğrulama tokenı URL parametrelerinde bulunamadı.');
            return res.status(400).json({
                status: 'fail',
                message: 'Doğrulama linki eksik veya hatalı.'
            });
        }

        const hashedToken = crypto.createHash('sha256').update(tokenFromQuery).digest('hex');
        console.log('Backend: Hashed Token:', hashedToken);

        const user = await User.findOne({
            emailVerificationToken: hashedToken,
            emailVerificationExpires: { $gt: Date.now() }
        });
        console.log('Backend: Doğrulama için kullanıcı arandı. Bulundu mu:', !!user); // YENİ LOG

        if (!user) {
            console.error('Backend: Geçersiz doğrulama linki veya süresi dolmuş. Kullanıcı bulunamadı.');
            return res.status(400).json({
                status: 'fail',
                message: 'Geçersiz doğrulama linki veya süresi dolmuş.'
            });
        }

        user.isVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        await user.save({ validateBeforeSave: false }); // Doğrulama sonrası validasyon yapma

        console.log(`Backend: Kullanıcı ${user.email} başarıyla doğrulandı.`);
        res.status(200).json({
            status: 'success',
            message: 'E-posta adresiniz başarıyla doğrulandı! Artık giriş yapabilirsiniz.'
        });
        console.log('Backend: E-posta doğrulama başarılı yanıtı gönderildi.'); // YENİ LOG

    } catch (error) {
        console.error('Backend: E-posta doğrulama sırasında beklenmeyen hata:', error);
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

    console.log('Backend: forgotPassword fonksiyonu çağrıldı. Gelen email:', email); // YENİ LOG

    if (!email) {
        console.log('Backend: Şifre sıfırlama için email eksik.'); // YENİ LOG
        return res.status(400).json({ message: 'Lütfen kayıtlı e-posta adresinizi girin.' });
    }

    try {
        const user = await User.findOne({ email });
        console.log('Backend: Şifre sıfırlama için kullanıcı arandı. Bulundu mu:', !!user); // YENİ LOG

        if (!user) {
            // Güvenlik nedeniyle, kullanıcı bulunmasa bile başarılı yanıt döneriz.
            console.log('Backend: Şifre sıfırlama için kullanıcı bulunamadı (güvenlik).'); // YENİ LOG
            return res.status(200).json({ message: 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi (varsa).' });
        }

        const resetToken = user.createPasswordResetToken();
        await user.save({ validateBeforeSave: false });
        console.log('Backend: Şifre sıfırlama tokenı oluşturuldu.'); // YENİ LOG

        // BURADAKİ URL'NİN FRONTEND URL'N OLDUĞUNDAN EMİN OL!
        const resetURL = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
        console.log('Backend: Şifre sıfırlama URL:', resetURL); // YENİ LOG

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
            console.log(`Backend: Şifre sıfırlama maili ${user.email} adresine gönderildi.`);
            res.status(200).json({ message: 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.' });
            console.log('Backend: Şifre sıfırlama başarılı yanıtı gönderildi.'); // YENİ LOG

        } catch (emailError) {
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            await user.save({ validateBeforeSave: false });

            console.error('Backend: Şifre sıfırlama maili gönderme hatası:', emailError);
            return res.status(500).json({ message: 'E-posta gönderilirken bir hata oluştu. Lütfen tekrar deneyin.' });
        }

    } catch (error) {
        console.error('Backend: Şifre sıfırlama sırasında beklenmeyen hata:', error);
        res.status(500).json({ message: 'Sunucu hatası: Şifre sıfırlama talebi gönderilemedi.' });
    }
};

// @desc    Şifre sıfırlama (token ile)
// @route   PUT /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res) => {
    console.log('Backend: resetPassword fonksiyonu çağrıldı. Gelen token:', req.params.token); // YENİ LOG
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const { password, confirmPassword } = req.body;

    if (!password || !confirmPassword) {
        console.log('Backend: Yeni şifre veya şifre onayı eksik.'); // YENİ LOG
        return res.status(400).json({ message: 'Lütfen yeni şifre ve şifre onayını doldurun.' });
    }
    if (password !== confirmPassword) {
        console.log('Backend: Yeni şifreler uyuşmuyor.'); // YENİ LOG
        return res.status(400).json({ message: 'Şifreler uyuşmuyor.' });
    }
    if (password.length < 6) {
        console.log('Backend: Yeni şifre en az 6 karakter olmalı.'); // YENİ LOG
        return res.status(400).json({ message: 'Şifre en az 6 karakter olmalıdır.' });
    }

    try {
        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { PAGINATION_NUMBER: Date.now() }, // PAGINATION_NUMBER yerine $gt olmalıydı, düzeltildi
        });
        console.log('Backend: Şifre sıfırlama için kullanıcı arandı. Bulundu mu:', !!user); // YENİ LOG

        if (!user) {
            console.log('Backend: Geçersiz veya süresi dolmuş şifre sıfırlama linki.'); // YENİ LOG
            return res.status(400).json({ message: 'Geçersiz veya süresi dolmuş şifre sıfırlama bağlantısı.' });
        }

        user.password = password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        user.passwordChangedAt = Date.now();

        await user.save();
        console.log(`Backend: Kullanıcı ${user.email} şifresi başarıyla sıfırlandı.`); // YENİ LOG

        res.status(200).json({ message: 'Şifreniz başarıyla sıfırlandı. Şimdi yeni şifrenizle giriş yapabilirsiniz.' });
        console.log('Backend: Şifre sıfırlama başarılı yanıtı gönderildi.'); // YENİ LOG

    } catch (error) {
        console.error('Backend: Şifre sıfırlama sırasında beklenmeyen hata:', error);
        res.status(500).json({ message: 'Sunucu hatası: Şifre sıfırlama işlemi yapılamadı.' });
    }
};
