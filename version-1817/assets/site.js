(function () {
    var header = document.querySelector('.site-header');
    var menuToggle = document.querySelector('.menu-toggle');
    var nav = document.querySelector('.site-nav');

    if (menuToggle && nav) {
        menuToggle.addEventListener('click', function () {
            var opened = nav.classList.toggle('is-open');
            menuToggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
        });
    }

    window.addEventListener('scroll', function () {
        if (!header) {
            return;
        }
        header.classList.toggle('is-scrolled', window.scrollY > 12);
    }, { passive: true });

    document.querySelectorAll('[data-search-form]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var input = form.querySelector('input[name="q"]');
            var query = input ? input.value.trim() : '';
            var target = form.getAttribute('action') || './search.html';
            window.location.href = query ? target + '?q=' + encodeURIComponent(query) : target;
        });
    });

    document.querySelectorAll('[data-hero-slider]').forEach(function (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        var active = 0;
        var timer = null;

        function show(next) {
            active = (next + slides.length) % slides.length;
            slides.forEach(function (slide, index) {
                slide.classList.toggle('is-active', index === active);
            });
            dots.forEach(function (dot, index) {
                dot.classList.toggle('is-active', index === active);
            });
        }

        function start() {
            if (slides.length < 2) {
                return;
            }
            stop();
            timer = window.setInterval(function () {
                show(active + 1);
            }, 6200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                start();
            });
        });

        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);
        start();
    });

    document.querySelectorAll('[data-filter-root]').forEach(function (root) {
        var input = root.querySelector('[data-filter-input]');
        var selects = Array.prototype.slice.call(root.querySelectorAll('[data-filter-select]'));
        var container = root.parentElement || document;
        var cards = Array.prototype.slice.call(container.querySelectorAll('[data-card]'));
        var empty = container.querySelector('[data-empty]');
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';

        if (input && query) {
            input.value = query;
        }

        function normalize(value) {
            return String(value || '').toLowerCase().trim();
        }

        function apply() {
            var term = normalize(input ? input.value : '');
            var visible = 0;

            cards.forEach(function (card) {
                var matched = true;
                var text = normalize(card.getAttribute('data-search'));

                if (term && text.indexOf(term) === -1) {
                    matched = false;
                }

                selects.forEach(function (select) {
                    var value = normalize(select.value);
                    var key = select.getAttribute('data-filter-key');
                    var cardValue = normalize(card.getAttribute('data-' + key));

                    if (value && cardValue !== value) {
                        matched = false;
                    }
                });

                card.hidden = !matched;
                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.hidden = visible !== 0;
            }
        }

        if (input) {
            input.addEventListener('input', apply);
        }

        selects.forEach(function (select) {
            select.addEventListener('change', apply);
        });

        apply();
    });
})();
