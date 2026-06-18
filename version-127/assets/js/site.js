(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function text(value) {
    return (value || "").toString().toLowerCase();
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        menu.classList.toggle("is-open");
      });
    }

    var backTop = document.querySelector("[data-back-top]");
    if (backTop) {
      window.addEventListener("scroll", function () {
        if (window.scrollY > 360) {
          backTop.classList.add("is-visible");
        } else {
          backTop.classList.remove("is-visible");
        }
      });
      backTop.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var current = 0;
      var timer = null;
      var activate = function (index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle("active", i === current);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle("active", i === current);
        });
      };
      var start = function () {
        timer = window.setInterval(function () {
          activate(current + 1);
        }, 5200);
      };
      dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
          if (timer) {
            window.clearInterval(timer);
          }
          activate(i);
          start();
        });
      });
      if (slides.length) {
        activate(0);
        start();
      }
    }

    Array.prototype.slice.call(document.querySelectorAll("[data-home-search]")).forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input");
        var query = input ? input.value.trim() : "";
        window.location.href = query ? "movies.html?q=" + encodeURIComponent(query) : "movies.html";
      });
    });

    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
    panels.forEach(function (panel) {
      var root = panel.parentElement || document;
      var search = panel.querySelector("[data-filter-search]");
      var year = panel.querySelector("[data-filter-year]");
      var type = panel.querySelector("[data-filter-type]");
      var genre = panel.querySelector("[data-filter-genre]");
      var clear = panel.querySelector("[data-filter-clear]");
      var cards = Array.prototype.slice.call(root.querySelectorAll("[data-title]"));
      var empty = root.querySelector("[data-empty-result]");
      var params = new URLSearchParams(window.location.search);
      var initial = params.get("q");

      if (search && initial) {
        search.value = initial;
      }

      var apply = function () {
        var q = text(search && search.value);
        var y = text(year && year.value);
        var t = text(type && type.value);
        var g = text(genre && genre.value);
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute("data-title"),
            card.getAttribute("data-year"),
            card.getAttribute("data-type"),
            card.getAttribute("data-genre"),
            card.getAttribute("data-region")
          ].join(" ").toLowerCase();
          var ok = true;

          if (q && haystack.indexOf(q) === -1) {
            ok = false;
          }
          if (y && text(card.getAttribute("data-year")) !== y) {
            ok = false;
          }
          if (t && text(card.getAttribute("data-type")) !== t) {
            ok = false;
          }
          if (g && text(card.getAttribute("data-genre")).indexOf(g) === -1) {
            ok = false;
          }

          card.style.display = ok ? "" : "none";
          if (ok) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      };

      [search, year, type, genre].forEach(function (field) {
        if (field) {
          field.addEventListener("input", apply);
          field.addEventListener("change", apply);
        }
      });

      if (clear) {
        clear.addEventListener("click", function () {
          if (search) {
            search.value = "";
          }
          if (year) {
            year.value = "";
          }
          if (type) {
            type.value = "";
          }
          if (genre) {
            genre.value = "";
          }
          apply();
        });
      }

      apply();
    });
  });
})();

function initMoviePlayer(source) {
  var video = document.getElementById("movieVideo");
  var cover = document.querySelector("[data-player-cover]");
  var button = document.querySelector("[data-player-button]");
  var mounted = false;
  var hlsInstance = null;

  if (!video || !source) {
    return;
  }

  function mount() {
    if (mounted) {
      return;
    }
    mounted = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({ enableWorker: true });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
    } else {
      video.src = source;
    }
  }

  function start() {
    mount();
    if (cover) {
      cover.classList.add("is-hidden");
    }
    var result = video.play();
    if (result && typeof result.catch === "function") {
      result.catch(function () {});
    }
  }

  if (cover) {
    cover.addEventListener("click", start);
  }
  if (button) {
    button.addEventListener("click", function (event) {
      event.stopPropagation();
      start();
    });
  }
  video.addEventListener("click", function () {
    if (video.paused) {
      start();
    }
  });
  window.addEventListener("pagehide", function () {
    if (hlsInstance && typeof hlsInstance.destroy === "function") {
      hlsInstance.destroy();
    }
  });
}
