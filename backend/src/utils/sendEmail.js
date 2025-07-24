// backend/src/utils/sendEmail.js

const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT, 10),
        secure: process.env.EMAIL_PORT == 465 ? true : false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    const defaultGeneralHtmlTemplate = `
        <div style="font-family: 'Roboto', sans-serif; line-height: 1.6; color: #E0E0E0; background-color: #000000; padding: 20px; border-radius: 8px; max-width: 600px; margin: auto; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);">
            <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #333333;">
                <h1 style="color: #FFFFFF; font-size: 2.5em; margin: 0; letter-spacing: -1px;">Fotogram</h1>
            </div>
            <div style="padding: 30px 20px; background-color: #1A1A1A;">
                <h2 style="color: #FFFFFF; font-size: 1.8em; margin-bottom: 20px; text-align: center;">${options.subject}</h2>
                
                <p style="margin-bottom: 15px; color: #CCCCCC;">${options.message.replace(/\n/g, '<br>')}</p>
                
                ${options.actionButton ? `
                    <p style="text-align: center; margin: 30px 0;">
                        <a href="${options.actionButton.link}" 
                           style="display: inline-block; padding: 12px 25px; background-color: #FFFFFF; color: #000000; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 1.1em; transition: background-color 0.3s ease; border: 2px solid #FFFFFF;">
                           ${options.actionButton.text}
                        </a>
                    </p>
                    <p style="text-align: center; margin-top: 15px; font-size: 0.9em; color: #999999;">
                        Eğer yukarıdaki buton çalışmıyorsa, lütfen aşağıdaki bağlantıyı kopyalayıp tarayıcınızın adres çubuğuna yapıştırın:<br>
                        <a href="${options.actionButton.link}" style="word-break: break-all; color: #B3B3B3; text-decoration: underline;">${options.actionButton.link}</a>
                    </p>
                ` : ''}

                <p style="margin-top: 25px; font-size: 0.9em; color: #B3B3B3;">
                    Bu e-posta otomatik olarak gönderilmiştir. Lütfen bu e-postaya yanıt vermeyin.
                </p>
                <p style="margin-top: 15px; color: #CCCCCC;">Teşekkürler,<br>Fotogram Ekibi</p>
            </div>
            <div style="background-color: #000000; padding: 15px 20px; text-align: center; font-size: 0.85em; color: #B3B3B3; border-top: 1px solid #333333;">
                <p>&copy; ${new Date().getFullYear()} Fotogram. Tüm Hakları Saklıdır.</p>
                <p style="color: #FFFFFF; font-weight: 500; margin-top: 5px;">Turan Software</p>
            </div>
        </div>
    `;

    const mailOptions = {
        from: `Fotogram Destek <${process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html || defaultGeneralHtmlTemplate,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`E-posta başarıyla gönderildi: ${options.email}`);
    } catch (error) {
        console.error('E-posta gönderirken hata oluştu:', error);
        if (error.response) {
            console.error('SMTP Sunucu Yanıtı (Response):', error.response);
            if (error.response.body) {
                console.error('SMTP Sunucu Yanıtı (Body):', error.response.body);
            }
        } else if (error.code) {
            console.error('Nodemailer Hata Kodu:', error.code);
        }
        throw new Error('E-posta gönderilemedi. Lütfen sunucu loglarını ve SMTP ayarlarınızı kontrol edin.');
    }
};

module.exports = sendEmail;
