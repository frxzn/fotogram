// backend/src/models/User.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // bcryptjs kullandığından emin ol

const userSchema = mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: { // Şifre alanının burada 'password' olarak tanımlandığından emin ol
            type: String,
            required: true,
        },
        // Diğer alanlar (isAdmin, profilePicture vb. varsa)
    },
    {
        timestamps: true, // createdAt, updatedAt otomatik ekler
    }
);

// Şifreyi kaydetmeden önce hashleme (PRE-SAVE HOOK)
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Kullanıcının girdiği şifreyi veritabanındaki hashlenmiş şifre ile karşılaştırma metodu
userSchema.methods.matchPassword = async function (enteredPassword) {
    // HATA BURADA: 'this.password' yani kullanıcının veritabanındaki şifresi undefined geliyor.
    // Bunun iki nedeni olabilir:
    // 1. Veritabanındaki şema tanımında 'password' alanı yok veya farklı isimde.
    // 2. Kullanıcı kaydolurken şifre hiç kaydedilmemiş veya boş kaydedilmiş.
    // 3. User modelini çağırdığında şifre alanını 'select: false' yaparak dışarıda bırakmış olabilirsin.

    // Aşağıdaki satırı kontrol et:
    return await bcrypt.compare(enteredPassword, this.password); // <-- BU SATIRDA HATA OLUŞUYOR

    // 'this.password' gerçekten kullanıcının hashlenmiş şifresi mi?
    // Eğer veritabanında şifre yoksa veya 'password' alanı farklı isimdeyse,
    // 'this.password' 'undefined' olur ve bcrypt.compare hata verir.
};

const User = mongoose.model('User', userSchema);

module.exports = User;
