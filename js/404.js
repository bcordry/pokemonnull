// 404.js - Optional: Add a little animation or effect to the 404 page

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    // Animate the 404 number with a bounce
    const title = document.querySelector('.notfound-title');
    if (title) {
        title.style.transform = 'scale(0.4)';
        title.style.opacity = '0';
        setTimeout(() => {
            title.style.transition = 'all 0.7s cubic-bezier(.68,-0.55,.27,1.55)';
            title.style.transform = 'scale(1)';
            title.style.opacity = '1';
        }, 200);
    }
});