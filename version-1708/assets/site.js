import { H as Hls } from './hls-vendor-dru42stk.js';

const SELECTORS = {
  menuToggle: '[data-menu-toggle]',
  mobileNav: '[data-mobile-nav]',
  heroSlide: '[data-hero-slide]',
  heroDot: '[data-hero-dot]',
  cardFilter: '[data-card-filter]',
  playerButton: '[data-player-button]',
  hlsVideo: '[data-hls-video]',
  playerStatus: '[data-player-status]'
};

function initMobileMenu() {
  const button = document.querySelector(SELECTORS.menuToggle);
  const nav = document.querySelector(SELECTORS.mobileNav);

  if (!button || !nav) {
    return;
  }

  button.addEventListener('click', () => {
    nav.classList.toggle('is-open');
  });
}

function initHero() {
  const slides = Array.from(document.querySelectorAll(SELECTORS.heroSlide));
  const dots = Array.from(document.querySelectorAll(SELECTORS.heroDot));

  if (slides.length < 2) {
    return;
  }

  let current = 0;
  let timer = null;

  const show = (index) => {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === current);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === current);
    });
  };

  const start = () => {
    stop();
    timer = window.setInterval(() => show(current + 1), 5200);
  };

  const stop = () => {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  };

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const index = Number(dot.dataset.heroDot || 0);
      show(index);
      start();
    });
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stop();
    } else {
      start();
    }
  });

  start();
}

function normalize(value) {
  return String(value || '').trim().toLowerCase();
}

function initCardFilters() {
  document.querySelectorAll(SELECTORS.cardFilter).forEach((form) => {
    const container = form.parentElement;
    const list = container ? container.querySelector('[data-filter-list]') : null;
    const cards = list ? Array.from(list.querySelectorAll('.movie-card')) : [];
    const emptyState = container ? container.querySelector('[data-filter-empty]') : null;
    const keywordInput = form.querySelector('[data-filter-keyword]');
    const yearSelect = form.querySelector('[data-filter-year]');
    const typeSelect = form.querySelector('[data-filter-type]');

    const apply = () => {
      const keyword = normalize(keywordInput ? keywordInput.value : '');
      const year = normalize(yearSelect ? yearSelect.value : '');
      const type = normalize(typeSelect ? typeSelect.value : '');
      let visible = 0;

      cards.forEach((card) => {
        const haystack = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.genre,
          card.dataset.year
        ].join(' '));
        const matchesKeyword = !keyword || haystack.includes(keyword);
        const matchesYear = !year || normalize(card.dataset.year) === year;
        const matchesType = !type || normalize(card.dataset.type) === type;
        const shouldShow = matchesKeyword && matchesYear && matchesType;

        card.hidden = !shouldShow;
        if (shouldShow) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.hidden = visible !== 0;
      }
    };

    form.addEventListener('input', apply);
    form.addEventListener('change', apply);
    form.addEventListener('reset', () => {
      window.setTimeout(apply, 0);
    });
  });
}

function initImageFallbacks() {
  document.addEventListener('error', (event) => {
    const target = event.target;

    if (!(target instanceof HTMLImageElement)) {
      return;
    }

    if (!target.dataset.fallback) {
      return;
    }

    target.classList.add('is-broken');
  }, true);
}

function setPlayerStatus(message) {
  const status = document.querySelector(SELECTORS.playerStatus);

  if (status) {
    status.textContent = message;
  }
}

function initPlayer() {
  const button = document.querySelector(SELECTORS.playerButton);
  const video = document.querySelector(SELECTORS.hlsVideo);

  if (!button || !video) {
    return;
  }

  let initialized = false;

  const startPlayback = async () => {
    if (initialized) {
      video.play().catch(() => undefined);
      return;
    }

    const source = button.dataset.videoUrl;

    if (!source) {
      setPlayerStatus('未找到播放源。');
      return;
    }

    initialized = true;
    button.classList.add('is-hidden');
    setPlayerStatus('正在加载 HLS 播放源…');

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });

      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setPlayerStatus('播放源加载完成。');
        video.play().catch(() => {
          setPlayerStatus('播放源已加载，请再次点击播放器开始播放。');
        });
      });
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data && data.fatal) {
          setPlayerStatus('播放加载出现异常，请刷新页面或稍后重试。');
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.addEventListener('loadedmetadata', () => {
        setPlayerStatus('播放源加载完成。');
        video.play().catch(() => undefined);
      }, { once: true });
    } else {
      setPlayerStatus('当前浏览器不支持 HLS 播放，请更换现代浏览器。');
    }
  };

  button.addEventListener('click', startPlayback);
  video.addEventListener('click', () => {
    if (!initialized) {
      startPlayback();
    }
  });
}

initMobileMenu();
initHero();
initCardFilters();
initImageFallbacks();
initPlayer();
