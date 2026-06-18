(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  ready(function () {
    var toggle = document.querySelector(".menu-toggle");
    if (toggle) {
      toggle.addEventListener("click", function () {
        var open = document.body.classList.toggle("menu-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }

    var hero = document.querySelector(".hero");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dots button"));
      var current = 0;
      var timer = null;

      function show(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("active", dotIndex === current);
        });
      }

      function restart() {
        if (timer) {
          window.clearInterval(timer);
        }
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5000);
      }

      var prev = hero.querySelector(".hero-arrow.prev");
      var next = hero.querySelector(".hero-arrow.next");
      if (prev) {
        prev.addEventListener("click", function () {
          show(current - 1);
          restart();
        });
      }
      if (next) {
        next.addEventListener("click", function () {
          show(current + 1);
          restart();
        });
      }
      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          show(index);
          restart();
        });
      });
      show(0);
      restart();
    }

    var filterForm = document.querySelector(".filter-form");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card[data-title]"));
    var empty = document.querySelector(".result-empty");

    if (filterForm && cards.length) {
      var keywordInput = filterForm.querySelector("[name='keyword']");
      var regionSelect = filterForm.querySelector("[name='region']");
      var typeSelect = filterForm.querySelector("[name='type']");
      var yearSelect = filterForm.querySelector("[name='year']");
      var clearButton = filterForm.querySelector("[data-clear-filter]");
      var params = new URLSearchParams(window.location.search);
      var initialQuery = params.get("q") || "";

      if (keywordInput && initialQuery) {
        keywordInput.value = initialQuery;
      }

      function normalize(value) {
        return String(value || "").trim().toLowerCase();
      }

      function applyFilter() {
        var keyword = normalize(keywordInput ? keywordInput.value : "");
        var region = normalize(regionSelect ? regionSelect.value : "");
        var type = normalize(typeSelect ? typeSelect.value : "");
        var year = normalize(yearSelect ? yearSelect.value : "");
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize([
            card.dataset.title,
            card.dataset.region,
            card.dataset.type,
            card.dataset.year,
            card.dataset.tags
          ].join(" "));
          var ok = true;
          if (keyword && haystack.indexOf(keyword) === -1) {
            ok = false;
          }
          if (region && normalize(card.dataset.region).indexOf(region) === -1) {
            ok = false;
          }
          if (type && normalize(card.dataset.type).indexOf(type) === -1) {
            ok = false;
          }
          if (year && normalize(card.dataset.year) !== year) {
            ok = false;
          }
          card.style.display = ok ? "" : "none";
          if (ok) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("active", visible === 0);
        }
      }

      filterForm.addEventListener("submit", function (event) {
        event.preventDefault();
        applyFilter();
      });
      [keywordInput, regionSelect, typeSelect, yearSelect].forEach(function (control) {
        if (control) {
          control.addEventListener("input", applyFilter);
          control.addEventListener("change", applyFilter);
        }
      });
      if (clearButton) {
        clearButton.addEventListener("click", function () {
          if (keywordInput) {
            keywordInput.value = "";
          }
          if (regionSelect) {
            regionSelect.value = "";
          }
          if (typeSelect) {
            typeSelect.value = "";
          }
          if (yearSelect) {
            yearSelect.value = "";
          }
          applyFilter();
        });
      }
      applyFilter();
    }

    Array.prototype.slice.call(document.querySelectorAll(".video-player")).forEach(function (player) {
      var video = player.querySelector("video");
      var overlay = player.querySelector(".player-overlay");
      var message = player.querySelector(".video-message");
      var stream = player.getAttribute("data-stream");
      var attached = false;
      var hlsInstance = null;

      function showMessage() {
        if (message) {
          message.classList.add("active");
        }
      }

      function bindStream() {
        if (!video || !stream || attached) {
          return;
        }
        attached = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.ERROR, function (_, data) {
            if (data && data.fatal) {
              if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                hlsInstance.recoverMediaError();
              } else {
                showMessage();
              }
            }
          });
          return;
        }
        showMessage();
      }

      function start() {
        bindStream();
        if (!video) {
          return;
        }
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
        video.setAttribute("controls", "controls");
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {
            if (overlay) {
              overlay.classList.remove("is-hidden");
            }
          });
        }
      }

      bindStream();

      if (overlay) {
        overlay.addEventListener("click", start);
      }
      if (video) {
        video.addEventListener("click", function () {
          if (video.paused) {
            start();
          } else {
            video.pause();
          }
        });
        video.addEventListener("play", function () {
          if (overlay) {
            overlay.classList.add("is-hidden");
          }
        });
        video.addEventListener("error", showMessage);
      }

      window.addEventListener("pagehide", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  });
})();
