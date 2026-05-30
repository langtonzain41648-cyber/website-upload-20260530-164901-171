(function () {
    var menuButton = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".site-nav");

    if (menuButton && nav) {
        menuButton.addEventListener("click", function () {
            var opened = nav.classList.toggle("open");
            menuButton.setAttribute("aria-expanded", opened ? "true" : "false");
        });
    }

    var carousel = document.querySelector("[data-carousel='hero']");

    if (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
        var dotsWrap = carousel.querySelector(".hero-dots");
        var index = 0;
        var timer = null;

        function show(next) {
            if (!slides.length) {
                return;
            }
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === index);
            });
            if (dotsWrap) {
                Array.prototype.slice.call(dotsWrap.children).forEach(function (dot, i) {
                    dot.classList.toggle("active", i === index);
                });
            }
        }

        function play() {
            clearInterval(timer);
            timer = setInterval(function () {
                show(index + 1);
            }, 5600);
        }

        if (dotsWrap) {
            slides.forEach(function (_, i) {
                var button = document.createElement("button");
                button.type = "button";
                button.setAttribute("aria-label", "切换影片" + (i + 1));
                button.addEventListener("click", function () {
                    show(i);
                    play();
                });
                dotsWrap.appendChild(button);
            });
        }

        var prev = carousel.querySelector(".prev");
        var next = carousel.querySelector(".next");
        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                play();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                play();
            });
        }
        show(0);
        play();
    }

    var input = document.querySelector(".search-input");
    var selects = Array.prototype.slice.call(document.querySelectorAll(".filter-select"));
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));

    function params() {
        try {
            return new URLSearchParams(window.location.search);
        } catch (error) {
            return new URLSearchParams("");
        }
    }

    if (input) {
        var q = params().get("q");
        if (q) {
            input.value = q;
        }
    }

    function applyFilters() {
        var keyword = input ? input.value.trim().toLowerCase() : "";
        var filters = {};
        selects.forEach(function (select) {
            filters[select.getAttribute("data-filter")] = select.value;
        });

        cards.forEach(function (card) {
            var haystack = card.getAttribute("data-search") || "";
            var matched = !keyword || haystack.indexOf(keyword) !== -1;
            Object.keys(filters).forEach(function (key) {
                var value = filters[key];
                if (value && card.getAttribute("data-" + key) !== value) {
                    matched = false;
                }
            });
            card.classList.toggle("is-hidden", !matched);
        });
    }

    if (input || selects.length) {
        if (input) {
            input.addEventListener("input", applyFilters);
        }
        selects.forEach(function (select) {
            select.addEventListener("change", applyFilters);
        });
        applyFilters();
    }
})();
