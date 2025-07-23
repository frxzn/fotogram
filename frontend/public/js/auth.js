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
    console.log('Frontend Log: Modal açıldı.'); // Güncellenmiş log
}

function closeModal() {
    authModal.style.display = 'none';
    authFormContainer.innerHTML = ''; // Modalı kapatırken içeriği temizle
}

// Kayıt Formu - Adım 1 (E-posta ile kayıt)
function loadRegisterForm() {
    console.log('Frontend Log: Kayıt formu yüklendi.'); // Güncellenmiş log
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
        console.log(`Frontend Log: Kayıt için API isteği başlatılıyor. E-posta: ${email}`); // Yeni log
        try {
            const res = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            console.log(`Frontend Log: API yanıtı alındı. Durum kodu: ${res.status}`); // Yeni log
            const data = await res.json();
            if (res.ok) {
                console.log('Frontend Log: Kayıt başarılı yanıtı.'); // Yeni log
                displayMessage('registerEmailMessage', data.message, 'success');
                authFormContainer.innerHTML = `
                    <h2>E-posta Gönderildi!</h2>
                    <p>${data.message || 'Lütfen kaydı tamamlamak için e-posta adresinize gönderdiğimiz bağlantıya tıklayın.'}</p>
                `;
            } else {
                console.error(`Frontend Log: Kayıt hatası. Mesaj: ${data.message || 'Bilinmeyen hata.'}`); // Yeni log
                displayMessage('registerEmailMessage', data.message || 'Kayıt sırasında bir hata oluştu.');
            }
        } catch (error) {
            console.error('Frontend Log: Sunucuya bağlanılamadı veya ağ hatası:', error); // Güncellenmiş log
            displayMessage('registerEmailMessage', 'Sunucuya bağlanılamadı.');
        }
    });

    document.getElementById('showLoginForm').addEventListener('click', (e) => {
        e.preventDefault();
        loadLoginForm();
    });
}

// ... geri kalan fonksiyonlar (loadCompleteRegisterForm, loadLoginForm, loadForgotPasswordForm, loadResetPasswordForm) için de benzer console.log eklemeleri yapabiliriz, ama şu an Kayıt Ol formuna odaklanalım. Örnekleri takip ederek diğerlerine de benzer loglar ekleyebilirsin.

// Giriş Formu (Örnek olarak, registerFormEmail'deki gibi log ekle)
function loadLoginForm() {
    console.log('Frontend Log: Giriş formu yüklendi.'); // Yeni log
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
        console.log(`Frontend Log: Giriş için API isteği başlatılıyor. E-posta: ${email}`); // Yeni log
        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            console.log(`Frontend Log: API yanıtı alındı. Durum kodu: ${res.status}`); // Yeni log
            const data = await res.json();
            if (res.ok) {
                console.log('Frontend Log: Giriş başarılı yanıtı.'); // Yeni log
                displayMessage('loginMessage', data.message, 'success');
                localStorage.setItem('token', data.token); // Token'ı kaydet
                window.location.href = '/dashboard.html';
            } else {
                console.error(`Frontend Log: Giriş hatası. Mesaj: ${data.message || 'Bilinmeyen hata.'}`); // Yeni log
                displayMessage('loginMessage', data.message || 'Giriş başarısız.');
            }
        } catch (error) {
            console.error('Frontend Log: Sunucuya bağlanılamadı veya ağ hatası:', error); // Güncellenmiş log
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
// ... geri kalan auth.js kodu
