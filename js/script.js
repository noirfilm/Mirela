document.addEventListener("DOMContentLoaded", () => {
    // Ativa as animações de revelação
    document.body.classList.add('js-enabled');


    // --- 2. OBSERVER DE SCROLL (Animações editoriais) ---
    const revealElements = document.querySelectorAll('.reveal');
    
    const revealOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, revealOptions);

    revealElements.forEach(el => {
        revealObserver.observe(el);
    });

    // --- 3. PARALLAX NO CAPÍTULO DO JONAS ---
    const parallaxImg = document.querySelector('.parallax-img');
    const capitulo05 = document.querySelector('#capitulo-05');

    window.addEventListener('scroll', () => {
        if (!parallaxImg || !capitulo05) return;
        
        const rect = capitulo05.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        if (rect.top <= windowHeight && rect.bottom >= 0) {
            const scrollPercent = (windowHeight - rect.top) / (windowHeight + rect.height);
            const yPos = (scrollPercent * 20) - 10;
            parallaxImg.style.transform = `scale(1.1) translateY(${yPos}%)`;
        }
    });
});
