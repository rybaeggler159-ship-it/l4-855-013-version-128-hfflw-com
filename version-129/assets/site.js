(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-button]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function setupBackTop() {
    var button = document.querySelector("[data-back-top]");
    if (!button) {
      return;
    }
    function sync() {
      if (window.scrollY > 360) {
        button.classList.add("show");
      } else {
        button.classList.remove("show");
      }
    }
    window.addEventListener("scroll", sync, { passive: true });
    button.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    sync();
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (slides.length === 0) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        if (timer) {
          window.clearInterval(timer);
        }
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5600);
      });
    });

    show(0);
    timer = window.setInterval(function () {
      show(index + 1);
    }, 5600);
  }

  function normalize(value) {
    return String(value || "").toLowerCase();
  }

  function setupFilters() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll(".js-movie-search"));
    var regions = Array.prototype.slice.call(document.querySelectorAll(".js-region-filter"));
    var years = Array.prototype.slice.call(document.querySelectorAll(".js-year-filter"));
    var controls = inputs.concat(regions).concat(years);

    function filter(gridId) {
      var grid = document.getElementById(gridId);
      if (!grid) {
        return;
      }
      var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
      var search = document.querySelector('.js-movie-search[data-grid="' + gridId + '"]');
      var region = document.querySelector('.js-region-filter[data-grid="' + gridId + '"]');
      var year = document.querySelector('.js-year-filter[data-grid="' + gridId + '"]');
      var q = normalize(search ? search.value : "");
      var selectedRegion = region ? region.value : "";
      var selectedYear = year ? year.value : "";
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute("data-search"));
        var cardRegion = card.getAttribute("data-region") || "";
        var cardYear = card.getAttribute("data-year") || "";
        var okSearch = !q || haystack.indexOf(q) !== -1;
        var okRegion = !selectedRegion || cardRegion.indexOf(selectedRegion) !== -1;
        var okYear = !selectedYear || cardYear.indexOf(selectedYear) === 0;
        var show = okSearch && okRegion && okYear;
        card.style.display = show ? "" : "none";
        if (show) {
          visible += 1;
        }
      });

      var empty = document.querySelector('[data-empty-for="' + gridId + '"]');
      if (empty) {
        empty.classList.toggle("show", visible === 0);
      }
    }

    controls.forEach(function (control) {
      var gridId = control.getAttribute("data-grid");
      control.addEventListener("input", function () {
        filter(gridId);
      });
      control.addEventListener("change", function () {
        filter(gridId);
      });
    });

    inputs.forEach(function (input) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");
      if (q && input.getAttribute("data-grid") === "search-grid") {
        input.value = q;
        filter("search-grid");
      }
    });
  }

  ready(function () {
    setupMenu();
    setupBackTop();
    setupHero();
    setupFilters();
  });

  window.initMoviePlayer = function (videoId, overlayId, source) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    if (!video || !overlay || !source) {
      return;
    }

    var hlsInstance = null;
    var initialized = false;

    function attach() {
      if (initialized) {
        return;
      }
      initialized = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls();
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        return;
      }

      video.src = source;
    }

    function start() {
      attach();
      overlay.classList.add("is-hidden");
      var playResult = video.play();
      if (playResult && typeof playResult.catch === "function") {
        playResult.catch(function () {});
      }
    }

    overlay.addEventListener("click", start);
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
  };
})();