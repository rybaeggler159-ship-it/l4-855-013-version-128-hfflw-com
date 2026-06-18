(function () {
  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function setupMobileNav() {
    var toggle = qs('.mobile-nav-toggle');
    var nav = qs('.mobile-nav');

    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  function setupBackToTop() {
    var button = qs('.back-to-top');

    if (!button) {
      return;
    }

    window.addEventListener('scroll', function () {
      if (window.scrollY > 360) {
        button.classList.add('is-visible');
      } else {
        button.classList.remove('is-visible');
      }
    });

    button.addEventListener('click', function () {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  function setupHeroSlider() {
    var slider = qs('[data-hero-slider]');

    if (!slider) {
      return;
    }

    var slides = qsa('.hero-slide', slider);
    var dots = qsa('.hero-dot', slider);
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      if (slides.length <= 1) {
        return;
      }

      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        stop();
        show(index);
        start();
      });
    });

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);

    show(0);
    start();
  }

  function setupImageFallbacks() {
    qsa('img').forEach(function (image) {
      image.addEventListener('error', function () {
        var holder = image.closest('.poster-wrap');
        if (holder) {
          holder.classList.add('cover-missing');
        }
      });
    });
  }

  function setupFilters() {
    var panel = qs('#movie-filter');
    var grid = qs('[data-movie-grid]');

    if (!panel || !grid) {
      return;
    }

    var keyword = qs('#filter-keyword', panel);
    var region = qs('#filter-region', panel);
    var type = qs('#filter-type', panel);
    var year = qs('#filter-year', panel);
    var clear = qs('#filter-clear', panel);
    var count = qs('[data-filter-count]', panel);
    var cards = qsa('.movie-card', grid);
    var empty = document.createElement('div');

    empty.className = 'empty-state';
    empty.textContent = '没有找到匹配的影片，请尝试更换关键词或筛选条件。';
    grid.parentNode.insertBefore(empty, grid.nextSibling);

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');

    if (query && keyword) {
      keyword.value = query;
    }

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function apply() {
      var keywordValue = normalize(keyword && keyword.value);
      var regionValue = normalize(region && region.value);
      var typeValue = normalize(type && type.value);
      var yearValue = normalize(year && year.value);
      var visible = 0;

      cards.forEach(function (card) {
        var searchText = normalize(card.getAttribute('data-search'));
        var cardRegion = normalize(card.getAttribute('data-region'));
        var cardType = normalize(card.getAttribute('data-type'));
        var cardYear = normalize(card.getAttribute('data-year'));
        var matched = true;

        if (keywordValue && searchText.indexOf(keywordValue) === -1) {
          matched = false;
        }

        if (regionValue && cardRegion !== regionValue) {
          matched = false;
        }

        if (typeValue && cardType !== typeValue) {
          matched = false;
        }

        if (yearValue && cardYear !== yearValue) {
          matched = false;
        }

        card.classList.toggle('is-hidden', !matched);

        if (matched) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = '当前显示 ' + visible + ' / ' + cards.length + ' 部影片';
      }

      empty.classList.toggle('is-visible', visible === 0);
    }

    [keyword, region, type, year].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    if (clear) {
      clear.addEventListener('click', function () {
        [keyword, region, type, year].forEach(function (control) {
          if (control) {
            control.value = '';
          }
        });
        apply();
      });
    }

    apply();
  }

  function setupPlayer() {
    qsa('[data-player]').forEach(function (player) {
      var video = qs('video', player);
      var button = qs('[data-play-button]', player);
      var message = qs('[data-player-message]', player);
      var source = player.getAttribute('data-m3u8');
      var hlsInstance = null;

      if (!video || !button || !source) {
        return;
      }

      function showMessage(text) {
        if (!message) {
          return;
        }

        message.textContent = text;
        message.classList.add('is-visible');
      }

      function playVideo() {
        button.classList.add('is-hidden');
        video.setAttribute('controls', 'controls');

        if (hlsInstance) {
          hlsInstance.destroy();
          hlsInstance = null;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });

          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {
              showMessage('浏览器阻止了自动播放，请再次点击视频播放。');
            });
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              showMessage('播放源暂时无法加载，请稍后重试。');
            }
          });
          return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.addEventListener('loadedmetadata', function () {
            video.play().catch(function () {
              showMessage('浏览器阻止了自动播放，请再次点击视频播放。');
            });
          }, { once: true });
          return;
        }

        showMessage('当前浏览器不支持 HLS 播放，请更换支持 HLS 的浏览器。');
      }

      button.addEventListener('click', playVideo);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileNav();
    setupBackToTop();
    setupHeroSlider();
    setupImageFallbacks();
    setupFilters();
    setupPlayer();
  });
}());
