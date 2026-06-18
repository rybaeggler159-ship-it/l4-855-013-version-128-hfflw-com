
(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var button = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".mobile-nav");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function initHero() {
    var hero = document.querySelector(".hero-carousel");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var prev = hero.querySelector(".hero-prev");
    var next = hero.querySelector(".hero-next");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll(".filter-panel"));
    panels.forEach(function (panel) {
      var targetSelector = panel.getAttribute("data-target") || "#movie-list";
      var target = document.querySelector(targetSelector);
      if (!target) {
        return;
      }
      var cards = Array.prototype.slice.call(target.querySelectorAll(".movie-card"));
      var search = panel.querySelector(".js-search");
      var region = panel.querySelector(".js-region-filter");
      var year = panel.querySelector(".js-year-filter");
      var reset = panel.querySelector(".filter-reset");
      var empty = target.parentElement ? target.parentElement.querySelector(".empty-result") : null;

      function apply() {
        var query = search ? search.value.trim().toLowerCase() : "";
        var regionValue = region ? region.value.trim() : "";
        var yearValue = year ? year.value.trim() : "";
        var visible = 0;
        cards.forEach(function (card) {
          var text = (card.getAttribute("data-search") || "").toLowerCase();
          var cardRegion = card.getAttribute("data-region") || "";
          var cardYear = card.getAttribute("data-year") || "";
          var matchQuery = !query || text.indexOf(query) !== -1;
          var matchRegion = !regionValue || cardRegion.indexOf(regionValue) !== -1;
          var matchYear = !yearValue || cardYear === yearValue;
          var ok = matchQuery && matchRegion && matchYear;
          card.hidden = !ok;
          if (ok) {
            visible += 1;
          }
        });
        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      if (search) {
        search.addEventListener("input", apply);
      }
      if (region) {
        region.addEventListener("change", apply);
      }
      if (year) {
        year.addEventListener("change", apply);
      }
      if (reset) {
        reset.addEventListener("click", function () {
          if (search) {
            search.value = "";
          }
          if (region) {
            region.value = "";
          }
          if (year) {
            year.value = "";
          }
          apply();
        });
      }
      apply();
    });
  }

  window.initMoviePlayer = function (config) {
    ready(function () {
      var video = document.getElementById("movie-video");
      var overlay = document.getElementById("play-overlay");
      if (!video || !config || !config.source) {
        return;
      }
      var attached = false;

      function attach() {
        if (attached) {
          return;
        }
        attached = true;
        if (config.poster) {
          video.setAttribute("poster", config.poster);
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = config.source;
          video.load();
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            capLevelToPlayerSize: true,
            lowLatencyMode: true
          });
          hls.loadSource(config.source);
          hls.attachMedia(video);
          video._hls = hls;
          return;
        }
        video.src = config.source;
        video.load();
      }

      function play() {
        attach();
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {});
        }
      }

      if (overlay) {
        overlay.addEventListener("click", play);
      }
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener("play", function () {
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
      });
    });
  };

  ready(function () {
    initMenu();
    initHero();
    initFilters();
  });
})();
