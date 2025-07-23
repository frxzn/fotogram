const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // 1. Transporter oluştur
    // Bu kısımda e-posta hizmeti sağlayıcının SMTP bilgilerini kullanacaksın.
    // Gmail kullanıyorsan, Gmail'in SMTP ayarlarını (veya App Password) kullanmalısın.
    // .env dosyasındaki EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS değişkenlerini kullanacak.
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT, // Gmail için 587 veya 465
        secure: process.env.EMAIL_PORT == 465 ? true : false, // Eğer port 465 ise true, 587 ise false (TLS için)
        auth: {
            user: process.env.EMAIL_USER, // Senin gönderici e-posta adresin
            pass: process.env.EMAIL_PASS // Senin e-posta şifren veya uygulama şifren (Gmail için)
        },
        // ignoreTLS: true, // Eğer TLS/SSL sorunları yaşarsan dene, genellikle gerekmez
    });

    // 2. E-posta seçeneklerini tanımla
    const mailOptions = {
        from: `Fotogram Destek <${process.env.EMAIL_USER}>`, // Kimden görünecek
        to: options.email, // Kime gidecek
        subject: options.subject, // E-posta konusu
        html: options.message, // E-posta içeriği (HTML formatında)
        // text: options.message, // Eğer sadece düz metin göndereceksen
    };

    // 3. E-postayı gönder
    try {
        await transporter.sendMail(mailOptions);
        console.log('E-posta başarıyla gönderildi.');
    } catch (error) {
        console.error('E-posta gönderirken hata oluştu:', error);
        throw new Error('E-posta gönderilemedi.'); // Hatanın yayılmasını sağla
    }
};

module.exports = sendEmail;
