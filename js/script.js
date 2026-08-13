document.addEventListener("DOMContentLoaded", () => {
    // Ativa as animações de revelação
    document.body.classList.add('js-enabled');

    // --- 1. MÚSICA DO YOUTUBE ---
    // Navegadores de celular bloqueiam autoplay com áudio. Em vez de tentar
    // tocar automaticamente, iniciamos a música no primeiro toque do usuário.
    const youtubeFrame = document.getElementById('youtube-player');
    let youtubePlayer = null;
    let userInteracted = false;

    if (youtubeFrame) {
        window.onYouTubeIframeAPIReady = () => {
            youtubePlayer = new YT.Player('youtube-player', {
                events: {
                    onReady: () => {
                        if (userInteracted) youtubePlayer.playVideo();
                    }
                }
            });
        };

        const youtubeApi = document.createElement('script');
        youtubeApi.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(youtubeApi);

        const startMusic = () => {
            userInteracted = true;
            if (youtubePlayer && typeof youtubePlayer.playVideo === 'function') {
                youtubePlayer.playVideo();
            }
            document.removeEventListener('pointerdown', startMusic);
            document.removeEventListener('touchstart', startMusic);
            document.removeEventListener('click', startMusic);
        };

        document.addEventListener('pointerdown', startMusic, { once: true });
        document.addEventListener('touchstart', startMusic, { once: true, passive: true });
        document.addEventListener('click', startMusic, { once: true });
    }

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
