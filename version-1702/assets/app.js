(function () {
  var toggle = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      var isOpen = mobileNav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var currentSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    currentSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === currentSlide);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === currentSlide);
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showSlide(Number(dot.getAttribute('data-slide')) || 0);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(currentSlide + 1);
    }, 5200);
  }

  var searchInput = document.querySelector('.movie-search');
  var yearFilter = document.querySelector('.year-filter');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));

  if (yearFilter && cards.length) {
    var years = cards.map(function (card) {
      return card.getAttribute('data-year');
    }).filter(Boolean).filter(function (year, index, arr) {
      return arr.indexOf(year) === index;
    }).sort(function (a, b) {
      return Number(b) - Number(a);
    });

    years.forEach(function (year) {
      var option = document.createElement('option');
      option.value = year;
      option.textContent = year;
      yearFilter.appendChild(option);
    });
  }

  function filterCards() {
    var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    var year = yearFilter ? yearFilter.value : '';

    cards.forEach(function (card) {
      var haystack = [
        card.getAttribute('data-title'),
        card.getAttribute('data-year'),
        card.getAttribute('data-region'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-tags')
      ].join(' ').toLowerCase();
      var matchQuery = !query || haystack.indexOf(query) !== -1;
      var matchYear = !year || card.getAttribute('data-year') === year;
      card.classList.toggle('hidden', !(matchQuery && matchYear));
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', filterCards);
  }

  if (yearFilter) {
    yearFilter.addEventListener('change', filterCards);
  }

  var player = document.getElementById('mainPlayer');
  var playButton = document.querySelector('.play-button');
  var hlsReady = false;

  function preparePlayer() {
    if (!player || hlsReady) {
      return;
    }

    var stream = player.getAttribute('data-stream');
    if (!stream) {
      return;
    }

    if (player.canPlayType('application/vnd.apple.mpegurl')) {
      player.src = stream;
      hlsReady = true;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false
      });
      hls.loadSource(stream);
      hls.attachMedia(player);
      hlsReady = true;
    }
  }

  function startPlayer() {
    preparePlayer();
    if (!player) {
      return;
    }

    var action = player.play();
    if (action && typeof action.then === 'function') {
      action.catch(function () {});
    }
  }

  if (player) {
    player.addEventListener('click', startPlayer);
    player.addEventListener('play', function () {
      if (playButton) {
        playButton.classList.add('is-hidden');
      }
    });
    player.addEventListener('pause', function () {
      if (playButton) {
        playButton.classList.remove('is-hidden');
      }
    });
    preparePlayer();
  }

  if (playButton) {
    playButton.addEventListener('click', startPlayer);
  }
})();
