document.addEventListener("DOMContentLoaded", () => {
    document.body.classList.add("js-enabled");

    // A experiência não depende mais do player do YouTube.
    document.getElementById("youtube-player")?.remove();

    // Primeira fotografia: transforma a imagem existente em uma pequena
    // ficha de arquivo, sem alterar o conteúdo da história.
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

    // Se existir uma parte final intitulada apenas “NOS”, ela passa a ser
    // continuação editorial do capítulo 04, em vez de parecer um capítulo novo.
    const chapter4 = document.querySelector("#capitulo-04 .container");
    const nosHeading = [...document.querySelectorAll("h1, h2, h3")].find((heading) => {
        const text = heading.textContent.replace(/\s+/g, " ").trim().toUpperCase();
        return text === "NOS" && !heading.closest("#capitulo-04");
    });

    if (chapter4 && nosHeading) {
        const sourceSection = nosHeading.closest("section");
        const sourceContainer = nosHeading.closest(".container");
        const merged = document.createElement("div");
        merged.className = "merged-nos";

        const sourceHeader = nosHeading.closest(".chapter-header");
        let cursor = sourceHeader || nosHeading;
        merged.appendChild(cursor);

        while (cursor.nextElementSibling) {
            const next = cursor.nextElementSibling;
            merged.appendChild(next);
        }

        chapter4.appendChild(merged);

        // Remove somente a casca vazia que sobrou da antiga seção.
        if (sourceContainer && sourceContainer.children.length === 0 && sourceSection) {
            sourceSection.remove();
        }
    }

    // Cada parágrafo entra separadamente. O atraso reinicia em cada bloco,
    // evitando que textos longos fiquem esperando demais para aparecer.
    document.querySelectorAll(".text-body").forEach((block) => {
        block.querySelectorAll(":scope > p").forEach((paragraph, index) => {
            paragraph.classList.add("reveal", "reveal-paragraph");
            paragraph.style.setProperty("--p-delay", `${Math.min(index, 4) * 0.065}s`);
        });
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
                // Reaparece quando o leitor retorna ao trecho, mantendo o site vivo.
                entry.target.classList.toggle("active", entry.isIntersecting);
            });
        }, {
            threshold: 0.14,
            rootMargin: "0px 0px -10% 0px"
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
