(function () {
    function qs(selector, scope) {
        return (scope || document).querySelector(selector);
    }

    function qsa(selector, scope) {
        return Array.from((scope || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function initNavigation() {
        var toggle = qs('[data-nav-toggle]');
        var panel = qs('[data-mobile-panel]');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    function initHero() {
        var root = qs('[data-hero]');
        if (!root) {
            return;
        }
        var slides = qsa('[data-hero-slide]', root);
        var dots = qsa('[data-hero-dot]', root);
        var prev = qs('[data-hero-prev]', root);
        var next = qs('[data-hero-next]', root);
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, pos) {
                slide.classList.toggle('is-active', pos === current);
            });
            dots.forEach(function (dot, pos) {
                dot.classList.toggle('is-active', pos === current);
            });
        }

        function start() {
            stop();
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

        dots.forEach(function (dot, pos) {
            dot.addEventListener('click', function () {
                show(pos);
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }

        root.addEventListener('mouseenter', stop);
        root.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function initFilters() {
        var grids = qsa('[data-card-grid]');
        grids.forEach(function (grid) {
            var section = grid.closest('.section-wrap') || document;
            var searchInput = qs('[data-search-input]', section);
            var yearFilter = qs('[data-year-filter]', section);
            var regionFilter = qs('[data-region-filter]', section);
            var typeFilter = qs('[data-type-filter]', section);
            var emptyState = qs('[data-empty-state]', section);
            var cards = qsa('[data-card]', grid);
            var params = new URLSearchParams(window.location.search);
            var query = params.get('q');

            if (query && searchInput && !searchInput.value) {
                searchInput.value = query;
            }

            function apply() {
                var term = normalize(searchInput && searchInput.value);
                var year = normalize(yearFilter && yearFilter.value);
                var region = normalize(regionFilter && regionFilter.value);
                var type = normalize(typeFilter && typeFilter.value);
                var shown = 0;

                cards.forEach(function (card) {
                    var text = normalize(card.getAttribute('data-search'));
                    var cardYear = normalize(card.getAttribute('data-year'));
                    var cardRegion = normalize(card.getAttribute('data-region'));
                    var cardType = normalize(card.getAttribute('data-type'));
                    var visible = true;

                    if (term && text.indexOf(term) === -1) {
                        visible = false;
                    }
                    if (year && cardYear !== year) {
                        visible = false;
                    }
                    if (region && cardRegion !== region) {
                        visible = false;
                    }
                    if (type && cardType !== type) {
                        visible = false;
                    }

                    card.classList.toggle('is-hidden', !visible);
                    if (visible) {
                        shown += 1;
                    }
                });

                if (emptyState) {
                    emptyState.classList.toggle('is-visible', shown === 0);
                }
            }

            [searchInput, yearFilter, regionFilter, typeFilter].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', apply);
                    control.addEventListener('change', apply);
                }
            });

            apply();
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initNavigation();
        initHero();
        initFilters();
    });
}());
