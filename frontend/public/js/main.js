// frontend/public/js/main.js

document.addEventListener('DOMContentLoaded', () => {
    // Kayıt Ol butonuna basıldığında
    const registerBtn = document.getElementById('registerBtn');
    if (registerBtn) {
        registerBtn.addEventListener('click', () => {
            // auth.js'teki fonksiyonu çağır
            if (typeof loadRegisterForm === 'function') {
                loadRegisterForm();
            } else {
                console.error('loadRegisterForm fonksiyonu bulunamadı. auth.js yüklendiğinden emin olun.');
            }
        });
    }

    // Giriş Yap butonuna basıldığında
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            // auth.js'teki fonksiyonu çağır
            if (typeof loadLoginForm === 'function') {
                loadLoginForm();
            } else {
                console.error('loadLoginForm fonksiyonu bulunamadı. auth.js yüklendiğinden emin olun.');
            }
        });
    }

    // Kullanıcının zaten oturum açmış olup olmadığını kontrol et (token var mı?)
    // Eğer token varsa, kullanıcıyı doğrudan dashboard'a yönlendir.
    // Bu kısım, henüz dashboard.html olmadığı için şimdilik devre dışı bırakılabilir
    // veya basitçe bir log mesajı verilebilir.
    const token = localStorage.getItem('token');
    if (token) {
        console.log('Kullanıcı zaten giriş yapmış, dashboarda yönlendiriliyor...');
        // window.location.href = '/dashboard.html'; // Dashboard hazır olunca aktif edilecek
    }
});
