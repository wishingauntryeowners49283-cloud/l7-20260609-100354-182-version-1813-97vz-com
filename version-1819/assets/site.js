(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        var show = function (target) {
            if (!slides.length) {
                return;
            }

            index = (target + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        };

        var start = function () {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        };

        var restart = function () {
            window.clearInterval(timer);
            start();
        };

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                restart();
            });
        });

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

        start();
    }

    var searchInput = document.querySelector('[data-search-input]');

    if (searchInput) {
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));

        searchInput.addEventListener('input', function () {
            var value = searchInput.value.trim().toLowerCase();

            cards.forEach(function (card) {
                var content = (card.getAttribute('data-search') || '').toLowerCase();
                card.classList.toggle('is-hidden-by-search', value && content.indexOf(value) === -1);
            });
        });
    }
})();
