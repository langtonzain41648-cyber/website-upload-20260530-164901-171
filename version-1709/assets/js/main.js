(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileLinks = document.querySelector('[data-mobile-links]');

    if (menuButton && mobileLinks) {
        menuButton.addEventListener('click', function () {
            mobileLinks.classList.toggle('open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var activeIndex = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        activeIndex = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('active', slideIndex === activeIndex);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('active', dotIndex === activeIndex);
        });
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
        });
    });

    if (slides.length > 1) {
        window.setInterval(function () {
            showSlide(activeIndex + 1);
        }, 5200);
    }

    var filterForms = Array.prototype.slice.call(document.querySelectorAll('[data-filter-form]'));

    filterForms.forEach(function (form) {
        var grid = document.querySelector(form.getAttribute('data-filter-form'));
        var emptyState = document.querySelector(form.getAttribute('data-empty-state'));
        var cards = grid ? Array.prototype.slice.call(grid.querySelectorAll('[data-card]')) : [];
        var searchInput = form.querySelector('[data-search]');
        var typeSelect = form.querySelector('[data-type-filter]');
        var yearSelect = form.querySelector('[data-year-filter]');

        function normalize(value) {
            return String(value || '').toLowerCase().trim();
        }

        function applyFilters() {
            var query = normalize(searchInput && searchInput.value);
            var typeValue = normalize(typeSelect && typeSelect.value);
            var yearValue = normalize(yearSelect && yearSelect.value);
            var visible = 0;

            cards.forEach(function (card) {
                var title = normalize(card.getAttribute('data-title'));
                var region = normalize(card.getAttribute('data-region'));
                var type = normalize(card.getAttribute('data-type'));
                var year = normalize(card.getAttribute('data-year'));
                var tags = normalize(card.getAttribute('data-tags'));
                var text = title + ' ' + region + ' ' + type + ' ' + year + ' ' + tags;
                var matchesQuery = !query || text.indexOf(query) !== -1;
                var matchesType = !typeValue || type.indexOf(typeValue) !== -1 || tags.indexOf(typeValue) !== -1;
                var matchesYear = !yearValue || year === yearValue;
                var shouldShow = matchesQuery && matchesType && matchesYear;

                card.style.display = shouldShow ? '' : 'none';
                if (shouldShow) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle('show', visible === 0);
            }
        }

        [searchInput, typeSelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilters);
                control.addEventListener('change', applyFilters);
            }
        });
    });

    document.addEventListener('error', function (event) {
        var target = event.target;
        if (target && target.tagName === 'IMG') {
            var holder = target.closest('.poster-frame, .hero-image, .detail-poster, .related-poster, .rank-thumb');
            if (holder) {
                holder.classList.add('poster-fallback');
            }
        }
    }, true);
})();
