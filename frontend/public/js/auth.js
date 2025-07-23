// frontend/public/js/auth.js

const API_URL = 'https://fotogram-backend.onrender.com/api'; 
const authModal = document.getElementById('authModal');
const authFormContainer = document.getElementById('authFormContainer');
const closeModalButton = authModal.querySelector('.close-button');

// ... (Diğer kodlar) ...

// Kayıt Formu - Adım 1 (E-posta ile kayıt)
function loadRegisterForm() {
    // ... (Form HTML'i) ...

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
                // Backend'den gelen spesifik hatayı göstermek için alert
                alert('Backend Hatası (Kaydol): ' + (data.message || 'Bilinmeyen Hata'));
            }
        } catch (error) {
            console.error('Kayıt hatası:', error);
            displayMessage('registerEmailMessage', 'Sunucuya bağlanılamadı.');
            // Network veya CORS hatası olduğunda alert
            alert('Frontend Network Hatası (Kaydol): ' + error.message + '\nLütfen backend URL ve CORS ayarlarınızı kontrol edin.');
        }
    });

    // ... (Diğer kodlar) ...
}

// ... (loadCompleteRegisterForm, loadLoginForm, loadForgotPasswordForm, loadResetPasswordForm fonksiyonlarının benzer catch blokları) ...

// Örneğin, loadLoginForm içinde:
function loadLoginForm() {
    // ... (Form HTML'i) ...

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
                localStorage.setItem('token', data.token);
                window.location.href = '/dashboard.html';
            } else {
                displayMessage('loginMessage', data.message || 'Giriş başarısız.');
                // Backend'den gelen spesifik hatayı göstermek için alert
                alert('Backend Hatası (Giriş): ' + (data.message || 'Bilinmeyen Hata'));
            }
        } catch (error) {
            console.error('Giriş hatası:', error);
            displayMessage('loginMessage', 'Sunucuya bağlanılamadı.');
            // Network veya CORS hatası olduğunda alert
            alert('Frontend Network Hatası (Giriş): ' + error.message + '\nLütfen backend URL ve CORS ayarlarınızı kontrol edin.');
        }
    });

    // ... (Diğer kodlar) ...
}


// ... (Diğer fonksiyonlardaki benzer `try-catch` bloklarına da ekle) ...

// loadForgotPasswordForm içinde
function loadForgotPasswordForm() {
    // ...
    document.getElementById('forgotPasswordForm').addEventListener('submit', async (e) => {
        // ...
        try {
            // ...
            if (res.ok) {
                // ...
            } else {
                displayMessage('forgotPasswordMessage', data.message || 'Şifre sıfırlama sırasında bir hata oluştu.');
                alert('Backend Hatası (Şifre Sıfırlama İstek): ' + (data.message || 'Bilinmeyen Hata'));
            }
        } catch (error) {
            console.error('Şifre sıfırlama hatası:', error);
            displayMessage('forgotPasswordMessage', 'Sunucuya bağlanılamadı.');
            alert('Frontend Network Hatası (Şifre Sıfırlama İstek): ' + error.message + '\nLütfen backend URL ve CORS ayarlarınızı kontrol edin.');
        }
    });
}

// loadResetPasswordForm içinde
function loadResetPasswordForm(token) {
    // ...
    document.getElementById('resetPasswordForm').addEventListener('submit', async (e) => {
        // ...
        try {
            // ...
            if (res.ok) {
                // ...
            } else {
                displayMessage('resetPasswordMessage', data.message || 'Şifre sıfırlama başarısız.');
                alert('Backend Hatası (Şifre Sıfırlama): ' + (data.message || 'Bilinmeyen Hata'));
            }
        } catch (error) {
            console.error('Şifre sıfırlama hatası:', error);
            displayMessage('resetPasswordMessage', 'Sunucuya bağlanılamadı.');
            alert('Frontend Network Hatası (Şifre Sıfırlama): ' + error.message + '\nLütfen backend URL ve CORS ayarlarınızı kontrol edin.');
        }
    });
}
