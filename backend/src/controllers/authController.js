// backend/src/controllers/authController.js

const User = require('../models/User');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
const { promisify } = require('util'); // JWT verify için

// JWT Token Oluşturma Fonksiyonu
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN, // Token'ın geçerlilik süresi (örn: '1h', '30d')
    });
};

// @desc    Yeni kullanıcı kaydetme işlemi
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res) => {
    const { username, email, password, confirmPassword } = req.body;

    // Alanların dolu olup olmadığını kontrol et
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
        // Kullanıcının zaten var olup olmadığını kontrol et (username veya email ile)
        const userExists = await User.findOne({ $or: [{ username }, { email }] });

        if (userExists) {
            return res.status(400).json({ message: 'Bu kullanıcı adı veya e-posta zaten kayıtlı.' });
        }

        // Yeni kullanıcı oluştur (isVerified varsayılan olarak false olacak)
        const newUser = await User.create({
            username,
            email,
            password,
            // passwordConfirm burada tutulmaz, sadece validasyon için kullanıldı
            // isVerified: false, // Modelde default false olduğu için burada belirtmeye gerek yok
        });

        // E-posta doğrulama token'ı oluştur
        const verificationToken = newUser.createEmailVerificationToken();
        await newUser.save({ validateBeforeSave: false }); // Token'ı kaydet

        const verifyURL = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`; // Frontend URL'si

        const registrationMailHtml = `
            <div style="font-family: 'Roboto', sans-serif; line-height: 1.6; color: #E0E0E0; background-color: #000000; padding: 20px; border-radius: 8px; max-width: 600px; margin: auto; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);">
                <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #333333;">
                    <h1 style="color: #FFFFFF; font-size: 2.5em; margin: 0; letter-spacing: -1px;">Fotogram</h1>
                </div>
                <div style="padding: 30px 20px; background-color: #1A1A1A;">
                    <p style="margin-bottom: 15px; color: #CCCCCC;">Merhaba ${username},</p>
                    <p style="margin-bottom: 15px; color: #CCCCCC;">Fotogram hesabınızı oluşturma talebinizi aldık. Kayıt işlemini tamamlamak için lütfen aşağıdaki butona tıklayın:</p>
                    
                    <p style="text-align: center; margin: 30px 0;">
                        <a href="${verifyURL}" 
                           style="display: inline-block; padding: 12px 25px; background-color: #FFFFFF; color: #000000; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 1.1em; transition: background-color 0.3s ease; border: 2px solid #FFFFFF;">
                           Kaydı Tamamla
                        </a>
                    </p>
                    <p style="text-align: center; margin-top: 15px; font-size: 0.9em; color: #999999;">
                        Eğer yukarıdaki buton çalışmıyorsa, lütfen aşağıdaki bağlantıyı kopyalayıp tarayıcınızın adres çubuğuna yapıştırın:<br>
                        <a href="${verifyURL}" style="word-break: break-all; color: #B3B3B3; text-decoration: underline;">${verifyURL}</a>
                    </p>
                    
                    <p style="margin-top: 25px; font-size: 0.9em; color: #B3B3B3;">
                        Bu e-posta size gönderilen kayıt bağlantısıdır. Eğer bu talebi siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.
                    </p>
                    <p style="margin-top: 15px; color: #CCCCCC;">Teşekkürler,<br>Fotogram Ekibi</p>
                </div>
                <div style="background-color: #000000; padding: 15px 20px; text-align: center; font-size: 0.85em; color: #B3B3B3; border-top: 1px solid #333333;">
                    <p>&copy; ${new Date().getFullYear()} Fotogram. Tüm Hakları Saklıdır.</p>
                    <p style="color: #FFFFFF; font-weight: 500; margin-top: 5px;">Turan Software</p>
                </div>
            </div>
        `;

        try {
            await sendEmail({
                email: newUser.email,
                subject: 'Fotogram Hesabınızı Doğrulayın',
                message: 'Kaydı tamamlamak için lütfen aşağıdaki butona tıklayın.', // Bu varsayılan metin HTML olduğunda pek kullanılmaz
                html: registrationMailHtml,
            });
            console.log(`Kayıt doğrulama maili ${newUser.email} adresine gönderildi.`);
        } catch (mailError) {
            console.error(`Kayıt doğrulama maili gönderme hatası (${newUser.email}):`, mailError);
            // E-posta gönderiminde hata olursa kullanıcıyı sil veya isVerified'ı false bırak
            // Eğer isVerified default false ise, sadece silmeye gerek kalmaz, kullanıcı manuel doğrulama yapabilir.
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
        // isVerified alanını da çek
        const user = await User.findOne({ email }).select('+password +isVerified');

        if (!user) {
            return res.status(401).json({ message: 'E-posta veya şifre hatalı.' });
        }

        const isMatch = await user.correctPassword(password, user.password);

        if (!isMatch) { // Şifre eşleşmediyse
            return res.status(401).json({ message: 'E-posta veya şifre hatalı.' });
        }

        // E-posta doğrulanmış mı kontrol et
        if (!user.isVerified) {
            return res.status(401).json({ message: 'Lütfen e-posta adresinizi doğrulayın. Doğrulama linki e-postanıza gönderilmiştir.' });
        }

        // Her şey yolundaysa token gönder
        const token = generateToken(user._id);
        user.password = undefined; // Şifreyi yanıtta gösterme

        res.json({
            status: 'success',
            message: 'Giriş Başarılı!',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                photo: user.photo, // 'profilePicture' yerine 'photo' kullanıyorsak
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
    try {
        const hashedToken = crypto.createHash('sha256').update(req.query.token).digest('hex'); // Query parametresi olarak gelen token

        const user = await User.findOne({
            emailVerificationToken: hashedToken,
            emailVerificationExpires: { $gt: Date.now() } // Süresi dolmamış
        });

        if (!user) {
            // Frontend'e JSON olarak hata mesajı döndür
            return res.status(400).json({
                status: 'fail',
                message: 'Geçersiz doğrulama linki veya süresi dolmuş.'
            });
        }

        // Kullanıcıyı doğrula ve token alanlarını temizle
        user.isVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        await user.save({ validateBeforeSave: false }); // Doğrulama sırasında password gibi alanların validasyonunu atla

        // Frontend'e JSON olarak başarı mesajı döndür
        res.status(200).json({
            status: 'success',
            message: 'E-posta adresiniz başarıyla doğrulandı! Artık giriş yapabilirsiniz.'
        });

    } catch (error) {
        console.error('E-posta doğrulama hatası:', error);
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
            // Güvenlik nedeniyle, kullanıcının var olup olmadığını ifşa etmeyiz.
            // Sanki mail gönderilmiş gibi gösteririz.
            return res.status(200).json({ message: 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi (varsa).' });
        }

        const resetToken = user.createPasswordResetToken(); // User modelindeki metodu kullan
        await user.save({ validateBeforeSave: false });

        const resetURL = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

        const passwordResetMailHtml = `
            <div style="font-family: 'Roboto', sans-serif; line-height: 1.6; color: #E0E0E0; background-color: #000000; padding: 20px; border-radius: 8px; max-width: 600px; margin: auto; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);">
                <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #333333;">
                    <h1 style="color: #FFFFFF; font-size: 2.5em; margin: 0; letter-spacing: -1px;">Fotogram</h1>
                </div>
                <div style="padding: 30px 20px; background-color: #1A1A1A;">
                    <p style="margin-bottom: 15px; color: #CCCCCC;">Merhaba,</p>
                    <p style="margin-bottom: 15px; color: #CCCCCC;">Şifrenizi sıfırlamak için bir talep aldık. Şifrenizi değiştirmek için lütfen aşağıdaki butona tıklayın:</p>
                    
                    <p style="text-align: center; margin: 30px 0;">
                        <a href="${resetURL}" 
                           style="display: inline-block; padding: 12px 25px; background-color: #FFFFFF; color: #000000; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 1.1em; transition: background-color 0.3s ease; border: 2px solid #FFFFFF;">
                           Şifremi Sıfırla
                        </a>
                    </p>
                    <p style="text-align: center; margin-top: 15px; font-size: 0.9em; color: #999999;">
                        Bu link 10 dakika içinde geçerliliğini yitirecektir.<br>Eğer yukarıdaki buton çalışmıyorsa, lütfen aşağıdaki bağlantıyı kopyalayıp tarayıcınızın adres çubuğuna yapıştırın:<br>
                        <a href="${resetURL}" style="word-break: break-all; color: #B3B3B3; text-decoration: underline;">${resetURL}</a>
                    </p>
                    
                    <p style="margin-top: 25px; font-size: 0.9em; color: #B3B3B3;">
                        Eğer bu isteği siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.
                    </p>
                    <p style="margin-top: 15px; color: #CCCCCC;">Teşekkürler,<br>Fotogram Ekibi</p>
                </div>
                <div style="background-color: #000000; padding: 15px 20px; text-align: center; font-size: 0.85em; color: #B3B3B3; border-top: 1px solid #333333;">
                    <p>&copy; ${new Date().getFullYear()} Fotogram. Tüm Hakları Saklıdır.</p>
                    <p style="color: #FFFFFF; font-weight: 500; margin-top: 5px;">Turan Software</p>
                </div>
            </div>
        `;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Fotogram - Şifre Sıfırlama Talebi',
                message: 'Şifre sıfırlama linki e-postanıza gönderildi.', // Bu metin kullanılmaz HTML gönderildiği için
                html: passwordResetMailHtml,
            });

            res.status(200).json({ message: 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.' });
        } catch (emailError) {
            user.passwordResetToken = undefined; // Hata olursa token'ı temizle
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
    // 1) Token'ı hashle
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const { password, confirmPassword } = req.body;

    // 2) Kullanıcıyı token ve geçerlilik süresiyle bul
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
    });

    // 3) Token yoksa veya süresi dolmuşsa hata gönder
    if (!user) {
        return res.status(400).json({ message: 'Geçersiz veya süresi dolmuş şifre sıfırlama bağlantısı.' });
    }

    // 4) Şifre ve onay şifresi kontrolü
    if (!password || !confirmPassword) {
        return res.status(400).json({ message: 'Lütfen yeni şifre ve şifre onayını doldurun.' });
    }
    if (password !== confirmPassword) {
        return res.status(400).json({ message: 'Şifreler uyuşmuyor.' });
    }
    if (password.length < 6) {
        return res.status(400).json({ message: 'Şifre en az 6 karakter olmalıdır.' });
    }

    // 5) Şifreyi güncelle ve token alanlarını temizle
    user.password = password; // pre('save') hook'u bu şifreyi hashleyecektir.
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.passwordChangedAt = Date.now(); // Şifre değiştiği zamanı kaydet

    await user.save(); // password pre-save hook çalışacak

    res.status(200).json({ message: 'Şifreniz başarıyla sıfırlandı. Şimdi yeni şifrenizle giriş yapabilirsiniz.' });

    } catch (error) {
        console.error('Şifre sıfırlama hatası:', error);
        res.status(500).json({ message: 'Sunucu hatası: Şifre sıfırlama işlemi yapılamadı.' });
    }
};
