(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initNav() {
    var toggle = qs("[data-nav-toggle]");
    var menu = qs("[data-nav-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("open");
    });
  }

  function initHero() {
    var hero = qs("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = qsa("[data-hero-slide]", hero);
    var dots = qsa("[data-hero-dot]", hero);
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    function play() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var next = Number(dot.getAttribute("data-hero-dot"));
        show(next);
        play();
      });
    });

    show(0);
    play();
  }

  function initFilters() {
    qsa("[data-filter-scope]").forEach(function (bar) {
      var scope = bar.getAttribute("data-filter-scope");
      var grid = qs('[data-card-grid="' + scope + '"]');
      var input = qs("[data-search-input]", bar);
      var year = qs("[data-year-filter]", bar);
      if (!grid) {
        return;
      }
      var cards = qsa("[data-card]", grid);

      function apply() {
        var keyword = input ? input.value.trim().toLowerCase() : "";
        var selectedYear = year ? year.value : "";
        cards.forEach(function (card) {
          var text = ((card.getAttribute("data-title") || "") + " " + (card.getAttribute("data-meta") || "")).toLowerCase();
          var cardYear = card.getAttribute("data-year") || "";
          var okKeyword = !keyword || text.indexOf(keyword) !== -1;
          var okYear = !selectedYear || cardYear === selectedYear;
          card.classList.toggle("is-filtered-out", !(okKeyword && okYear));
        });
      }

      if (input) {
        input.addEventListener("input", apply);
      }
      if (year) {
        year.addEventListener("change", apply);
      }
    });
  }

  window.MoviePlayer = {
    init: function (videoId, buttonId, overlayId, source) {
      var video = document.getElementById(videoId);
      var button = document.getElementById(buttonId);
      var overlay = document.getElementById(overlayId);
      if (!video || !button || !overlay || !source) {
        return;
      }
      var loaded = false;
      var hlsInstance = null;

      function attach() {
        if (loaded) {
          return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            maxBufferLength: 30
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
        } else {
          video.src = source;
        }
        loaded = true;
      }

      function start() {
        attach();
        overlay.classList.add("is-hidden");
        video.controls = true;
        var request = video.play();
        if (request && request.catch) {
          request.catch(function () {});
        }
      }

      button.addEventListener("click", start);
      overlay.addEventListener("click", start);
      video.addEventListener("play", function () {
        overlay.classList.add("is-hidden");
      });
      video.addEventListener("click", function () {
        if (!loaded || video.paused) {
          start();
        }
      });
      window.addEventListener("pagehide", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    }
  };

  document.addEventListener("DOMContentLoaded", function () {
    initNav();
    initHero();
    initFilters();
  });
})();
