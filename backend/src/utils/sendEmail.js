// backend/src/utils/sendEmail.js

const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // 1. E-posta göndermek için bir taşıyıcı (transporter) oluştur
    // Bu, e-postaları göndermek için SMTP sunucusu bilgilerini içerir.
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST, // Ortam değişkenlerinden e-posta sunucusunun adresi
        port: process.env.EMAIL_PORT, // Ortam değişkenlerinden e-posta sunucusunun portu
        // Eğer port 465 ise güvenli bağlantı (SSL/TLS) kullan, değilse kullanma
        secure: process.env.EMAIL_PORT == 465 ? true : false,
        auth: {
            user: process.env.EMAIL_USER, // Ortam değişkenlerinden e-posta kullanıcı adı
            pass: process.env.EMAIL_PASS // Ortam değişkenlerinden e-posta şifresi
        },
        // Güvenlik ayarları: Eğer SSL sertifikası self-signed ise veya doğrulanmamışsa
        // rejectUnauthorized'ı false yapabiliriz. Ancak üretimde true olması önerilir.
        // TLS protokolü ayarları (Gmail için gerekli olabilir)
        tls: {
            rejectUnauthorized: false
        }
    });

    // 2. E-posta içeriği ve seçeneklerini tanımla
    // 'options' objesi, e-posta alıcısı, konu ve mesaj/link bilgilerini taşır.
    const mailOptions = {
        from: `Fotogram Destek <${process.env.EMAIL_USER}>`, // E-postayı gönderen kişi/adres
        to: options.email, // E-postanın gönderileceği alıcı adresi
        subject: options.subject, // E-postanın konusu
        // E-postanın HTML içeriği. Bu kısım, e-postayı daha görsel hale getirir.
        // options.message değişkeni, aslında kayıt linkinin kendisini içerir.
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="background-color: #f7f7f7; padding: 20px; text-align: center;">
                    <h1 style="color: #6200EE;">Fotogram'a Hoş Geldiniz!</h1>
                </div>
                <div style="padding: 20px; background-color: #ffffff;">
                    <p>Merhaba,</p>
                    <p>Fotogram hesabınızı oluşturma talebinizi aldık. Kayıt işlemini tamamlamak için lütfen aşağıdaki butona tıklayın:</p>
                    <p style="text-align: center; margin: 30px 0;">
                        <a href="${options.message}" style="background-color: #6200EE; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-size: 16px; display: inline-block;">
                            Kaydı Tamamla
                        </a>
                    </p>
                    <p>Eğer yukarıdaki buton çalışmıyorsa, lütfen aşağıdaki bağlantıyı kopyalayıp tarayıcınızın adres çubuğuna yapıştırın:</p>
                    <p style="word-break: break-all;"><a href="${options.message}">${options.message}</a></p>
                    <p>Bu e-posta size gönderilen kayıt bağlantısıdır. Eğer bu talebi siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.</p>
                    <p>Teşekkürler,<br>Fotogram Ekibi</p>
                </div>
                <div style="background-color: #f7f7f7; padding: 15px; text-align: center; font-size: 12px; color: #777;">
                    <p>&copy; ${new Date().getFullYear()} Fotogram. Tüm hakları saklıdır.</p>
                </div>
            </div>
        `,
    };

    // 3. E-postayı gönder
    try {
        await transporter.sendMail(mailOptions);
        console.log('E-posta başarıyla gönderildi.');
    } catch (error) {
        // E-posta gönderirken bir hata oluşursa konsola yazdır ve hata fırlat
        console.error('E-posta gönderirken hata oluştu:', error);
        throw new Error('E-posta gönderilemedi. Lütfen sunucu loglarını kontrol edin.');
    }
};

module.exports = sendEmail;
