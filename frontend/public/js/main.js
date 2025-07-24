// frontend/public/js/main.js

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (token) {
        window.location.href = '/dashboard.html';
    }
    // Bu dosya, ana sayfadaki "Kayıt Ol / Giriş Yap" butonlarına tıklama olaylarını doğrudan yönetmez.
    // Bu butonların olay yönetimi ve modal açma/kapama işlemleri 'auth.js' dosyasında yapılır.
    // 'main.js' sadece başlangıçta yetkilendirme tabanlı yönlendirme için kullanılır.
});
