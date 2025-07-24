// backend/src/controllers/authController.js

const User = require('../models/User'); // User modelini import et
const jwt = require('jsonwebtoken');   // npm install jsonwebtoken paketini kurduğundan emin ol
const sendEmail = require('../utils/sendEmail'); // Mail gönderme yardımcı fonksiyonu (yolunu kontrol et!)
const crypto = require('crypto'); // Node.js'in dahili modülü, npm install gerekmez

// JWT Token Oluşturma Fonksiyonu
// Bu fonksiyon, kullanıcı kimliği (id) için bir JSON Web Token oluşturur.
const generateToken = (id) => {
    // JWT_SECRET ortam değişkeni Render'da ayarlı olmalı (örn: Render Dashboard > Services > fotogram-backend > Environment)
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '1h', // Token'ın geçerlilik süresi (örnek: 1 saat)
    });
};

// @desc    Yeni kullanıcı kaydetme işlemi
// @route   POST /api/auth/register
// @access  Public (Herkes erişebilir)
const registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    // Alanların dolu olup olmadığını kontrol et
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Lütfen tüm alanları doldurun.' });
    }

    try {
        // Kullanıcının zaten var olup olmadığını kontrol et (username veya email ile)
        const userExists = await User.findOne({ $or: [{ username }, { email }] });

        if (userExists) {
            return res.status(400).json({ message: 'Bu kullanıcı adı veya e-posta zaten kayıtlı.' });
        }

        // Yeni kullanıcı oluştur
        const user = await User.create({
            username,
            email,
            password, // User modelindeki pre-save hook şifreyi hashleyecektir.
        });

        if (user) {
            // Kayıt başarılı ise kullanıcıya hoş geldin maili gönder
            try {
                const mailOptions = {
                    email: user.email,
                    subject: 'Fotogram\'a Hoş Geldin!',
                    message: `Merhaba ${user.username},\n\nFotogram'a başarıyla kaydoldun! Uygulamamızı kullanmaya başlamak için giriş yapabilirsin.\n\nKeyifli paylaşımlar dileriz,\nFotogram Ekibi`,
                    html: `
                        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                            <h2 style="color: #000;">Fotogram\'a Hoş Geldin!</h2>
                            <p>Merhaba <strong>${user.username}</strong>,</p>
                            <p>Fotogram ailesine katıldığın için çok mutluyuz! Hesabın başarıyla oluşturuldu.</p>
                            <p>Uygulamamızı keşfetmek ve fotoğraflarını paylaşmaya başlamak için şimdi giriş yapabilirsin:</p>
                            <p style="text-align: center;">
                                <a href="${process.env.FRONTEND_URL || 'https://fotogram-app.onrender.com'}" 
                                   style="display: inline-block; padding: 10px 20px; background-color: #000; color: #fff; text-decoration: none; border-radius: 5px;">
                                   Giriş Yap
                                </a>
                            </p>
                            <p>Keyifli paylaşımlar dileriz,</p>
                            <p><strong>Fotogram Ekibi</strong></p>
                            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                            <p style="font-size: 0.8em; color: #666;">Bu e-posta otomatik olarak gönderilmiştir. Lütfen bu e-postaya yanıt vermeyin.</p>
                        </div>
                    `,
                };
                await sendEmail(mailOptions);
                console.log(`Kayıt sonrası hoş geldin maili ${user.email} adresine gönderildi.`);
            } catch (mailError) {
                console.error(`Kayıt sonrası mail gönderme hatası (${user.email}):`, mailError);
                // Mail gönderme hatası, kayıt işlemini engellememeli, sadece loglanmalı
            }

            // Başarılı yanıt
            res.status(201).json({
                message: 'Kayıt başarılı! Şimdi giriş yapabilirsin.'
                // Kayıt sırasında token göndermiyoruz, kullanıcı giriş yapmalı
            });
        } else {
            res.status(400).json({ message: 'Kullanıcı oluşturulamadı. Geçersiz kullanıcı verileri.' });
        }
    } catch (error) {
        console.error('Kayıt sırasında hata:', error);
        res.status(500).json({ message: 'Sunucu hatası: Kullanıcı kaydı yapılamadı.' });
    }
};

// @desc    Kullanıcı girişi (login)
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Lütfen e-posta ve şifrenizi girin.' });
    }

    try {
        // Kullanıcıyı e-posta ile bul ve şifreyi de çek
        const user = await User.findOne({ email }).select('+password'); // Şifreyi de çek!

        if (!user) {
            return res.status(401).json({ message: 'E-posta veya şifre hatalı.' });
        }

        // Girilen şifreyi hashlenmiş şifre ile karşılaştır
        const isMatch = await user.matchPassword(password);

        if (user && isMatch) {
            res.json({
                message: 'Giriş Başarılı!',
                token: generateToken(user._id), // Token oluştur ve gönder
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    profilePicture: user.profilePicture,
                },
            });
        } else {
            // Kullanıcı bulundu ama şifre eşleşmedi
            res.status(401).json({ message: 'E-posta veya şifre hatalı.' });
        }
    } catch (error) {
        console.error('Giriş sırasında hata:', error);
        res.status(500).json({ message: 'Sunucu hatası: Giriş yapılamadı.' });
    }
};

// @desc    Şifre sıfırlama talebi
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Lütfen kayıtlı e-posta adresinizi girin.' });
    }

    try {
        const user = await User.findOne({ email });

        if (!user) {
            // Güvenlik nedeniyle, kullanıcının var olup olmadığı bilgisini ifşa etmiyoruz.
            // Her durumda başarılı yanıt döndürüp, varsa mail göndermiş gibi yapıyoruz.
            return res.status(200).json({ message: 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi (varsa).' });
        }

        // Şifre sıfırlama token'ı oluştur
        const resetToken = crypto.randomBytes(32).toString('hex');
        // Token'ı hashle ve kullanıcı modeline kaydet (gerçek token'ı kaydetmiyoruz)
        user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        // Token'ın geçerlilik süresini ayarla (10 dakika)
        user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 dakika

        await user.save({ validateBeforeSave: false }); // Validasyonları atla, sadece bu alanları kaydet

        // Şifre sıfırlama linki
        // Bu link frontend'de reset-password sayfan olmalı
        const resetURL = `${process.env.FRONTEND_URL || 'https://fotogram-app.onrender.com'}/reset-password?token=${resetToken}`;

        const message = `Şifrenizi sıfırlamak için lütfen aşağıdaki linke tıklayın:\n\n${resetURL}\n\nBu link 10 dakika içinde geçerliliğini yitirecektir.\n\nEğer bu isteği siz yapmadıysanız, lütfen bu e-postayı dikkate almayın.`;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Şifre Sıfırlama Talebi',
                message,
                html: `
                    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                        <h2 style="color: #000;">Şifre Sıfırlama Talebi</h2>
                        <p>Merhaba ${user.username},</p>
                        <p>Şifrenizi sıfırlamak için bir talep aldık. Aşağıdaki butona tıklayarak şifrenizi sıfırlayabilirsiniz:</p>
                        <p style="text-align: center;">
                            <a href="${resetURL}" 
                               style="display: inline-block; padding: 10px 20px; background-color: #000; color: #fff; text-decoration: none; border-radius: 5px;">
                               Şifreyi Sıfırla
                            </a>
                        </p>
                        <p>Bu link <strong>10 dakika</strong> içinde geçerliliğini yitirecektir.</p>
                        <p>Eğer bu isteği siz yapmadıysanız, lütfen bu e-postayı dikkate almayın.</p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                        <p style="font-size: 0.8em; color: #666;">Fotogram Ekibi</p>
                    </div>
                `,
            });

            res.status(200).json({ message: 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.' });
        } catch (emailError) {
            // Mail gönderme hatası olursa, token'ı ve süresini temizle
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            await user.save({ validateBeforeSave: false }); // Tekrar kaydet

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
const resetPassword = async (req, res) => {
    // URL'den gelen token'ı hashle (çünkü veritabanında hashlenmiş hali var)
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
            passwordResetExpires: { $gt: Date.now() }, // Token'ın geçerlilik süresini kontrol et
        });

        if (!user) {
            return res.status(400).json({ message: 'Geçersiz veya süresi dolmuş şifre sıfırlama bağlantısı.' });
        }

        // Yeni şifreyi ata ve hashleme pre-save hook'u sayesinde otomatik hashlenecek
        user.password = password;
        // Şifre sıfırlama token ve süre alanlarını temizle
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;

        await user.save(); // Şifreyi kaydet (bu pre-save hook'u tetikler)

        res.status(200).json({ message: 'Şifreniz başarıyla sıfırlandı. Şimdi yeni şifrenizle giriş yapabilirsiniz.' });

    } catch (error) {
        console.error('Şifre sıfırlama hatası:', error);
        res.status(500).json({ message: 'Sunucu hatası: Şifre sıfırlama işlemi yapılamadı.' });
    }
};


module.exports = {
    registerUser,
    loginUser,
    forgotPassword,
    resetPassword,
};
