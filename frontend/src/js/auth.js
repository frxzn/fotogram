// Bu dosya, modal içerisine yüklenecek formları ve API çağrılarını yönetecek.

const authFormContainer = document.getElementById('authFormContainer');

// Kayıt Formunu Yükle
function loadRegisterForm() {
    authFormContainer.innerHTML = `
        <form id="registerForm" class="auth-form">
            <h2>Kayıt Ol</h2>
            <div class="form-group">
                <label for="registerEmail">E-posta</label>
                <input type="email" id="registerEmail" placeholder="e-posta adresinizi girin" required>
            </div>
            <div class="form-actions">
                <button type="submit" class="btn primary-btn">Doğrulama E-postası Gönder</button>
            </div>
            <p class="form-text-link">Zaten hesabın var mı? <a href="#" id="showLogin">Giriş Yap</a></p>
        </form>
    `;

    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('registerEmail').value;
        try {
            // Backend'e e-posta ile kayıt isteği gönderme
            const response = await fetch('/api/auth/request-register', { // Backend API endpoint'i
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await response.json();
            if (response.ok) {
                alert(data.message); // "Doğrulama linki e-postana gönderildi."
            } else {
                alert(data.message || 'Kayıt başarısız oldu.');
            }
        } catch (error) {
            console.error('Kayıt isteği hatası:', error);
            alert('Bir hata oluştu, lütfen tekrar deneyin.');
        }
    });

    document.getElementById('showLogin').addEventListener('click', (e) => {
        e.preventDefault();
        loadLoginForm();
    });
}

// Giriş Formunu Yükle
function loadLoginForm() {
    authFormContainer.innerHTML = `
        <form id="loginForm" class="auth-form">
            <h2>Giriş Yap</h2>
            <div class="form-group">
                <label for="loginEmail">E-posta</label>
                <input type="email" id="loginEmail" placeholder="e-posta adresinizi girin" required>
            </div>
            <div class="form-group">
                <label for="loginPassword">Şifre</label>
                <input type="password" id="loginPassword" placeholder="şifrenizi girin" required>
            </div>
            <div class="form-actions">
                <button type="submit" class="btn primary-btn">Giriş Yap</button>
            </div>
            <p class="form-text-link"><a href="#" id="forgotPassword">Şifremi Unuttum</a></p>
            <p class="form-text-link">Hesabın yok mu? <a href="#" id="showRegister">Kayıt Ol</a></p>
        </form>
    `;

    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        try {
            const response = await fetch('/api/auth/login', { // Backend API endpoint'i
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            if (response.ok) {
                // Giriş başarılı, token'ı kaydet ve ana sayfaya yönlendir
                localStorage.setItem('token', data.token);
                alert('Giriş başarılı! Yönlendiriliyorsunuz...');
                window.location.href = '/dashboard.html'; // Giriş sonrası ana sayfa
            } else {
                alert(data.message || 'Giriş başarısız oldu.');
            }
        } catch (error) {
            console.error('Giriş isteği hatası:', error);
            alert('Bir hata oluştu, lütfen tekrar deneyin.');
        }
    });

    document.getElementById('forgotPassword').addEventListener('click', (e) => {
        e.preventDefault();
        loadForgotPasswordForm();
    });

    document.getElementById('showRegister').addEventListener('click', (e) => {
        e.preventDefault();
        loadRegisterForm();
    });
}

// Şifre Sıfırlama Formunu Yükle
function loadForgotPasswordForm() {
    authFormContainer.innerHTML = `
        <form id="forgotPasswordForm" class="auth-form">
            <h2>Şifremi Unuttum</h2>
            <div class="form-group">
                <label for="forgotEmail">E-posta</label>
                <input type="email" id="forgotEmail" placeholder="e-posta adresinizi girin" required>
            </div>
            <div class="form-actions">
                <button type="submit" class="btn primary-btn">Şifre Sıfırlama E-postası Gönder</button>
            </div>
            <p class="form-text-link"><a href="#" id="showLoginFromForgot">Giriş Sayfasına Geri Dön</a></p>
        </form>
    `;

    document.getElementById('forgotPasswordForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('forgotEmail').value;
        try {
            const response = await fetch('/api/auth/request-password-reset', { // Backend API endpoint'i
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await response.json();
            if (response.ok) {
                alert(data.message); // "Şifre sıfırlama linki e-postana gönderildi."
            } else {
                alert(data.message || 'Şifre sıfırlama isteği başarısız oldu.');
            }
        } catch (error) {
            console.error('Şifre sıfırlama isteği hatası:', error);
            alert('Bir hata oluştu, lütfen tekrar deneyin.');
        }
    });

    document.getElementById('showLoginFromForgot').addEventListener('click', (e) => {
        e.preventDefault();
        loadLoginForm();
    });
}

// URL'den gelen kayıt linki için doğrulama
// Kullanıcı maildeki linke tıkladığında bu sayfa yüklenecek ve URL'den token alınacak.
const urlParams = new URLSearchParams(window.location.search);
const registerToken = urlParams.get('token');

if (registerToken) {
    // Eğer URL'de token varsa, direkt kullanıcı adı/şifre oluşturma formunu göster.
    // Backend'den token doğrulaması yapılacak.
    authFormContainer.innerHTML = `
        <form id="completeRegisterForm" class="auth-form">
            <h2>Kullanıcı Adı ve Şifre Oluştur</h2>
            <div class="form-group">
                <label for="username">Kullanıcı Adı</label>
                <input type="text" id="username" placeholder="kullanıcı adı girin (boşluksuz)" required pattern="[a-zA-Z0-9_]+" title="Kullanıcı adı sadece harf, rakam ve alt çizgi içerebilir">
            </div>
            <div class="form-group">
                <label for="password">Şifre</label>
                <input type="password" id="password" placeholder="şifrenizi oluşturun" required minlength="6">
            </div>
            <div class="form-group">
                <label for="confirmPassword">Şifre Tekrar</label>
                <input type="password" id="confirmPassword" placeholder="şifrenizi tekrar girin" required>
            </div>
            <div class="terms-checkbox">
                <input type="checkbox" id="termsAccepted" required>
                <label for="termsAccepted">
                    <a href="/terms.html" target="_blank">Kullanım Şartları</a> ve Sorumluluk Reddi Beyanını okudum ve kabul ediyorum.
                </label>
            </div>
            <div class="form-actions">
                <button type="submit" class="btn primary-btn">Kaydı Tamamla</button>
            </div>
        </form>
    `;

    const completeRegisterForm = document.getElementById('completeRegisterForm');
    if (completeRegisterForm) {
        completeRegisterForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const termsAccepted = document.getElementById('termsAccepted').checked;

            if (password !== confirmPassword) {
                alert('Şifreler uyuşmuyor!');
                return;
            }
            if (!termsAccepted) {
                alert('Kullanım şartlarını kabul etmelisiniz.');
                return;
            }
            if (username.includes(' ')) {
                 alert('Kullanıcı adında boşluk kullanılamaz.');
                 return;
            }
            // Daha fazla kullanıcı adı doğrulaması eklenebilir (regex vb.)

            try {
                const response = await fetch('/api/auth/complete-register', { // Backend API endpoint'i
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token: registerToken, username, password })
                });
                const data = await response.json();
                if (response.ok) {
                    alert(data.message); // "Kaydınız başarıyla tamamlandı, şimdi giriş yapabilirsiniz."
                    window.location.href = '/'; // Ana sayfaya yönlendir
                } else {
                    alert(data.message || 'Kayıt tamamlama başarısız oldu.');
                }
            } catch (error) {
                console.error('Kayıt tamamlama hatası:', error);
                alert('Bir hata oluştu, lütfen tekrar deneyin.');
            }
        });
    }

    // Modalın görünür olduğundan emin olun
    document.getElementById('authModal').style.display = 'flex';

    // Tokenın 3 dakika sonra otomatik olarak geçersiz kılınması (sadece backend'de kontrol edilmeli, frontend bilgilendirmesi)
    setTimeout(() => {
        // Bu sadece görsel bir uyarıdır. Asıl iptal işlemi backend'de olmalı.
        // alert('Kayıt linkinizin süresi doldu. Lütfen tekrar kayıt olmaya çalışın.');
        // window.location.href = '/'; // Ana sayfaya yönlendir
    }, 180000); // 3 dakika = 180000 ms
}

// URL'den gelen şifre sıfırlama linki için doğrulama
const resetToken = urlParams.get('resetToken');

if (resetToken) {
    authFormContainer.innerHTML = `
        <form id="resetPasswordForm" class="auth-form">
            <h2>Yeni Şifre Oluştur</h2>
            <div class="form-group">
                <label for="newPassword">Yeni Şifre</label>
                <input type="password" id="newPassword" placeholder="yeni şifrenizi girin" required minlength="6">
            </div>
            <div class="form-group">
                <label for="confirmNewPassword">Yeni Şifre Tekrar</label>
                <input type="password" id="confirmNewPassword" placeholder="yeni şifrenizi tekrar girin" required>
            </div>
            <div class="form-actions">
                <button type="submit" class="btn primary-btn">Şifreyi Sıfırla</button>
            </div>
        </form>
    `;

    const resetPasswordForm = document.getElementById('resetPasswordForm');
    if (resetPasswordForm) {
        resetPasswordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const newPassword = document.getElementById('newPassword').value;
            const confirmNewPassword = document.getElementById('confirmNewPassword').value;

            if (newPassword !== confirmNewPassword) {
                alert('Şifreler uyuşmuyor!');
                return;
            }

            try {
                const response = await fetch('/api/auth/reset-password', { // Backend API endpoint'i
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token: resetToken, newPassword })
                });
                const data = await response.json();
                if (response.ok) {
                    alert(data.message); // "Şifreniz başarıyla sıfırlandı, şimdi giriş yapabilirsiniz."
                    window.location.href = '/'; // Ana sayfaya yönlendir
                } else {
                    alert(data.message || 'Şifre sıfırlama başarısız oldu.');
                }
            } catch (error) {
                console.error('Şifre sıfırlama hatası:', error);
                alert('Bir hata oluştu, lütfen tekrar deneyin.');
            }
        });
    }

    // Modalın görünür olduğundan emin olun
    document.getElementById('authModal').style.display = 'flex';

    // Tokenın 3 dakika sonra otomatik olarak geçersiz kılınması (sadece backend'de kontrol edilmeli)
    setTimeout(() => {
        // alert('Şifre sıfırlama linkinizin süresi doldu. Lütfen tekrar deneyin.');
        // window.location.href = '/'; // Ana sayfaya yönlendir
    }, 180000); // 3 dakika = 180000 ms
}
