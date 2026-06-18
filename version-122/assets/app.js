import { H as Hls } from "./hls.js";

const ready = (callback) => {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
  } else {
    callback();
  }
};

const normalize = (value) => {
  return (value || "").toString().trim().toLowerCase();
};

const setupMobileMenu = () => {
  const toggle = document.querySelector("[data-menu-toggle]");
  const drawer = document.querySelector("[data-mobile-drawer]");
  if (!toggle || !drawer) {
    return;
  }

  toggle.addEventListener("click", () => {
    drawer.classList.toggle("is-open");
  });
};

const setupSiteSearch = () => {
  document.querySelectorAll("[data-site-search]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const input = form.querySelector("input[name='q']");
      const query = input ? input.value.trim() : "";
      const target = new URL("search.html", window.location.href);
      if (query) {
        target.searchParams.set("q", query);
      }
      window.location.href = target.toString();
    });
  });
};

const setupHero = () => {
  const carousel = document.querySelector("[data-hero-carousel]");
  if (!carousel) {
    return;
  }

  const slides = Array.from(carousel.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(carousel.querySelectorAll("[data-hero-dot]"));
  const prev = carousel.querySelector("[data-hero-prev]");
  const next = carousel.querySelector("[data-hero-next]");
  let index = 0;
  let timer = null;

  const show = (nextIndex) => {
    if (!slides.length) {
      return;
    }

    index = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === index);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("is-active", dotIndex === index);
    });
  };

  const restart = () => {
    if (timer) {
      window.clearInterval(timer);
    }
    timer = window.setInterval(() => show(index + 1), 5000);
  };

  prev?.addEventListener("click", () => {
    show(index - 1);
    restart();
  });

  next?.addEventListener("click", () => {
    show(index + 1);
    restart();
  });

  dots.forEach((dot, dotIndex) => {
    dot.addEventListener("click", () => {
      show(dotIndex);
      restart();
    });
  });

  show(0);
  restart();
};

const updateFilterCount = (scope, countNode) => {
  if (!countNode) {
    return;
  }
  const visible = scope.querySelectorAll("[data-card]:not(.is-hidden)").length;
  countNode.textContent = `${visible} 部影片`;
};

const setupLocalFilters = () => {
  document.querySelectorAll("[data-filter-form]").forEach((form) => {
    const input = form.querySelector("[data-filter-input]");
    const scope = document.querySelector("[data-filter-scope]");
    const countNode = document.querySelector("[data-filter-count]");
    if (!input || !scope) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const query = params.get("q") || "";
    if (query && form.hasAttribute("data-search-page")) {
      input.value = query;
    }

    const applyFilter = () => {
      const term = normalize(input.value);
      scope.querySelectorAll("[data-card]").forEach((card) => {
        const text = normalize(card.getAttribute("data-filter-text") || card.textContent);
        card.classList.toggle("is-hidden", term !== "" && !text.includes(term));
      });
      updateFilterCount(scope, countNode);
    };

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      applyFilter();
    });

    input.addEventListener("input", applyFilter);
    applyFilter();
  });
};

const setupPlayers = () => {
  document.querySelectorAll("[data-player]").forEach((player) => {
    const video = player.querySelector("video");
    const button = player.querySelector("[data-player-start]");
    const src = player.getAttribute("data-video-src");
    let prepared = false;
    let hls = null;

    if (!video || !button || !src) {
      return;
    }

    const prepare = () => {
      if (prepared) {
        return;
      }

      prepared = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
      } else if (Hls && Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(src);
        hls.attachMedia(video);
      } else {
        video.src = src;
      }
    };

    const play = () => {
      prepare();
      player.classList.add("is-playing");
      video.controls = true;
      const attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(() => {});
      }
    };

    button.addEventListener("click", play);

    video.addEventListener("click", () => {
      if (video.paused) {
        play();
      }
    });

    window.addEventListener("beforeunload", () => {
      if (hls) {
        hls.destroy();
      }
    });
  });
};

ready(() => {
  setupMobileMenu();
  setupSiteSearch();
  setupHero();
  setupLocalFilters();
  setupPlayers();
});
