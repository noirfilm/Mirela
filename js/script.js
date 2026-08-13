document.addEventListener("DOMContentLoaded", () => {
    document.body.classList.add("js-enabled");

    const revealElements = document.querySelectorAll(".reveal");
    const parallaxImage = document.querySelector(".parallax-img");
    const jonasChapter = document.querySelector("#capitulo-05");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Define uma linguagem de movimento diferente para cada tipo de elemento.
    const classifyReveal = (element) => {
        if (element.matches("h1, h2, .title-huge, .title-large")) {
            element.classList.add("reveal-title");
        } else if (element.matches(".image-wrapper, .image-content, img")) {
            element.classList.add("reveal-image");
        } else if (element.matches(".archive-tags, .chapter-num, .text-mono")) {
            element.classList.add("reveal-tag");
        } else if (element.matches(".top-nav, .hero-bottom")) {
            element.classList.add("reveal-line");
        } else {
            element.classList.add("reveal-text");
        }
    };

    revealElements.forEach(classifyReveal);

    if (!reduceMotion && "IntersectionObserver" in window) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                // Remove a classe quando sai da tela para que a animação
                // aconteça novamente ao voltar para o começo/trecho anterior.
                entry.target.classList.toggle("active", entry.isIntersecting);
            });
        }, {
            threshold: 0.12,
            rootMargin: "0px 0px -8% 0px"
        });

        revealElements.forEach((element) => revealObserver.observe(element));
    } else {
        revealElements.forEach((element) => element.classList.add("active"));
    }

    if (!parallaxImage || !jonasChapter || reduceMotion) return;

    let ticking = false;

    const updateParallax = () => {
        const rect = jonasChapter.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const visible = rect.top < viewportHeight && rect.bottom > 0;

        if (visible) {
            const progress = (viewportHeight - rect.top) / (viewportHeight + rect.height);
            const y = (progress * 16) - 8;
            parallaxImage.style.transform = `scale(1.08) translate3d(0, ${y}%, 0)`;
        }

        ticking = false;
    };

    const requestParallax = () => {
        if (!ticking) {
            window.requestAnimationFrame(updateParallax);
            ticking = true;
        }
    };

    window.addEventListener("scroll", requestParallax, { passive: true });
    window.addEventListener("resize", requestParallax, { passive: true });
    requestParallax();
});
