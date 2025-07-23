// frontend/public/js/main.js

document.addEventListener('DOMContentLoaded', () => {
    console.log('main.js: DOMContentLoaded olayı tetiklendi.'); // Yeni eklenen satır

    // Kayıt Ol butonuna basıldığında
    const registerBtn = document.getElementById('registerBtn');
    console.log('main.js: registerBtn bulundu:', registerBtn); // Yeni eklenen satır
    if (registerBtn) {
        registerBtn.addEventListener('click', () => {
            console.log('main.js: Kayıt Ol butonuna tıklandı.'); // Yeni eklenen satır
            // auth.js'teki fonksiyonu çağır
            if (typeof loadRegisterForm === 'function') {
                loadRegisterForm();
                openModal(); // loadRegisterForm sadece formu yüklüyor, modalı açmıyor
            } else {
                console.error('main.js: loadRegisterForm fonksiyonu bulunamadı. auth.js yüklendiğinden emin olun.');
            }
        });
    }

    // Giriş Yap butonuna basıldığında
    const loginBtn = document.getElementById('loginBtn');
    console.log('main.js: loginBtn bulundu:', loginBtn); // Yeni eklenen satır
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            console.log('main.js: Giriş Yap butonuna tıklandı.'); // Yeni eklenen satır
            // auth.js'teki fonksiyonu çağır
            if (typeof loadLoginForm === 'function') {
                loadLoginForm();
                openModal(); // loadLoginForm sadece formu yüklüyor, modalı açmıyor
            } else {
                console.error('main.js: loadLoginForm fonksiyonu bulunamadı. auth.js yüklendiğinden emin olun.');
            }
        });
    }

    // Kullanıcının zaten oturum açmış olup olmadığını kontrol et (token var mı?)
    const token = localStorage.getItem('token');
    if (token) {
        console.log('main.js: Kullanıcı zaten giriş yapmış, dashboarda yönlendiriliyor...');
        // window.location.href = '/dashboard.html'; // Dashboard hazır olunca aktif edilecek
    }
});
