(function () {
    function each(selector, callback) {
        Array.prototype.forEach.call(document.querySelectorAll(selector), callback);
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function routeSearch(form) {
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            var input = form.querySelector("input[name='q']");
            var query = input ? input.value.trim() : "";
            var target = "./search.html";
            if (query) {
                target += "?q=" + encodeURIComponent(query);
            }
            window.location.href = target;
        });
    }

    function setupMenu() {
        var toggle = document.querySelector(".menu-toggle");
        var panel = document.querySelector(".mobile-panel");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            var expanded = toggle.getAttribute("aria-expanded") === "true";
            toggle.setAttribute("aria-expanded", String(!expanded));
            panel.hidden = expanded;
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === index);
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot") || 0));
            });
        });
        window.setInterval(function () {
            show(index + 1);
        }, 5200);
    }

    function setupFiltering() {
        var input = document.querySelector(".local-filter");
        var pageInput = document.getElementById("searchPageInput");
        var activeInput = input || pageInput;
        var list = document.querySelector(".searchable-list");
        if (!activeInput || !list) {
            return;
        }
        var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
        var empty = document.querySelector(".empty-state");
        function applyFilter() {
            var query = normalize(activeInput.value);
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-category"),
                    card.getAttribute("data-year"),
                    card.textContent
                ].join(" "));
                var matched = !query || haystack.indexOf(query) !== -1;
                card.classList.toggle("is-hidden-card", !matched);
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.hidden = visible !== 0;
            }
        }
        if (pageInput) {
            var params = new URLSearchParams(window.location.search);
            var query = params.get("q") || "";
            pageInput.value = query;
        }
        activeInput.addEventListener("input", applyFilter);
        applyFilter();
    }

    function setupBackTop() {
        each(".back-top", function (button) {
            button.addEventListener("click", function () {
                window.scrollTo({ top: 0, behavior: "smooth" });
            });
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        setupMenu();
        setupHero();
        setupFiltering();
        setupBackTop();
        each(".site-search", routeSearch);
    });
})();
