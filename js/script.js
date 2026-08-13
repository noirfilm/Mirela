document.addEventListener("DOMContentLoaded", () => {
    document.body.classList.add("js-enabled");

    // Os dois traços da navegação funcionam como um controle discreto da trilha.
    const musicButton = document.querySelector(".menu-icon");
    const musicFrame = document.getElementById("youtube-player");

    if (musicButton && musicFrame) {
        let musicPlayer = null;
        let playerReady = false;
        let wantsMusic = false;

        musicButton.setAttribute("role", "button");
        musicButton.setAttribute("tabindex", "0");
        musicButton.setAttribute("aria-label", "Tocar música de fundo");
        musicButton.setAttribute("aria-pressed", "false");

        musicFrame.setAttribute("title", "Música de fundo");
        musicFrame.setAttribute("aria-hidden", "true");
        musicFrame.setAttribute("tabindex", "-1");
        musicFrame.setAttribute("allow", "autoplay; encrypted-media");
        musicFrame.width = "1";
        musicFrame.height = "1";
        Object.assign(musicFrame.style, {
            position: "fixed",
            left: "-9999px",
            bottom: "0",
            width: "1px",
            height: "1px",
            opacity: "0",
            pointerEvents: "none"
        });

        const playerUrl = new URL(musicFrame.src);
        playerUrl.searchParams.set("controls", "0");
        playerUrl.searchParams.set("playsinline", "1");
        playerUrl.searchParams.set("origin", window.location.origin);
        musicFrame.src = playerUrl.toString();

        const updateMusicButton = (playing) => {
            musicButton.classList.toggle("music-playing", playing);
            musicButton.setAttribute("aria-pressed", String(playing));
            musicButton.setAttribute(
                "aria-label",
                playing ? "Pausar música de fundo" : "Tocar música de fundo"
            );
        };

        const toggleMusic = () => {
            wantsMusic = !wantsMusic;
            updateMusicButton(wantsMusic);

            if (!playerReady || !musicPlayer) return;

            if (wantsMusic) {
                musicPlayer.unMute();
                musicPlayer.setVolume(20);
                musicPlayer.playVideo();
            } else {
                musicPlayer.pauseVideo();
            }
        };

        musicButton.addEventListener("click", toggleMusic);
        musicButton.addEventListener("keydown", (event) => {
            if (event.key !== "Enter" && event.key !== " ") return;
            event.preventDefault();
            toggleMusic();
        });

        const initializeMusicPlayer = () => {
            if (musicPlayer || !window.YT || typeof window.YT.Player !== "function") return;

            musicPlayer = new window.YT.Player("youtube-player", {
                events: {
                    onReady: (event) => {
                        playerReady = true;
                        event.target.setVolume(20);

                        if (wantsMusic) {
                            event.target.unMute();
                            event.target.playVideo();
                        }
                    },
                    onStateChange: (event) => {
                        if (event.data === window.YT.PlayerState.PLAYING) {
                            wantsMusic = true;
                            updateMusicButton(true);
                        } else if (event.data === window.YT.PlayerState.PAUSED) {
                            wantsMusic = false;
                            updateMusicButton(false);
                        } else if (event.data === window.YT.PlayerState.ENDED && wantsMusic) {
                            event.target.seekTo(0, true);
                            event.target.playVideo();
                        }
                    },
                    onError: () => {
                        wantsMusic = false;
                        updateMusicButton(false);
                    }
                }
            });
        };

        const previousYouTubeReady = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => {
            if (typeof previousYouTubeReady === "function") previousYouTubeReady();
            initializeMusicPlayer();
        };

        if (window.YT && typeof window.YT.Player === "function") {
            initializeMusicPlayer();
        } else if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
            const apiScript = document.createElement("script");
            apiScript.src = "https://www.youtube.com/iframe_api";
            document.head.appendChild(apiScript);
        }
    }

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
