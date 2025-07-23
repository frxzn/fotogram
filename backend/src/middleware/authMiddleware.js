const jwt = require('jsonwebtoken');

exports.protect = (req, res, next) => {
    // Tokenı header'dan al
    const token = req.header('x-auth-token');

    // Token yoksa
    if (!token) {
        return res.status(401).json({ message: 'Yetkilendirme reddedildi, token bulunamadı.' });
    }

    // Tokenı doğrula
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user; // Tokenın içindeki kullanıcı bilgisini req.user'a ata
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token geçersiz.' });
    }
};

exports.authorizeAdmin = (req, res, next) => {
    if (!req.user || !req.user.isAdmin) {
        return res.status(403).json({ message: 'Erişim reddedildi, yönetici yetkisi gerekli.' });
    }
    next();
};
