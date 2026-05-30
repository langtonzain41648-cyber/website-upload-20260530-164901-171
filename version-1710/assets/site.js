(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMenu() {
    var toggle = qs('.menu-toggle');
    var panel = qs('.mobile-panel');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  function setupHero() {
    var shell = qs('[data-hero]');
    if (!shell) {
      return;
    }
    var slides = qsa('[data-hero-slide]', shell);
    var dots = qsa('[data-hero-dot]', shell);
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function restart() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    var prev = qs('[data-hero-prev]', shell);
    var next = qs('[data-hero-next]', shell);
    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        restart();
      });
    });
    restart();
  }

  function setupSearch() {
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    qsa('form[action="./search.html"] input[name="q"]').forEach(function (input) {
      if (query) {
        input.value = query;
      }
    });
    var results = qsa('.search-results .movie-card');
    if (!results.length) {
      return;
    }
    var status = qs('.search-status');
    var normalized = query.toLowerCase();
    results.forEach(function (card) {
      var text = [
        card.getAttribute('data-title'),
        card.getAttribute('data-tags'),
        card.getAttribute('data-year'),
        card.getAttribute('data-region'),
        card.getAttribute('data-genre')
      ].join(' ').toLowerCase();
      var match = !normalized || text.indexOf(normalized) !== -1;
      card.style.display = match ? '' : 'none';
    });
    if (status) {
      status.textContent = query ? '当前关键词：' + query : '精选内容';
    }
  }

  function attachNative(video, src) {
    video.src = src;
  }

  function setupPlayers() {
    qsa('.video-player').forEach(function (box) {
      var video = qs('video', box);
      var button = qs('.play-overlay', box);
      var src = box.getAttribute('data-video-src');
      var hls = null;
      var ready = false;

      function prepare() {
        if (ready || !video || !src) {
          return;
        }
        ready = true;
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(src);
          hls.attachMedia(video);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          attachNative(video, src);
        } else {
          attachNative(video, src);
        }
      }

      function play() {
        prepare();
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {});
        }
      }

      if (button) {
        button.addEventListener('click', play);
      }
      if (video) {
        video.addEventListener('click', function () {
          if (video.paused) {
            play();
          }
        });
        video.addEventListener('play', function () {
          box.classList.add('playing');
        });
        video.addEventListener('pause', function () {
          box.classList.remove('playing');
        });
      }
      box.addEventListener('mouseenter', prepare, { once: true });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupSearch();
    setupPlayers();
  });
})();
