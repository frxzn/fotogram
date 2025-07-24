// frontend/public/js/main.js - DÜZELTİLMİŞ VERSİYON

document.addEventListener('DOMContentLoaded', () => {
    // Doğru localStorage anahtarını kullan: 'loggedInUsername'
    const loggedInUser = localStorage.getItem('loggedInUsername'); 

    // Konsol logu ekleyerek main.js'in ne gördüğünü anlayalım
    console.log('main.js yüklendi. localStorage.loggedInUsername degeri:', loggedInUser); 

    // Eğer kullanıcı adı localStorage'da varsa (yani giriş yapmışsa) dashboard'a yönlendir
    if (loggedInUser) {
        console.log('main.js: Kullanici tespit edildi, dashboard.html e yonlendiriliyor.'); 
        window.location.href = '/dashboard.html';
    }
    // Bu dosya, ana sayfadaki "Kayıt Ol / Giriş Yap" butonlarına tıklama olaylarını doğrudan yönetmez.
    // Bu butonların olay yönetimi ve modal açma/kapama işlemleri 'auth.js' dosyasında yapılır.
    // 'main.js' sadece başlangıçta yetkilendirme tabanlı yönlendirme için kullanılır.
});
