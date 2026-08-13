document.addEventListener("DOMContentLoaded", () => {
    document.body.classList.add("js-enabled");

    // O player antigo do YouTube não faz mais parte da experiência.
    document.getElementById("youtube-player")?.remove();

    // Cria o acabamento editorial da primeira fotografia sem alterar
    // o conteúdo original do HTML.
    const firstImage = document.querySelector("#capitulo-00 .container > img");
    if (firstImage && !firstImage.closest(".memory-photo")) {
        const photo = document.createElement("div");
        photo.className = "memory-photo reveal reveal-image";
        firstImage.parentNode.insertBefore(photo, firstImage);
        photo.appendChild(firstImage);

        const caption = document.createElement("div");
        caption.className = "memory-caption reveal reveal-tag";
        caption.textContent = "MEMÓRIA";
        photo.appendChild(caption);
    }

    // Cada parágrafo ganha uma entrada própria, com pequenos intervalos
    // para criar uma leitura contínua em vez de uma animação em bloco.
    document.querySelectorAll(".text-body p").forEach((paragraph, index) => {
        paragraph.classList.add("reveal", "reveal-paragraph");
        paragraph.style.setProperty("--p-delay", `${(index % 5) * 0.07}s`);
    });

    const revealElements = document.querySelectorAll(".reveal");
    const parallaxImage = document.querySelector(".parallax-img");
    const jonasChapter = document.querySelector("#capitulo-05");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const classifyReveal = (element) => {
        if (element.classList.contains("reveal-paragraph") || element.classList.contains("memory-caption")) return;

        if (element.matches("h1, h2, .title-huge, .title-large")) {
            element.classList.add("reveal-title");
        } else if (element.matches(".image-wrapper, .image-content, img, .memory-photo")) {
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
                // Ao sair da tela, o estado volta ao inicial. Assim, ao
                // retornar para o começo ou para um capítulo, a animação toca de novo.
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
