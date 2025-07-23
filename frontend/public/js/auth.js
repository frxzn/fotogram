// frontend/public/js/auth.js

const API_URL = 'https://fotogram-backend.onrender.com/api'; // Backend API URL'in
const authModal = document.getElementById('authModal');
const authFormContainer = document.getElementById('authFormContainer');
const closeModalButton = authModal.querySelector('.close-button');

// Mesajları göstermek için yardımcı fonksiyon
function displayMessage(elementId, message, type = 'error') {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.className = `message ${type}`;
        element.style.display = 'block';
    }
}

// Modalı açma/kapama
function openModal() {
    authModal.style.display = 'block';
}

function closeModal() {
    authModal.style.display = 'none';
    authFormContainer.innerHTML = ''; // Modalı kapatırken içeriği temizle
}

// Kayıt Formu - Adım 1 (E-posta ile kayıt)
function loadRegisterForm() {
    authFormContainer.innerHTML = `
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

    document.getElementById('registerFormEmail').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('registerEmail').value;
        try {
            const res = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            if (res.ok) {
                displayMessage('registerEmailMessage', data.message, 'success');
                authFormContainer.innerHTML = `
                    <h2>E-posta Gönderildi!</h2>
                    <p>${data.message || 'Lütfen kaydı tamamlamak için e-posta adresinize gönderdiğimiz bağlantıya tıklayın.'}</p>
                `;
            } else {
                displayMessage('registerEmailMessage', data.message || 'Kayıt sırasında bir hata oluştu.');
            }
        } catch (error) {
            console.error('Kayıt hatası:', error);
            displayMessage('registerEmailMessage', 'Sunucuya bağlanılamadı.');
        }
    });

    document.getElementById('showLoginForm').addEventListener('click', (e) => {
        e.preventDefault();
        loadLoginForm();
    });
}

// Kayıt Formu - Adım 2 (Doğrulama tokeni ile kaydı tamamlama)
function loadCompleteRegisterForm(token) {
    authFormContainer.innerHTML = `
        <h2>Kaydı Tamamla</h2>
        <form id="completeRegisterForm">
            <div class="form-group">
                <label for="registerUsername">Kullanıcı Adı</label>
                <input type="text" id="registerUsername" placeholder="Kullanıcı adınızı girin" required>
            </div>
            <div class="form-group">
                <label for="registerPassword">Şifre</label>
                <input type="password" id="registerPassword" placeholder="Şifrenizi girin" required>
            </div>
            <div class="form-group">
                <label for="registerConfirmPassword">Şifre Tekrar</label>
                <input type="password" id="registerConfirmPassword" placeholder="Şifrenizi tekrar girin" required>
            </div>
            <button type="submit" class="btn primary-btn">Kaydı Tamamla</button>
            <div id="completeRegisterMessage" class="message"></div>
        </form>
    `;

    document.getElementById('completeRegisterForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('registerUsername').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;

        if (password !== confirmPassword) {
            displayMessage('completeRegisterMessage', 'Şifreler uyuşmuyor.');
            return;
        }

        try {
            const res = await fetch(`${API_URL}/auth/register/complete/${token}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();
            if (res.ok) {
                displayMessage('completeRegisterMessage', data.message, 'success');
                // Kayıt başarılıysa giriş formuna yönlendir
                setTimeout(() => {
                    loadLoginForm();
                }, 2000);
            } else {
                displayMessage('completeRegisterMessage', data.message || 'Kaydı tamamlama sırasında bir hata oluştu.');
            }
        } catch (error) {
            console.error('Kaydı tamamlama hatası:', error);
            displayMessage('completeRegisterMessage', 'Sunucuya bağlanılamadı.');
        }
    });
}

// Giriş Formu
function loadLoginForm() {
    authFormContainer.innerHTML = `
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

    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (res.ok) {
                displayMessage('loginMessage', data.message, 'success');
                localStorage.setItem('token', data.token); // Token'ı kaydet
                // Başarılı giriş sonrası yönlendirme
                window.location.href = '/dashboard.html'; // Örnek olarak dashboard.html'e yönlendir
            } else {
                displayMessage('loginMessage', data.message || 'Giriş başarısız.');
            }
        } catch (error) {
            console.error('Giriş hatası:', error);
            displayMessage('loginMessage', 'Sunucuya bağlanılamadı.');
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
    authFormContainer.innerHTML = `
        <h2>Şifremi Unuttum</h2>
        <form id="forgotPasswordForm">
            <div class="form-group">
                <label for="forgotEmail">E-posta</label>
                <input type="email" id="forgotEmail" placeholder="Kayıtlı e-posta adresinizi girin" required>
            </div>
            <button type="submit" class="btn primary-btn">Şifremi Sıfırla</button>
            <div id="forgotPasswordMessage" class="message"></div>
        </form>
        <p><a href="#" id="backToLogin">Giriş Yap'a Geri Dön</a></p>
    `;

    document.getElementById('forgotPasswordForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('forgotEmail').value;
        try {
            const res = await fetch(`${API_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            if (res.ok) {
                displayMessage('forgotPasswordMessage', data.message, 'success');
                authFormContainer.innerHTML = `
                    <h2>E-posta Gönderildi!</h2>
                    <p>${data.message || 'Lütfen şifrenizi sıfırlamak için e-posta adresinize gönderdiğimiz bağlantıya tıklayın.'}</p>
                `;
            } else {
                displayMessage('forgotPasswordMessage', data.message || 'Şifre sıfırlama sırasında bir hata oluştu.');
            }
        } catch (error) {
            console.error('Şifre sıfırlama hatası:', error);
            displayMessage('forgotPasswordMessage', 'Sunucuya bağlanılamadı.');
        }
    });

    document.getElementById('backToLogin').addEventListener('click', (e) => {
        e.preventDefault();
        loadLoginForm();
    });
}

// Şifre Sıfırlama Formu (E-postadaki linkten gelir)
function loadResetPasswordForm(token) {
    authFormContainer.innerHTML = `
        <h2>Şifre Sıfırla</h2>
        <form id="resetPasswordForm">
            <div class="form-group">
                <label for="newPassword">Yeni Şifre</label>
                <input type="password" id="newPassword" placeholder="Yeni şifrenizi girin" required>
            </div>
            <div class="form-group">
                <label for="confirmNewPassword">Yeni Şifre Tekrar</label>
                <input type="password" id="confirmNewPassword" placeholder="Yeni şifrenizi tekrar girin" required>
            </div>
            <button type="submit" class="btn primary-btn">Şifreyi Güncelle</button>
            <div id="resetPasswordMessage" class="message"></div>
        </form>
    `;

    document.getElementById('resetPasswordForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const newPassword = document.getElementById('newPassword').value;
        const confirmNewPassword = document.getElementById('confirmNewPassword').value;

        if (newPassword !== confirmNewPassword) {
            displayMessage('resetPasswordMessage', 'Şifreler uyuşmuyor.');
            return;
        }

        try {
            const res = await fetch(`${API_URL}/auth/reset-password/${token}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: newPassword })
            });
            const data = await res.json();
            if (res.ok) {
                displayMessage('resetPasswordMessage', data.message, 'success');
                // Şifre sıfırlama başarılıysa giriş formuna yönlendir
                setTimeout(() => {
                    loadLoginForm();
                }, 2000);
            } else {
                displayMessage('resetPasswordMessage', data.message || 'Şifre sıfırlama başarısız.');
            }
        } catch (error) {
            console.error('Şifre sıfırlama hatası:', error);
            displayMessage('resetPasswordMessage', 'Sunucuya bağlanılamadı.');
        }
    });
}

// URL'deki token'ı kontrol et ve ilgili formu yükle
window.addEventListener('load', () => {
    const params = new URLSearchParams(window.location.search);
    const registerToken = params.get('registerToken');
    const resetToken = params.get('resetToken');

    if (registerToken) {
        openModal();
        loadCompleteRegisterForm(registerToken);
    } else if (resetToken) {
        openModal();
        loadResetPasswordForm(resetToken);
    }
    // Eğer token yoksa, main.js'deki butonlar formu yükleyecek
});


// Modal kapatma butonu
closeModalButton.addEventListener('click', closeModal);

// Modala dışına tıklayınca kapatma
window.addEventListener('click', (event) => {
    if (event.target === authModal) {
        closeModal();
    }
});
