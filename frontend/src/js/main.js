document.addEventListener('DOMContentLoaded', () => {
    const registerBtn = document.getElementById('registerBtn');
    const loginBtn = document.getElementById('loginBtn');
    const authModal = document.getElementById('authModal');
    const closeButton = authModal.querySelector('.close-button');
    const authFormContainer = document.getElementById('authFormContainer');

    const showModal = () => {
        authModal.style.display = 'flex';
    };

    const hideModal = () => {
        authModal.style.display = 'none';
        authFormContainer.innerHTML = ''; // Form içeriğini temizle
    };

    // Modalı kapatmak için buton ve dış tıklama
    closeButton.addEventListener('click', hideModal);
    window.addEventListener('click', (event) => {
        if (event.target == authModal) {
            hideModal();
        }
    });

    // Kayıt Ol butonuna tıklama
    registerBtn.addEventListener('click', (e) => {
        e.preventDefault();
        showModal();
        loadRegisterForm(); // auth.js'den gelen fonksiyon
    });

    // Giriş Yap butonuna tıklama
    loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        showModal();
        loadLoginForm(); // auth.js'den gelen fonksiyon
    });

    // Ana sayfa giriş yaptıktan sonra yüklenecekse buraya yönlendirme mantığı eklenebilir.
    // Örneğin: if (isLoggedIn()) { window.location.href = '/dashboard.html'; }
});
