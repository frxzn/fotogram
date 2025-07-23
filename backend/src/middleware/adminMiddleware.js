const User = require('../models/User'); // Gerekirse kullanıcı modeline erişim için

exports.authorizeAdmin = (req, res, next) => {
    // req.user objesi, authMiddleware.js tarafından JWT tokenından çözülerek eklenir.
    // Bu objenin içinde kullanıcının id'si ve isAdmin durumu olmalı.
    if (!req.user || !req.user.isAdmin) {
        return res.status(403).json({ message: 'Erişim reddedildi, yönetici yetkisi gerekli.' });
    }
    next(); // Yönetici ise devam et
};

// İstersen burada başka admin spesifik middleware'ler de tanımlayabilirsin.
// Örneğin, belirli bir kullanıcının ID'sini kontrol etmek gibi.
