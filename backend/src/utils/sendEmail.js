// backend/src/utils/sendEmail.js

const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_PORT == 465 ? true : false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
    });

    const mailOptions = {
        from: `Fotogram Destek <${process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
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

    try {
        await transporter.sendMail(mailOptions);
        console.log('E-posta başarıyla gönderildi.');
    } catch (error) {
        console.error('E-posta gönderirken hata oluştu:', error);
        throw new Error('E-posta gönderilemedi.');
    }
};

module.exports = sendEmail;
