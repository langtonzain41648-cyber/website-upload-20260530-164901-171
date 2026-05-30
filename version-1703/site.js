(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function initNavigation() {
    var button = document.querySelector(".menu-toggle");
    var menu = document.querySelector(".mobile-nav");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      var open = menu.classList.toggle("is-open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function initHeroSlider() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
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

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function fillSelect(select, values) {
    if (!select) {
      return;
    }
    values.forEach(function (value) {
      if (!value) {
        return;
      }
      var option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function initFilters() {
    var panel = document.querySelector("[data-filter-panel]");
    if (!panel) {
      return;
    }
    var input = panel.querySelector("[data-filter-input]");
    var yearSelect = panel.querySelector("[data-filter-year]");
    var typeSelect = panel.querySelector("[data-filter-type]");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".filter-grid .movie-card, .filter-grid .rank-card"));
    var years = [];
    var types = [];
    var yearMap = {};
    var typeMap = {};

    cards.forEach(function (card) {
      var year = card.getAttribute("data-year") || "";
      var type = card.getAttribute("data-type") || "";
      if (year && !yearMap[year]) {
        yearMap[year] = true;
        years.push(year);
      }
      if (type && !typeMap[type]) {
        typeMap[type] = true;
        types.push(type);
      }
    });

    years.sort(function (a, b) {
      return Number(b) - Number(a);
    });
    types.sort();
    fillSelect(yearSelect, years);
    fillSelect(typeSelect, types);

    function applyFilter() {
      var keyword = normalize(input && input.value);
      var yearValue = yearSelect ? yearSelect.value : "";
      var typeValue = typeSelect ? typeSelect.value : "";
      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-year"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-genre"),
          card.textContent
        ].join(" "));
        var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchedYear = !yearValue || card.getAttribute("data-year") === yearValue;
        var matchedType = !typeValue || card.getAttribute("data-type") === typeValue;
        card.classList.toggle("is-hidden-by-filter", !(matchedKeyword && matchedYear && matchedType));
      });
    }

    if (input) {
      input.addEventListener("input", applyFilter);
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q");
      if (query) {
        input.value = query;
      }
    }
    if (yearSelect) {
      yearSelect.addEventListener("change", applyFilter);
    }
    if (typeSelect) {
      typeSelect.addEventListener("change", applyFilter);
    }
    applyFilter();
  }

  window.initMoviePlayer = function (videoId, videoUrl) {
    var video = document.getElementById(videoId);
    if (!video || !videoUrl) {
      return;
    }
    var overlay = document.querySelector('[data-play-target="' + videoId + '"]');
    var prepared = false;
    var hls = null;

    function prepare() {
      if (prepared) {
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(videoUrl);
        hls.attachMedia(video);
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = videoUrl;
      } else {
        video.src = videoUrl;
      }
      prepared = true;
    }

    function start() {
      prepare();
      if (overlay) {
        overlay.hidden = true;
      }
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          if (overlay) {
            overlay.hidden = false;
          }
        });
      }
    }

    if (overlay) {
      overlay.addEventListener("click", start);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
    video.addEventListener("play", function () {
      if (overlay) {
        overlay.hidden = true;
      }
    });
    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  };

  ready(function () {
    initNavigation();
    initHeroSlider();
    initFilters();
  });
})();
