// frontend/public/js/auth.js

const API_URL = 'https://fotogram-backend.onrender.com/api'; // Backend URL'ini buraya yaz!
// Render frontend environment variable'dan da alabiliriz: process.env.REACT_APP_API_URL
// Ancak bu direkt JS olduğu için, şimdilik sabit URL yazmak en kolayı.

const authModal = document.getElementById('authModal');
const authFormContainer = document.getElementById('authFormContainer');
const closeModalButton = authModal.querySelector('.close-button');

// Modalı kapatma işlevi
if (closeModalButton) {
    closeModalButton.addEventListener('click', () => {
        authModal.style.display = 'none';
        authFormContainer.innerHTML = ''; // Formu temizle
    });
}

// Modal dışına tıklayınca kapatma
window.addEventListener('click', (event) => {
    if (event.target === authModal) {
        authModal.style.display = 'none';
        authFormContainer.innerHTML = '';
    }
});

// Yardımcı fonksiyon: Mesajları göster
const displayMessage = (containerId, message, type = 'error') => {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Message container with ID ${containerId} not found.`);
        return;
    }
    container.innerHTML = `<p class="form-message ${type}">${message}</p>`;
    // Bir süre sonra mesajı temizle
    setTimeout(() => {
        container.innerHTML = '';
    }, 5000);
};


// -------------------- KAYIT FORMLARI --------------------

// Kayıt Formu - Adım 1 (E-posta ile kayıt)
function loadRegisterForm() {
    authModal.style.display = 'flex';
    authFormContainer.innerHTML = `
        <h2>Kayıt Ol</h2>
        <form id="registerFormEmail">
            <div class="form-group">
                <label for="registerEmail">E-posta</label>
                <input type="email" id="registerEmail" placeholder="E-posta adresinizi girin" required>
            </div>
            <div id="registerEmailMessage" class="form-message-container"></div>
            <div class="form-actions">
                <button type="submit" class="btn primary-btn">Kaydol</button>
            </div>
            <a href="#" class="form-text-link" id="showLoginForm">Zaten hesabın var mı? Giriş Yap</a>
        </form>
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
                    <p>Lütfen kaydı tamamlamak için e-posta adresinize gönderdiğimiz bağlantıya tıklayın.</p>
                `;
            } else {
                displayMessage('registerEmailMessage', data.message || 'Kayıt sırasında bir hata oluştu.');
            }
        } catch (error) {
            console.error('Kayıt hatası:', error);
            displayMessage('registerEmailMessage', 'Sunucuya bağlanılamadı.');
        }
    });

    // "Giriş Yap" linkine tıklama
    document.getElementById('showLoginForm').addEventListener('click', (e) => {
        e.preventDefault();
        loadLoginForm();
    });
}

// Kayıt Formu - Adım 2 (Kullanıcı adı ve şifre oluşturma - E-posta linkinden gelinince)
function loadCompleteRegisterForm(token) {
    authModal.style.display = 'flex';
    authFormContainer.innerHTML = `
        <h2>Kaydı Tamamla</h2>
        <form id="completeRegisterForm">
            <div class="form-group">
                <label for="username">Kullanıcı Adı</label>
                <input type="text" id="username" placeholder="Kullanıcı adınızı girin" required>
            </div>
            <div class="form-group">
                <label for="password">Şifre</label>
                <input type="password" id="password" placeholder="Şifrenizi girin" required>
            </div>
            <div class="form-group">
                <label for="confirmPassword">Şifreyi Onayla</label>
                <input type="password" id="confirmPassword" placeholder="Şifrenizi tekrar girin" required>
            </div>
            <div class="terms-checkbox">
                <input type="checkbox" id="termsAccepted" required>
                <label for="termsAccepted">
                    <a href="/terms.html" target="_blank">Kullanım Koşullarını</a> ve 
                    <a href="/privacy.html" target="_blank">Gizlilik Politikasını</a> okudum ve kabul ediyorum.
                </label>
            </div>
            <div id="completeRegisterMessage" class="form-message-container"></div>
            <div class="form-actions">
                <button type="submit" class="btn primary-btn">Kaydı Tamamla</button>
            </div>
        </form>
    `;

    document.getElementById('completeRegisterForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const termsAccepted = document.getElementById('termsAccepted').checked;

        if (password !== confirmPassword) {
            displayMessage('completeRegisterMessage', 'Şifreler uyuşmuyor.');
            return;
        }
        if (!termsAccepted) {
            displayMessage('completeRegisterMessage', 'Kullanım koşullarını kabul etmelisiniz.');
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
                localStorage.setItem('token', data.token); // Tokenı kaydet
                // Başarılı kayıttan sonra ana sayfaya yönlendir
                window.location.href = '/dashboard.html'; // Yönlendirilecek sayfa
            } else {
                displayMessage('completeRegisterMessage', data.message || 'Kaydı tamamlarken bir hata oluştu.');
            }
        } catch (error) {
            console.error('Kaydı tamamlama hatası:', error);
            displayMessage('completeRegisterMessage', 'Sunucuya bağlanılamadı.');
        }
    });
}

// -------------------- GİRİŞ FORMU --------------------

function loadLoginForm() {
    authModal.style.display = 'flex';
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
            <a href="#" class="form-text-link" id="showForgotPasswordForm">Şifremi unuttum?</a>
            <div id="loginMessage" class="form-message-container"></div>
            <div class="form-actions">
                <button type="submit" class="btn primary-btn">Giriş Yap</button>
            </div>
            <a href="#" class="form-text-link" id="showRegisterForm">Hesabın yok mu? Kaydol</a>
        </form>
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
                localStorage.setItem('token', data.token); // Tokenı kaydet
                // Başarılı girişten sonra ana sayfaya yönlendir
                window.location.href = '/dashboard.html'; // Yönlendirilecek sayfa
            } else {
                displayMessage('loginMessage', data.message || 'Giriş başarısız.');
            }
        } catch (error) {
            console.error('Giriş hatası:', error);
            displayMessage('loginMessage', 'Sunucuya bağlanılamadı.');
        }
    });

    // "Şifremi unuttum" linkine tıklama
    document.getElementById('showForgotPasswordForm').addEventListener('click', (e) => {
        e.preventDefault();
        loadForgotPasswordForm();
    });

    // "Kaydol" linkine tıklama
    document.getElementById('showRegisterForm').addEventListener('click', (e) => {
        e.preventDefault();
        loadRegisterForm();
    });
}

// -------------------- ŞİFRE SIFIRLAMA FORMLARI --------------------

function loadForgotPasswordForm() {
    authModal.style.display = 'flex';
    authFormContainer.innerHTML = `
        <h2>Şifremi Sıfırla</h2>
        <form id="forgotPasswordForm">
            <div class="form-group">
                <label for="forgotEmail">E-posta</label>
                <input type="email" id="forgotEmail" placeholder="Kayıtlı e-posta adresinizi girin" required>
            </div>
            <div id="forgotPasswordMessage" class="form-message-container"></div>
            <div class="form-actions">
                <button type="submit" class="btn primary-btn">Şifre Sıfırlama Bağlantısı Gönder</button>
            </div>
            <a href="#" class="form-text-link" id="backToLoginFromForgot">Giriş Ekranına Geri Dön</a>
        </form>
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
                    <p>Lütfen şifrenizi sıfırlamak için e-posta adresinize gönderdiğimiz bağlantıya tıklayın.</p>
                `;
            } else {
                displayMessage('forgotPasswordMessage', data.message || 'Şifre sıfırlama sırasında bir hata oluştu.');
            }
        } catch (error) {
            console.error('Şifre sıfırlama hatası:', error);
            displayMessage('forgotPasswordMessage', 'Sunucuya bağlanılamadı.');
        }
    });

    document.getElementById('backToLoginFromForgot').addEventListener('click', (e) => {
        e.preventDefault();
        loadLoginForm();
    });
}

// Şifre Sıfırlama Formu - Adım 2 (Yeni şifre belirleme - E-posta linkinden gelinince)
function loadResetPasswordForm(token) {
    authModal.style.display = 'flex';
    authFormContainer.innerHTML = `
        <h2>Şifreyi Sıfırla</h2>
        <form id="resetPasswordForm">
            <div class="form-group">
                <label for="newPassword">Yeni Şifre</label>
                <input type="password" id="newPassword" placeholder="Yeni şifrenizi girin" required>
            </div>
            <div class="form-group">
                <label for="confirmNewPassword">Yeni Şifreyi Onayla</label>
                <input type="password" id="confirmNewPassword" placeholder="Yeni şifrenizi tekrar girin" required>
            </div>
            <div id="resetPasswordMessage" class="form-message-container"></div>
            <div class="form-actions">
                <button type="submit" class="btn primary-btn">Şifreyi Güncelle</button>
            </div>
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
                // Şifre sıfırlandıktan sonra giriş formuna yönlendir
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

// -------------------- BAŞLANGIÇ YÜKLEMESİ VE URL PARSİNG --------------------

// Sayfa yüklendiğinde URL'yi kontrol et (kayıt veya şifre sıfırlama tokenı için)
document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const verificationToken = params.get('token');
    const resetToken = params.get('resetToken');

    if (verificationToken) {
        loadCompleteRegisterForm(verificationToken);
    } else if (resetToken) {
        loadResetPasswordForm(resetToken);
    }
    // Eğer hiçbir token yoksa, butonlar main.js tarafından tetiklenecek.
});

// Global olarak erişilebilir fonksiyonlar
window.loadRegisterForm = loadRegisterForm;
window.loadLoginForm = loadLoginForm;
window.loadForgotPasswordForm = loadForgotPasswordForm;
window.loadCompleteRegisterForm = loadCompleteRegisterForm; // Gerekirse dışarıdan çağırılabilir
window.loadResetPasswordForm = loadResetPasswordForm; // Gerekirse dışarıdan çağırılabilir
