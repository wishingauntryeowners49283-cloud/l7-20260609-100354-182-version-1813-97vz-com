(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $$(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  var toggle = $('[data-menu-toggle]');
  var mobileNav = $('[data-mobile-nav]');
  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = $('[data-hero]');
  if (hero) {
    var slides = $$('[data-hero-slide]', hero);
    var dots = $$('[data-hero-dot]', hero);
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function next() {
      show(current + 1);
    }

    function restart() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(next, 5200);
    }

    var prevButton = $('[data-hero-prev]', hero);
    var nextButton = $('[data-hero-next]', hero);
    if (prevButton) {
      prevButton.addEventListener('click', function () {
        show(current - 1);
        restart();
      });
    }
    if (nextButton) {
      nextButton.addEventListener('click', function () {
        show(current + 1);
        restart();
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        restart();
      });
    });
    restart();
  }

  function setupFilter(root) {
    var keyword = $('[data-filter-keyword]', root);
    var year = $('[data-filter-year]', root);
    var type = $('[data-filter-type]', root);
    var list = $('[data-filter-list]', root);
    var empty = $('[data-empty-state]', root);
    if (!list) {
      return;
    }
    var cards = $$('.movie-card', list);

    function apply() {
      var q = normalize(keyword && keyword.value);
      var y = normalize(year && year.value);
      var t = normalize(type && type.value);
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-year'),
          card.getAttribute('data-type'),
          card.getAttribute('data-region'),
          card.textContent
        ].join(' '));
        var ok = true;
        if (q && haystack.indexOf(q) === -1) {
          ok = false;
        }
        if (y && normalize(card.getAttribute('data-year')).indexOf(y) === -1) {
          ok = false;
        }
        if (t && normalize(card.getAttribute('data-type')).indexOf(t) === -1) {
          ok = false;
        }
        card.classList.toggle('is-filter-hidden', !ok);
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    [keyword, year, type].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    if (root.hasAttribute('data-search-page') && keyword) {
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q');
      if (query) {
        keyword.value = query;
      }
    }
    apply();
  }

  $$('[data-filter-root]').forEach(setupFilter);
})();
