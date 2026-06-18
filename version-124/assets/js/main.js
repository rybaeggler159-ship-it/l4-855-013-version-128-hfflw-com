(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var menuButton = document.querySelector("[data-menu-button]");
        var mobileNav = document.querySelector("[data-mobile-nav]");

        if (menuButton && mobileNav) {
            menuButton.addEventListener("click", function () {
                var expanded = menuButton.getAttribute("aria-expanded") === "true";
                menuButton.setAttribute("aria-expanded", String(!expanded));
                mobileNav.classList.toggle("is-open");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        var nextButton = document.querySelector("[data-hero-next]");
        var prevButton = document.querySelector("[data-hero-prev]");
        var activeIndex = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            activeIndex = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === activeIndex);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === activeIndex);
                dot.setAttribute("aria-selected", String(dotIndex === activeIndex));
            });
        }

        function startHero() {
            if (timer || slides.length < 2) {
                return;
            }

            timer = window.setInterval(function () {
                showSlide(activeIndex + 1);
            }, 5200);
        }

        function restartHero() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
            startHero();
        }

        if (slides.length) {
            showSlide(0);
            startHero();

            if (nextButton) {
                nextButton.addEventListener("click", function () {
                    showSlide(activeIndex + 1);
                    restartHero();
                });
            }

            if (prevButton) {
                prevButton.addEventListener("click", function () {
                    showSlide(activeIndex - 1);
                    restartHero();
                });
            }

            dots.forEach(function (dot, index) {
                dot.addEventListener("click", function () {
                    showSlide(index);
                    restartHero();
                });
            });
        }

        var filterInput = document.querySelector("[data-filter-input]");
        var filterType = document.querySelector("[data-filter-type]");
        var filterRegion = document.querySelector("[data-filter-region]");
        var filterCards = Array.prototype.slice.call(document.querySelectorAll("[data-filter-card]"));

        function normalize(value) {
            return String(value || "").trim().toLowerCase();
        }

        function applyFilters() {
            var query = normalize(filterInput ? filterInput.value : "");
            var typeValue = normalize(filterType ? filterType.value : "");
            var regionValue = normalize(filterRegion ? filterRegion.value : "");

            filterCards.forEach(function (card) {
                var searchable = normalize(card.getAttribute("data-search"));
                var cardType = normalize(card.getAttribute("data-type"));
                var cardRegion = normalize(card.getAttribute("data-region"));
                var matchesQuery = !query || searchable.indexOf(query) !== -1;
                var matchesType = !typeValue || cardType.indexOf(typeValue) !== -1;
                var matchesRegion = !regionValue || cardRegion.indexOf(regionValue) !== -1;
                card.classList.toggle("hidden-by-filter", !(matchesQuery && matchesType && matchesRegion));
            });
        }

        if (filterInput || filterType || filterRegion) {
            var params = new URLSearchParams(window.location.search);
            var initialQuery = params.get("q");

            if (initialQuery && filterInput) {
                filterInput.value = initialQuery;
            }

            [filterInput, filterType, filterRegion].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", applyFilters);
                    control.addEventListener("change", applyFilters);
                }
            });

            applyFilters();
        }
    });
})();
