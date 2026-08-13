document.addEventListener("DOMContentLoaded", () => {
    document.body.classList.add("js-enabled");

    // A música foi removida da experiência. O iframe antigo é neutralizado
    // aqui também para manter compatibilidade com versões anteriores do HTML.
    document.getElementById("youtube-player")?.remove();

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Primeira fotografia: transforma a imagem existente em uma ficha de arquivo.
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

    // Todo parágrafo narrativo recebe sua própria entrada. Não dependemos
    // de :scope > p, então diálogos e blocos internos também são animados.
    document.querySelectorAll(".text-body p").forEach((paragraph, index) => {
        paragraph.classList.add("reveal", "reveal-paragraph");
        paragraph.style.setProperty("--p-delay", `${Math.min(index % 5, 4) * 0.055}s`);
    });

    const revealElements = document.querySelectorAll(".reveal");

    const classifyReveal = (element) => {
        if (element.classList.contains("reveal-paragraph") || element.classList.contains("memory-caption")) return;

        if (element.matches("h1, h2, h3, .title-huge, .title-large")) {
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

    // Parallax leve apenas onde a imagem realmente possui a classe.
    const parallaxImage = document.querySelector("#capitulo-05 .parallax-img");
    const jonasChapter = document.querySelector("#capitulo-05");

    if (!parallaxImage || !jonasChapter || reduceMotion) return;

    let ticking = false;

    const updateParallax = () => {
        const rect = jonasChapter.getBoundingClientRect();
        const viewportHeight = window.innerHeight;

        if (rect.top < viewportHeight && rect.bottom > 0) {
            const progress = (viewportHeight - rect.top) / (viewportHeight + rect.height);
            const y = (progress * 16) - 8;
            parallaxImage.style.transform = `scale(1.08) translate3d(0, ${y}%, 0)`;
        }

        ticking = false;
    };

    const requestParallax = () => {
        if (ticking) return;
        window.requestAnimationFrame(updateParallax);
        ticking = true;
    };

    window.addEventListener("scroll", requestParallax, { passive: true });
    window.addEventListener("resize", requestParallax, { passive: true });
    requestParallax();
});
