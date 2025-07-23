// frontend/public/js/auth.js

// API URL'i ve modal elementleri
const API_URL = 'https://fotogram-backend.onrender.com/api'; // Backend API URL'in
const authModal = document.getElementById('authModal'); // main.html'deki modal div'i
const authFormContainer = document.getElementById('authFormContainer'); // Modal içeriğini tutan div

// Mesajları göstermek için yardımcı fonksiyon
function displayMessage(elementId, message, type = 'error') {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.className = `message ${type}`; // 'success' veya 'error' class'ı ekler
        element.style.display = 'block';
    }
}

// Modalı açma/kapama
function openModal() {
    authModal.style.display = 'block';
    console.log('Frontend Log: Modal açıldı.');

    const currentCloseButton = authModal.querySelector('.close-button');
    if (currentCloseButton) {
        currentCloseButton.onclick = closeModal;
    }
}

function closeModal() {
    authModal.style.display = 'none';
    authFormContainer.innerHTML = ''; // Modalı kapatırken içeriği temizle
    console.log('Frontend Log: Modal kapatıldı.');

    if (window.location.search) {
        const url = new URL(window.location.href);
        url.search = ''; // URL'deki tüm query parametrelerini sil
        window.history.pushState({}, '', url.toString()); // URL'i temizlenmiş haliyle değiştir
        console.log('Frontend Log: URL parametreleri temizlendi.');
    }
}

// Kayıt Formu - Adım 1 (E-posta ile kayıt)
function loadRegisterForm() {
    console.log('Frontend Log: Kayıt formu yüklendi.');
    openModal(); // Kayıt formunu yüklerken modali aç
    authFormContainer.innerHTML = `
        <button class="close-button">&times;</button>
        <h2>Kayıt Ol</h2>
        <form id="registerFormEmail">
            <div class="form-group">
                <label for="registerEmail">E-posta</label>
                <input type="email" id="registerEmail" placeholder="E-posta adresinizi girin" required>
            </div>
            <button type="submit" class="btn primary-btn">Kaydol</button>
            <div id="registerEmailMessage" class="message"></div>
        </form>
        <p>Zaten hesabın var mı? <a href="#" id="showLoginForm">Giriş Yap</a></p>
    `;

    authModal.querySelector('.close-button').onclick = closeModal;

    document.getElementById('registerFormEmail').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('registerEmail').value;
        console.log(`Frontend Log: Kayıt için API isteği başlatılıyor. E-posta: ${email}`);
        try {
            const res = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            console.log(`Frontend Log: API yanıtı alındı. Durum kodu: ${res.status}`);
            const data = await res.json();
            if (res.ok) {
                console.log('Frontend Log: Kayıt başarılı yanıtı.');
                displayMessage('registerEmailMessage', data.message, 'success');
                authFormContainer.innerHTML = `
                    <button class="close-button">&times;</button>
                    <h2>E-posta Gönderildi!</h2>
                    <p>${data.message || 'Lütfen kaydı tamamlamak için e-posta adresinize gönderdiğimiz bağlantıya tıklayın.'}</p>
                `;
                authModal.querySelector('.close-button').onclick = closeModal;

            } else {
                console.error(`Frontend Log: Kayıt hatası. Mesaj: ${data.message || 'Bilinmeyen hata.'}`);
                displayMessage('registerEmailMessage', data.message || 'Kayıt sırasında bir hata oluştu.');
            }
        } catch (error) {
            console.error('Frontend Log: Sunucuya bağlanılamadı veya ağ hatası:', error);
            displayMessage('registerEmailMessage', 'Sunucuya bağlanılamadı. Lütfen ağ bağlantınızı kontrol edin veya daha sonra tekrar deneyin.');
        }
    });

    document.getElementById('showLoginForm').addEventListener('click', (e) => {
        e.preventDefault();
        loadLoginForm();
    });
}

// Kaydı Tamamlama Formu (E-posta'dan gelen link ile tetiklenir)
function loadCompleteRegisterForm(token) {
    console.log('Frontend Log: Kaydı tamamlama formu yükleniyor. Token:', token);
    openModal();
    authFormContainer.innerHTML = `
        <button class="close-button">&times;</button>
        <h2>Kaydı Tamamla</h2>
        <form id="completeRegisterForm">
            <input type="hidden" id="registerCompleteToken" value="${token}">
            <div class="form-group">
                <label for="registerUsername">Kullanıcı Adı</label>
                <input type="text" id="registerUsername" placeholder="Kullanıcı adınızı girin" required>
            </div>
            <div class="form-group">
                <label for="registerPassword">Şifre</label>
                <input type="password" id="registerPassword" placeholder="Şifrenizi girin" required>
            </div>
            <div class="form-group">
                <label for="confirmPassword">Şifre Tekrar</label>
                <input type="password" id="confirmPassword" placeholder="Şifrenizi tekrar girin" required>
            </div>
            <button type="submit" class="btn primary-btn">Kaydı Tamamla</button>
            <div id="completeRegisterMessage" class="message"></div>
        </form>
    `;
    authModal.querySelector('.close-button').onclick = closeModal;


    document.getElementById('completeRegisterForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('registerUsername').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const registerCompleteToken = document.getElementById('registerCompleteToken').value;

        if (password !== confirmPassword) {
            displayMessage('completeRegisterMessage', 'Şifreler eşleşmiyor.');
            console.error('Frontend Log: Şifreler eşleşmiyor.');
            return;
        }

        console.log(`Frontend Log: Kaydı tamamlama API isteği başlatılıyor. Kullanıcı Adı: ${username}`);
        try {
            const res = await fetch(`${API_URL}/auth/complete-register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${registerCompleteToken}`
                },
                body: JSON.stringify({ username, password })
            });
            console.log(`Frontend Log: API yanıtı alındı. Durum kodu: ${res.status}`);
            const data = await res.json();
            if (res.ok) {
                console.log('Frontend Log: Kayıt tamamlama başarılı.');
                displayMessage('completeRegisterMessage', data.message || 'Kaydınız başarıyla tamamlandı. Şimdi giriş yapabilirsiniz!', 'success');
                setTimeout(() => {
                    closeModal();
                    loadLoginForm();
                }, 2000);
            } else {
                console.error(`Frontend Log: Kayıt tamamlama hatası. Mesaj: ${data.message || 'Bilinmeyen hata.'}`);
                displayMessage('completeRegisterMessage', data.message || 'Kayıt tamamlama sırasında bir hata oluştu.');
            }
        } catch (error) {
            console.error('Frontend Log: Kayıt tamamlama sunucusuna bağlanılamadı veya ağ hatası:', error);
            displayMessage('completeRegisterMessage', 'Kayıt tamamlama sunucusuna bağlanılamadı. Lütfen ağ bağlantınızı kontrol edin veya daha sonra tekrar deneyin.');
        }
    });
}

// Giriş Formu
function loadLoginForm() {
    console.log('Frontend Log: Giriş formu yüklendi.');
    openModal();
    authFormContainer.innerHTML = `
        <button class="close-button">&times;</button>
        <h2>Giriş Yap</h2>
        <form id="loginForm">
            <div class="form-group">
                <label for="loginEmail">E-posta</label>
                <input type="email" id="loginEmail" placeholder="E-posta adresinizi girin" required>
            </div>
            <div class="form-group">
                <label for="loginPassword">Şifre</label>
                <input type="password" id="loginPassword" placeholder="Şifrenizi girin" required>
            </div>
            <button type="submit" class="btn primary-btn">Giriş Yap</button>
            <div id="loginMessage" class="message"></div>
        </form>
        <p><a href="#" id="showRegisterForm">Kayıt Ol</a> | <a href="#" id="showForgotPasswordForm">Şifremi Unuttum</a></p>
    `;
    authModal.querySelector('.close-button').onclick = closeModal;

    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        console.log(`Frontend Log: Giriş için API isteği başlatılıyor. E-posta: ${email}`);
        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            console.log(`Frontend Log: API yanıtı alındı. Durum kodu: ${res.status}`);
            const data = await res.json();
            if (res.ok) {
                console.log('Frontend Log: Giriş başarılı yanıtı.');
                displayMessage('loginMessage', data.message, 'success');
                localStorage.setItem('token', data.token);
                window.location.href = '/dashboard.html';
            } else {
                console.error(`Frontend Log: Giriş hatası. Mesaj: ${data.message || 'Bilinmeyen hata.'}`);
                displayMessage('loginMessage', data.message || 'Giriş başarısız. Lütfen e-posta ve şifrenizi kontrol edin.');
            }
        } catch (error) {
            console.error('Frontend Log: Sunucuya bağlanılamadı veya ağ hatası:', error);
            displayMessage('loginMessage', 'Sunucuya bağlanılamadı. Lütfen ağ bağlantınızı kontrol edin veya daha sonra tekrar deneyin.');
        }
    });

    document.getElementById('showRegisterForm').addEventListener('click', (e) => {
        e.preventDefault();
        loadRegisterForm();
    });

    document.getElementById('showForgotPasswordForm').addEventListener('click', (e) => {
        e.preventDefault();
        loadForgotPasswordForm();
    });
}

// Şifremi Unuttum Formu
function loadForgotPasswordForm() {
    console.log('Frontend Log: Şifremi unuttum formu yüklendi.');
    openModal();
    authFormContainer.innerHTML = `
        <button class="close-button">&times;</button>
        <h2>Şifremi Unuttum</h2>
        <form id="forgotPasswordForm">
            <div class="form-group">
                <label for="forgotEmail">E-posta</label>
                <input type="email" id="forgotEmail" placeholder="E-posta adresinizi girin" required>
            </div>
            <button type="submit" class="btn primary-btn">Şifre Sıfırlama Bağlantısı Gönder</button>
            <div id="forgotPasswordMessage" class="message"></div>
        </form>
        <p><a href="#" id="showLoginFormFromForgot">Giriş Yap</a></p>
    `;
    authModal.querySelector('.close-button').onclick = closeModal;

    document.getElementById('forgotPasswordForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('forgotEmail').value;
        console.log(`Frontend Log: Şifre sıfırlama API isteği başlatılıyor. E-posta: ${email}`);
        try {
            const res = await fetch(`${API_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            console.log(`Frontend Log: API yanıtı alındı. Durum kodu: ${res.status}`);
            const data = await res.json();
            if (res.ok) {
                console.log('Frontend Log: Şifre sıfırlama e-postası başarıyla gönderildi.');
                displayMessage('forgotPasswordMessage', data.message, 'success');
            } else {
                console.error(`Frontend Log: Şifre sıfırlama hatası. Mesaj: ${data.message || 'Bilinmeyen hata.'}`);
                displayMessage('forgotPasswordMessage', data.message || 'Şifre sıfırlama sırasında bir hata oluştu.');
            }
        } catch (error) {
            console.error('Frontend Log: Şifre sıfırlama sunucusuna bağlanılamadı veya ağ hatası:', error);
            displayMessage('forgotPasswordMessage', 'Şifre sıfırlama sunucusuna bağlanılamadı. Lütfen ağ bağlantınızı kontrol edin veya daha sonra tekrar deneyin.');
        }
    });

    document.getElementById('showLoginFormFromForgot').addEventListener('click', (e) => {
        e.preventDefault();
        loadLoginForm();
    });
}

// Şifre Sıfırlama Formu (E-posta'dan gelen link ile tetiklenir)
function loadResetPasswordForm(token) {
    console.log('Frontend Log: Şifre sıfırlama formu yükleniyor. Token:', token);
    openModal();
    authFormContainer.innerHTML = `
        <button class="close-button">&times;</button>
        <h2>Şifreyi Sıfırla</h2>
        <form id="resetPasswordForm">
            <input type="hidden" id="resetPasswordToken" value="${token}">
            <div class="form-group">
                <label for="newPassword">Yeni Şifre</label>
                <input type="password" id="newPassword" placeholder="Yeni şifrenizi girin" required>
            </div>
            <div class="form-group">
                <label for="confirmNewPassword">Yeni Şifre Tekrar</label>
                <input type="password" id="confirmNewPassword" placeholder="Yeni şifrenizi tekrar girin" required>
            </div>
            <button type="submit" class="btn primary-btn">Şifreyi Sıfırla</button>
            <div id="resetPasswordMessage" class="message"></div>
        </form>
    `;
    authModal.querySelector('.close-button').onclick = closeModal;


    document.getElementById('resetPasswordForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const newPassword = document.getElementById('newPassword').value;
        const confirmNewPassword = document.getElementById('confirmNewPassword').value;
        const resetPasswordToken = document.getElementById('resetPasswordToken').value;

        if (newPassword !== confirmNewPassword) {
            displayMessage('resetPasswordMessage', 'Şifreler eşleşmiyor.');
            console.error('Frontend Log: Şifreler eşleşmiyor.');
            return;
        }

        console.log('Frontend Log: Şifre sıfırlama API isteği başlatılıyor.');
        try {
            const res = await fetch(`${API_URL}/auth/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${resetPasswordToken}`
                },
                body: JSON.stringify({ password: newPassword })
            });
            console.log(`Frontend Log: API yanıtı alındı. Durum kodu: ${res.status}`);
            const data = await res.json();
            if (res.ok) {
                console.log('Frontend Log: Şifre sıfırlama başarılı.');
                displayMessage('resetPasswordMessage', data.message || 'Şifreniz başarıyla sıfırlandı. Şimdi giriş yapabilirsiniz!', 'success');
                setTimeout(() => {
                    closeModal();
                    loadLoginForm();
                }, 2000);
            } else {
                console.error(`Frontend Log: Şifre sıfırlama hatası. Mesaj: ${data.message || 'Bilinmeyen hata.'}`);
                displayMessage('resetPasswordMessage', data.message || 'Şifre sıfırlama sırasında bir hata oluştu.');
            }
        } catch (error) {
            console.error('Frontend Log: Şifre sıfırlama sunucusuna bağlanılamadı veya ağ hatası:', error);
            displayMessage('resetPasswordMessage', 'Şifre sıfırlama sunucusuna bağlanılamadı. Lütfen ağ bağlantınızı kontrol edin veya daha sonra tekrar deneyin.');
        }
    });
}


window.loadRegisterForm = loadRegisterForm;
window.loadLoginForm = loadLoginForm;


window.addEventListener('load', () => {
    console.log('Frontend Log: Sayfa yüklendi, URL parametreleri kontrol ediliyor.');
    const params = new URLSearchParams(window.location.search);
    const registerToken = params.get('registerToken');
    const resetToken = params.get('resetToken');

    console.log('Frontend Log: registerToken değeri:', registerToken);
    console.log('Frontend Log: resetToken değeri:', resetToken);

    if (registerToken) {
        console.log('Frontend Log: registerToken bulundu. Kayıt tamamlama formu yükleniyor.');
        loadCompleteRegisterForm(registerToken);
    } else if (resetToken) {
        console.log('Frontend Log: resetToken bulundu. Şifre sıfırlama formu yükleniyor.');
        loadResetPasswordForm(resetToken);
    } else {
        console.log('Frontend Log: URL\'de registerToken veya resetToken bulunamadı.');
    }
});

window.addEventListener('click', (event) => {
    if (event.target === authModal) {
        closeModal();
    }
});
