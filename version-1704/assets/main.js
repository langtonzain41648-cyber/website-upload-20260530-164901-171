(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function loadHlsScript() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }
    if (window.__hlsLoading) {
      return window.__hlsLoading;
    }
    window.__hlsLoading = new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js';
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
    return window.__hlsLoading;
  }

  window.initPlayer = function (playUrl) {
    var video = qs('.site-video');
    var overlay = qs('.play-overlay');
    var started = false;
    var hls = null;

    if (!video || !playUrl) {
      return;
    }

    function begin() {
      if (overlay) {
        overlay.hidden = true;
      }
      if (started) {
        video.play().catch(function () {});
        return;
      }
      started = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = playUrl;
        video.play().catch(function () {});
        return;
      }
      loadHlsScript().then(function (Hls) {
        if (Hls && Hls.isSupported()) {
          hls = new Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(playUrl);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
          hls.on(Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal) {
              return;
            }
            if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else {
              hls.destroy();
            }
          });
        } else {
          video.src = playUrl;
          video.play().catch(function () {});
        }
      }).catch(function () {
        video.src = playUrl;
        video.play().catch(function () {});
      });
    }

    if (overlay) {
      overlay.addEventListener('click', begin);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        begin();
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  function initNavigation() {
    var button = qs('.nav-toggle');
    var menu = qs('.mobile-nav');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('open');
      button.textContent = menu.classList.contains('open') ? '×' : '☰';
    });
  }

  function initHero() {
    var slides = qsa('.hero-slide');
    var dots = qsa('.hero-dots button');
    if (!slides.length) {
      return;
    }
    var active = 0;
    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === active);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });
    show(0);
    setInterval(function () {
      show(active + 1);
    }, 5600);
  }

  function initSearch() {
    var inputs = qsa('.site-search');
    if (!inputs.length) {
      return;
    }
    var cards = qsa('.movie-card, .horizontal-card, .ranking-row');
    var empty = qs('.empty-state');
    var selects = qsa('.filter-select');

    function matches(card, query, filters) {
      var haystack = [
        card.getAttribute('data-title') || '',
        card.getAttribute('data-tags') || '',
        card.textContent || ''
      ].join(' ').toLowerCase();
      var okQuery = !query || haystack.indexOf(query) !== -1;
      var okRegion = !filters.region || (card.getAttribute('data-region') || '') === filters.region;
      var okType = !filters.type || (card.getAttribute('data-type') || '') === filters.type;
      return okQuery && okRegion && okType;
    }

    function apply() {
      var query = (inputs[0].value || '').trim().toLowerCase();
      var filters = { region: '', type: '' };
      selects.forEach(function (select) {
        filters[select.getAttribute('data-filter')] = select.value;
      });
      var visible = 0;
      cards.forEach(function (card) {
        var ok = matches(card, query, filters);
        card.classList.toggle('hidden-card', !ok);
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('show', visible === 0);
      }
    }

    inputs.forEach(function (input) {
      input.addEventListener('input', apply);
    });
    selects.forEach(function (select) {
      select.addEventListener('change', apply);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initNavigation();
    initHero();
    initSearch();
  });
})();
