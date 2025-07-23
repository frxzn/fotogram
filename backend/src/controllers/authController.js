const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail', // Veya kullandığınız SMTP servisi
    auth: {
        user: process.env.NODE_MAILER_EMAIL,
        pass: process.env.NODE_MAILER_PASSWORD
    }
});

// Kayıt İsteği (E-posta doğrulama linki gönder)
exports.requestRegister = async (req, res) => {
    const { email } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user && user.isVerified) {
            return res.status(400).json({ message: 'Bu e-posta adresi zaten kayıtlı ve doğrulanmış.' });
        }
        if (user && !user.isVerified) {
            // Mevcut doğrulanmamış kullanıcı varsa tokenı güncelle
            user.verificationToken = crypto.randomBytes(32).toString('hex');
            user.verificationTokenExpires = Date.now() + 3 * 60 * 1000; // 3 dakika
            await user.save();
        } else {
            // Yeni kullanıcı oluştur
            user = new User({ email });
            user.verificationToken = crypto.randomBytes(32).toString('hex');
            user.verificationTokenExpires = Date.now() + 3 * 60 * 1000; // 3 dakika
            await user.save();
        }

        const verificationUrl = `${process.env.BASE_URL}/?token=${user.verificationToken}`;

        const mailOptions = {
            from: process.env.NODE_MAILER_EMAIL,
            to: email,
            subject: 'Fotogram Hesap Doğrulama',
            html: `
                <p>Fotogram hesabınızı doğrulamak için aşağıdaki bağlantıya tıklayın:</p>
                <p><a href="${verificationUrl}">${verificationUrl}</a></p>
                <p>Bu bağlantı 3 dakika içinde geçerliliğini yitirecektir.</p>
                <p>Eğer bu işlemi siz yapmadıysanız, bu e-postayı dikkate almayın.</p>
            `
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Doğrulama linki e-posta adresinize gönderildi.' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Sunucu hatası.' });
    }
};

// Kaydı Tamamla (Kullanıcı adı ve şifre oluştur)
exports.completeRegister = async (req, res) => {
    const { token, username, password } = req.body;
    try {
        const user = await User.findOne({
            verificationToken: token,
            verificationTokenExpires: { $gt: Date.now() } // Token süresi geçmemiş olmalı
        });

        if (!user) {
            return res.status(400).json({ message: 'Geçersiz veya süresi dolmuş doğrulama linki.' });
        }

        // Kullanıcı adı daha önce alınmış mı kontrol et
        const existingUser = await User.findOne({ username });
        if (existingUser && existingUser._id.toString() !== user._id.toString()) {
            return res.status(400).json({ message: 'Bu kullanıcı adı zaten alınmış.' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.username = username;
        user.isVerified = true;
        user.verificationToken = undefined; // Tokenı temizle
        user.verificationTokenExpires = undefined; // Süreyi temizle

        await user.save();
        res.status(200).json({ message: 'Kaydınız başarıyla tamamlandı, şimdi giriş yapabilirsiniz.' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Sunucu hatası.' });
    }
};

// Giriş Yap
exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Geçersiz kimlik bilgileri.' });
        }

        if (!user.isVerified) {
            return res.status(401).json({ message: 'Hesabınız doğrulanmamış. Lütfen e-postanızı kontrol edin.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Geçersiz kimlik bilgileri.' });
        }

        const payload = {
            user: {
                id: user.id,
                username: user.username,
                isAdmin: user.isAdmin
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1h' }, // Token 1 saat geçerli
            (err, token) => {
                if (err) throw err;
                res.json({ token, username: user.username, isAdmin: user.isAdmin });
            }
        );

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Sunucu hatası.' });
    }
};

// Şifre Sıfırlama İsteği
exports.requestPasswordReset = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'Bu e-posta adresiyle ilişkili bir kullanıcı bulunamadı.' });
        }

        user.passwordResetToken = crypto.randomBytes(32).toString('hex');
        user.passwordResetExpires = Date.now() + 3 * 60 * 1000; // 3 dakika
        await user.save();

        const resetUrl = `${process.env.BASE_URL}/?resetToken=${user.passwordResetToken}`;

        const mailOptions = {
            from: process.env.NODE_MAILER_EMAIL,
            to: email,
            subject: 'Fotogram Şifre Sıfırlama',
            html: `
                <p>Şifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın:</p>
                <p><a href="${resetUrl}">${resetUrl}</a></p>
                <p>Bu bağlantı 3 dakika içinde geçerliliğini yitirecektir.</p>
                <p>Eğer bu işlemi siz yapmadıysanız, bu e-postayı dikkate almayın.</p>
            `
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Şifre sıfırlama linki e-posta adresinize gönderildi.' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Sunucu hatası.' });
    }
};

// Şifre Sıfırla
exports.resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;
    try {
        const user = await User.findOne({
            passwordResetToken: token,
            passwordResetExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Geçersiz veya süresi dolmuş şifre sıfırlama linki.' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;

        await user.save();
        res.status(200).json({ message: 'Şifreniz başarıyla sıfırlandı, şimdi giriş yapabilirsiniz.' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Sunucu hatası.' });
    }
};
