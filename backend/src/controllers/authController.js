// backend/src/controllers/authController.js

const User = require('../models/User'); // User modelini import et
const jwt = require('jsonwebtoken');   // jsonwebtoken paketini kurduğundan emin ol
const sendEmail = require('../utils/sendEmail'); // Mail gönderme yardımcı fonksiyonu
const crypto = require('crypto'); // Node.js'in dahili modülü

// JWT Token Oluşturma Fonksiyonu
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '1h', // Token'ın geçerlilik süresi (örnek: 1 saat)
    });
};

// @desc    Yeni kullanıcı kaydetme işlemi
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    // Alanların dolu olup olmadığını kontrol et
    if (!username || !email || !password) { // Şifrenin dolu olduğundan emin oluyoruz
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
            // Kayıt başarılı ise kullanıcıya kayıt doğrulama/hoş geldin maili gönder
            try {
                // *** ÖNEMLİ: BURAYI GERÇEK BİR E-POSTA DOĞRULAMA TOKEN'I İLE GÜNCELLEMELİSİN ***
                // Örneğin:
                // const verificationToken = user.getVerificationToken(); // User modelinde bu metodu tanımlaman gerekecek
                // await user.save();
                // const verificationLink = `${process.env.FRONTEND_URL || 'https://fotogram-app.onrender.com'}/verify-email?token=${verificationToken}`;

                // Şimdilik test için varsayılan bir link kullanıyorum, bu link bir yere gitmeyecek!
                const verificationLink = `${process.env.FRONTEND_URL || 'https://fotogram-app.onrender.com'}/verify-email?token=GEÇİCİ_AKTİVASYON_TOKENİ`;


                const registrationMailHtml = `
                    <div style="font-family: 'Roboto', sans-serif; line-height: 1.6; color: #E0E0E0; background-color: #000000; padding: 20px; border-radius: 8px; max-width: 600px; margin: auto; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);">
                        <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #333333;">
                            <h1 style="color: #FFFFFF; font-size: 2.5em; margin: 0; letter-spacing: -1px;">Fotogram</h1>
                        </div>
                        <div style="padding: 30px 20px; background-color: #1A1A1A;">
                            <p style="margin-bottom: 15px; color: #CCCCCC;">Merhaba,</p>
                            <p style="margin-bottom: 15px; color: #CCCCCC;">Fotogram hesabınızı oluşturma talebinizi aldık. Kayıt işlemini tamamlamak için lütfen aşağıdaki butona tıklayın:</p>
                            
                            <p style="text-align: center; margin: 30px 0;">
                                <a href="${verificationLink}" 
                                   style="display: inline-block; padding: 12px 25px; background-color: #FFFFFF; color: #000000; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 1.1em; transition: background-color 0.3s ease; border: 2px solid #FFFFFF;">
                                   Kaydı Tamamla
                                </a>
                            </p>
                            <p style="text-align: center; margin-top: 15px; font-size: 0.9em; color: #999999;">
                                Eğer yukarıdaki buton çalışmıyorsa, lütfen aşağıdaki bağlantıyı kopyalayıp tarayıcınızın adres çubuğuna yapıştırın:<br>
                                <a href="${verificationLink}" style="word-break: break-all; color: #B3B3B3; text-decoration: underline;">${verificationLink}</a>
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

                await sendEmail({
                    email: user.email,
                    subject: 'Fotogram Hesabınızı Doğrulayın',
                    message: 'Kaydı tamamlamak için lütfen aşağıdaki butona tıklayın.',
                    html: registrationMailHtml,
                });
                console.log(`Kayıt doğrulama maili ${user.email} adresine gönderildi.`);
            } catch (mailError) {
                console.error(`Kayıt doğrulama maili gönderme hatası (${user.email}):`, mailError);
            }

            res.status(201).json({
                message: 'Kayıt başarılı! Hesabınızı doğrulamak için lütfen e-postanızı kontrol edin.'
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
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({ message: 'E-posta veya şifre hatalı.' });
        }

        const isMatch = await user.matchPassword(password);

        if (user && isMatch) {
            res.json({
                message: 'Giriş Başarılı!',
                token: generateToken(user._id),
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    profilePicture: user.profilePicture,
                },
            });
        } else {
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
            return res.status(200).json({ message: 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi (varsa).' });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 dakika

        await user.save({ validateBeforeSave: false });

        const resetURL = `${process.env.FRONTEND_URL || 'https://fotogram-app.onrender.com'}/reset-password?token=${resetToken}`;

        const message = `Şifreni sıfırlamak için aşağıdaki butona tıklayabilirsin. Bu link 10 dakika içinde geçerliliğini yitirecektir. Eğer bu isteği sen yapmadıysan, lütfen bu e-postayı dikkate alma.`;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Şifre Sıfırlama Talebi',
                message,
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
const resetPassword = async (req, res) => {
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

        await user.save();

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
