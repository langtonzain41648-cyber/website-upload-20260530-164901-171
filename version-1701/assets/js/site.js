(function () {
  var mobileButton = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (mobileButton && mobileNav) {
    mobileButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  document.querySelectorAll('[data-carousel]').forEach(function (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dot'));
    var prev = carousel.querySelector('[data-carousel-prev]');
    var next = carousel.querySelector('[data-carousel-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-slide')) || 0);
        start();
      });
    });

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    show(0);
    start();
  });

  var searchPanel = document.getElementById('searchPanel');
  var searchResults = document.getElementById('searchResults');
  var searchInputs = Array.prototype.slice.call(document.querySelectorAll('.site-search-input'));

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function renderSearch(query) {
    if (!searchPanel || !searchResults) {
      return;
    }
    var q = normalize(query);
    if (!q) {
      searchPanel.classList.remove('open');
      searchResults.innerHTML = '';
      return;
    }
    var source = Array.isArray(window.movieSearchIndex) ? window.movieSearchIndex : [];
    var hits = source.filter(function (item) {
      return normalize(item.title + ' ' + item.region + ' ' + item.year + ' ' + item.genre + ' ' + item.category).indexOf(q) !== -1;
    }).slice(0, 12);

    if (!hits.length) {
      searchResults.innerHTML = '<div class="no-results">暂无匹配影片</div>';
      searchPanel.classList.add('open');
      return;
    }

    searchResults.innerHTML = hits.map(function (item) {
      return '<a class="search-result-item" href="' + item.url + '">' +
        '<img src="' + item.cover + '" alt="' + item.title.replace(/"/g, '&quot;') + '">' +
        '<span><strong>' + item.title + '</strong><em>' + item.year + ' · ' + item.region + ' · ' + item.category + '</em></span>' +
        '</a>';
    }).join('');
    searchPanel.classList.add('open');
  }

  searchInputs.forEach(function (input) {
    input.addEventListener('input', function () {
      renderSearch(input.value);
    });
    input.addEventListener('focus', function () {
      renderSearch(input.value);
    });
  });

  document.addEventListener('click', function (event) {
    if (!searchPanel) {
      return;
    }
    var inSearch = event.target.closest('.header-search, .mobile-search, .search-panel');
    if (!inSearch) {
      searchPanel.classList.remove('open');
    }
  });

  function applyPageFilters() {
    var queryInput = document.querySelector('.page-filter-input');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
    if (!cards.length) {
      return;
    }
    var query = normalize(queryInput ? queryInput.value : '');
    var filters = {};
    document.querySelectorAll('.filter-select').forEach(function (select) {
      filters[select.getAttribute('data-filter')] = normalize(select.value);
    });

    cards.forEach(function (card) {
      var text = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-year'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-category')
      ].join(' '));
      var visible = !query || text.indexOf(query) !== -1;
      Object.keys(filters).forEach(function (key) {
        if (filters[key] && normalize(card.getAttribute('data-' + key)).indexOf(filters[key]) === -1) {
          visible = false;
        }
      });
      card.classList.toggle('is-hidden', !visible);
    });
  }

  var pageInput = document.querySelector('.page-filter-input');
  if (pageInput) {
    pageInput.addEventListener('input', applyPageFilters);
  }
  document.querySelectorAll('.filter-select').forEach(function (select) {
    select.addEventListener('change', applyPageFilters);
  });

  document.querySelectorAll('.player').forEach(function (player) {
    var video = player.querySelector('video');
    var cover = player.querySelector('.player-cover');
    var stream = player.getAttribute('data-stream');
    var hls = null;

    function load() {
      if (!video || !stream) {
        return;
      }
      if (video.getAttribute('src') || video.src) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls();
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }
    }

    function play() {
      load();
      if (cover) {
        cover.classList.add('is-hidden');
      }
      video.setAttribute('controls', 'controls');
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener('click', play);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (!video.getAttribute('src') && !video.src) {
          play();
        }
      });
    }
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
})();
