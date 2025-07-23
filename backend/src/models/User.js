// backend/src/models/User.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // bcryptjs kütüphanesini kullandığından emin ol

// Kullanıcı şeması tanımı
const userSchema = mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, 'Kullanıcı adı gerekli'], // Hata mesajı eklendi
            unique: true,
            trim: true, // Baştaki ve sondaki boşlukları siler
            minlength: [3, 'Kullanıcı adı en az 3 karakter olmalı'],
            maxlength: [30, 'Kullanıcı adı en fazla 30 karakter olmalı'],
        },
        email: {
            type: String,
            required: [true, 'E-posta gerekli'],
            unique: true,
            lowercase: true, // E-postayı küçük harfe çevirir
            match: [/.+@.+\..+/, 'Geçerli bir e-posta adresi girin'], // E-posta formatı kontrolü
        },
        password: {
            type: String,
            required: [true, 'Şifre gerekli'],
            minlength: [6, 'Şifre en az 6 karakter olmalı'],
            // select: false, // <-- BU SATIRI YORUM SATIRI YAPTIK VEYA SİLDİK!
                              // Login sırasında şifreyi çekebilmek için bu varsayılan seçimi kapatmıyoruz.
                              // authController'da .select('+password') ile explicitly çekeceğiz.
        },
        profilePicture: {
            type: String,
            default: 'https://res.cloudinary.com/your_cloud_name/image/upload/v1/default_avatar.png', // Varsayılan profil resmi (ileride değişebilir)
        },
        // İleride eklenebilecek diğer alanlar:
        // bio: { type: String, maxlength: 160 },
        // followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        // following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    },
    {
        timestamps: true, // createdAt ve updatedAt alanlarını otomatik ekler
    }
);

// Middleware: Şifreyi veritabanına kaydetmeden önce hashleme (PRE-SAVE HOOK)
// Sadece şifre değiştirildiğinde veya yeni oluşturulduğunda çalışır
userSchema.pre('save', async function (next) {
    // Eğer şifre alanı değiştirilmediyse (yeni kullanıcı veya şifre güncellemesi değilse), sonraki middleware'e geç
    if (!this.isModified('password')) {
        next();
        return; // İşlemi burada sonlandır
    }

    try {
        // Şifreyi hashlemek için salt oluştur
        const salt = await bcrypt.genSalt(10); // 10, hash'in gücünü belirler

        // Şifreyi hashle ve 'this.password' alanına ata
        this.password = await bcrypt.hash(this.password, salt);
        next(); // Kaydetme işlemine devam et
    } catch (error) {
        // Hata oluşursa, sonraki hata işleyicisine gönder
        next(error);
    }
});

// Instance Method: Kullanıcının girdiği şifreyi veritabanındaki hashlenmiş şifre ile karşılaştırma
userSchema.methods.matchPassword = async function (enteredPassword) {
    // console.log("matchPassword metodunda this.password:", this.password); // Hata ayıklama için geçici log
    // console.log("matchPassword metodunda enteredPassword:", enteredPassword); // Hata ayıklama için geçici log

    if (!this.password) {
        // Eğer this.password undefined veya null ise, karşılaştırma yapamayız.
        // Bu durum, şifrenin veritabanından doğru çekilmediğini (select('+password') eksik)
        // veya kullanıcının şifresinin hiç kaydedilmediğini gösterir.
        console.error("matchPassword: Kullanıcının hashlenmiş şifresi bulunamadı (this.password undefined/null).");
        return false; // Şifre karşılaştırması başarısız sayılır
    }

    // bcrypt.compare fonksiyonunu kullanarak şifreleri karşılaştır
    // Bu, girdi şifresini hashler ve veritabanındaki hash ile eşleşip eşleşmediğini kontrol eder.
    return await bcrypt.compare(enteredPassword, this.password);
};

// Modeli oluştur ve dışa aktar
const User = mongoose.model('User', userSchema);

module.exports = User;
