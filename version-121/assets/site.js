(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var toggle = document.querySelector("[data-menu-toggle]");
        var mobileNav = document.querySelector("[data-mobile-nav]");
        if (toggle && mobileNav) {
            toggle.addEventListener("click", function () {
                mobileNav.classList.toggle("is-open");
            });
        }

        var hero = document.querySelector("[data-hero-slider]");
        if (hero) {
            var slides = selectAll(".hero-slide", hero);
            var dotsWrap = hero.querySelector("[data-hero-dots]");
            var index = 0;
            var timer = null;

            function activate(nextIndex) {
                if (!slides.length) {
                    return;
                }
                index = (nextIndex + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === index);
                });
                selectAll("button", dotsWrap).forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === index);
                });
            }

            function start() {
                stop();
                timer = window.setInterval(function () {
                    activate(index + 1);
                }, 5200);
            }

            function stop() {
                if (timer) {
                    window.clearInterval(timer);
                    timer = null;
                }
            }

            if (dotsWrap) {
                slides.forEach(function (_, slideIndex) {
                    var dot = document.createElement("button");
                    dot.type = "button";
                    dot.setAttribute("aria-label", "切换推荐" + (slideIndex + 1));
                    dot.addEventListener("click", function () {
                        activate(slideIndex);
                        start();
                    });
                    dotsWrap.appendChild(dot);
                });
            }

            var next = hero.querySelector("[data-hero-next]");
            var prev = hero.querySelector("[data-hero-prev]");
            if (next) {
                next.addEventListener("click", function () {
                    activate(index + 1);
                    start();
                });
            }
            if (prev) {
                prev.addEventListener("click", function () {
                    activate(index - 1);
                    start();
                });
            }
            hero.addEventListener("mouseenter", stop);
            hero.addEventListener("mouseleave", start);
            activate(0);
            start();
        }

        selectAll("[data-search-input]").forEach(function (input) {
            input.addEventListener("input", function () {
                var scopeName = input.getAttribute("data-search-scope");
                var scope = document.querySelector('[data-filter-scope="' + scopeName + '"]') || document;
                var query = input.value.trim().toLowerCase();
                var cards = selectAll(".movie-card", scope);
                var visible = 0;
                cards.forEach(function (card) {
                    var text = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
                    var matched = !query || text.indexOf(query) !== -1;
                    card.style.display = matched ? "" : "none";
                    if (matched) {
                        visible += 1;
                    }
                });
                var empty = scope.querySelector("[data-empty-state]");
                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            });
        });
    });

    window.MovieSite = {
        initPlayer: function (options) {
            ready(function () {
                var video = document.getElementById(options.videoId);
                var overlay = document.getElementById(options.overlayId);
                var loaded = false;
                var hlsInstance = null;

                if (!video || !options.source) {
                    return;
                }

                function bindSource() {
                    if (loaded) {
                        return;
                    }
                    loaded = true;
                    if (video.canPlayType("application/vnd.apple.mpegurl")) {
                        video.src = options.source;
                    } else if (window.Hls && window.Hls.isSupported()) {
                        hlsInstance = new window.Hls({
                            enableWorker: true,
                            lowLatencyMode: true
                        });
                        hlsInstance.loadSource(options.source);
                        hlsInstance.attachMedia(video);
                    } else {
                        video.src = options.source;
                    }
                }

                function playVideo() {
                    bindSource();
                    if (overlay) {
                        overlay.classList.add("is-hidden");
                    }
                    var playPromise = video.play();
                    if (playPromise && typeof playPromise.catch === "function") {
                        playPromise.catch(function () {
                            if (overlay) {
                                overlay.classList.remove("is-hidden");
                            }
                        });
                    }
                }

                if (overlay) {
                    overlay.addEventListener("click", playVideo);
                }

                video.addEventListener("click", function () {
                    if (video.paused) {
                        playVideo();
                    } else {
                        video.pause();
                    }
                });

                video.addEventListener("play", function () {
                    if (overlay) {
                        overlay.classList.add("is-hidden");
                    }
                });

                video.addEventListener("pause", function () {
                    if (overlay && video.currentTime === 0) {
                        overlay.classList.remove("is-hidden");
                    }
                });

                window.addEventListener("pagehide", function () {
                    if (hlsInstance && typeof hlsInstance.destroy === "function") {
                        hlsInstance.destroy();
                    }
                });
            });
        }
    };
}());
