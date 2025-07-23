// frontend/public/js/main.js

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    // Eğer kullanıcı zaten giriş yapmışsa (token varsa), dashboard sayfasına yönlendir
    if (token) {
        window.location.href = '/dashboard.html';
    }

    // NOT: Anasayfadaki "Kayıt Ol / Giriş Yap" butonlarına tıklama olayları artık auth.js içinde yönetiliyor.
    // Bu dosya temel olarak sadece yetkilendirme yönlendirmesi için kullanılıyor.
});
