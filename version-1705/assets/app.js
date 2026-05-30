(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-global-search]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('input[name="q"]');
      var value = input ? input.value.trim() : '';
      var target = './categories.html';
      if (value) {
        target += '?q=' + encodeURIComponent(value);
      }
      window.location.href = target;
    });
  });

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  var filterInputs = Array.prototype.slice.call(document.querySelectorAll('[data-filter-input]'));
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-category-filter]'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
  var selectedCategory = 'all';

  function applyFilters() {
    var query = filterInputs.map(function (input) {
      return input.value.trim().toLowerCase();
    }).filter(Boolean).join(' ');

    cards.forEach(function (card) {
      var matchesText = !query || card.textContent.toLowerCase().indexOf(query) !== -1;
      var matchesCategory = selectedCategory === 'all' || card.getAttribute('data-category') === selectedCategory;
      card.classList.toggle('is-hidden', !(matchesText && matchesCategory));
    });
  }

  if (filterInputs.length && cards.length) {
    var params = new URLSearchParams(window.location.search);
    var queryValue = params.get('q') || '';
    if (queryValue) {
      filterInputs.forEach(function (input) {
        input.value = queryValue;
      });
    }

    filterInputs.forEach(function (input) {
      input.addEventListener('input', applyFilters);
    });

    filterButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        selectedCategory = button.getAttribute('data-category-filter') || 'all';
        filterButtons.forEach(function (item) {
          item.classList.toggle('is-active', item === button);
        });
        applyFilters();
      });
    });

    applyFilters();
  }
})();

function initVideoPlayer(streamUrl) {
  var video = document.querySelector('[data-player-video]');
  var overlay = document.querySelector('[data-player-overlay]');
  var playButton = document.querySelector('[data-player-button]');
  var hlsInstance = null;
  var loaded = false;

  if (!video || !overlay || !playButton || !streamUrl) {
    return;
  }

  function loadStream() {
    if (loaded) {
      return;
    }

    loaded = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
      hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
        if (!data || !data.fatal) {
          return;
        }
        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          hlsInstance.startLoad();
        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          hlsInstance.recoverMediaError();
        } else {
          hlsInstance.destroy();
        }
      });
      return;
    }

    video.src = streamUrl;
  }

  function startPlayback() {
    overlay.classList.add('is-hidden');
    video.controls = true;
    loadStream();
    var playAttempt = video.play();

    if (playAttempt && typeof playAttempt.catch === 'function') {
      playAttempt.catch(function () {
        video.addEventListener('canplay', function () {
          video.play().catch(function () {});
        }, { once: true });
      });
    }
  }

  playButton.addEventListener('click', startPlayback);
  overlay.addEventListener('click', startPlayback);
  video.addEventListener('click', function () {
    if (video.paused) {
      startPlayback();
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}

window.initVideoPlayer = initVideoPlayer;
