(function () {
  'use strict';

  // ── Loader ──
  window.addEventListener('load', function () {
    setTimeout(function () {
      var loader = document.getElementById('loader');
      if (loader) loader.classList.add('hidden');
    }, 2000);
  });

  // ── Navbar scroll effect ──
  var navbar = document.getElementById('navbar');
  var lastScroll = 0;

  window.addEventListener('scroll', function () {
    var scrollY = window.scrollY;
    if (scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    lastScroll = scrollY;
  }, { passive: true });

  // ── Mobile menu toggle ──
  var navToggle = document.getElementById('navToggle');
  var navLinks = document.getElementById('navLinks');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      navToggle.classList.toggle('active');
      navLinks.classList.toggle('open');
      var expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', !expanded);
    });

    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navToggle.classList.remove('active');
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ── Smooth scroll for anchor links ──
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        var offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 72;
        var top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });

  // ── Scroll animations ──
  var animElements = document.querySelectorAll('[data-animate]');

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var delay = parseFloat(entry.target.dataset.delay) || 0;
        setTimeout(function () {
          entry.target.classList.add('animated');
        }, delay * 1000);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  animElements.forEach(function (el) { observer.observe(el); });

  // ── Counter animation ──
  function animateCounter(el) {
    var target = parseFloat(el.dataset.count);
    var suffix = el.dataset.suffix || '';
    var decimal = parseInt(el.dataset.decimal) || 0;
    var duration = 2000;
    var start = performance.now();

    function update(now) {
      var elapsed = now - start;
      var progress = Math.min(elapsed / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 4);
      var current = eased * target;

      if (decimal > 0) {
        el.textContent = current.toFixed(decimal) + suffix;
      } else {
        el.textContent = Math.round(current).toLocaleString() + suffix;
      }

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  var counterElements = document.querySelectorAll('[data-count]');
  var counterObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counterElements.forEach(function (el) { counterObserver.observe(el); });

  // ── Feature card mouse glow ──
  document.querySelectorAll('.feature-card').forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      var rect = card.getBoundingClientRect();
      var x = ((e.clientX - rect.left) / rect.width) * 100;
      var y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--mx', x + '%');
      card.style.setProperty('--my', y + '%');
    });
  });

  // ── Demo bars animation ──
  var demoFills = document.querySelectorAll('.demo-bar-fill');
  var demoObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var fills = entry.target.querySelectorAll('.demo-bar-fill');
        fills.forEach(function (fill, i) {
          setTimeout(function () {
            fill.classList.add('animated');
          }, i * 150);
        });
        demoObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  var demoBars = document.querySelector('.demo-bars');
  if (demoBars) demoObserver.observe(demoBars);

  // ── Early Access Form ──
  var form = document.getElementById('earlyAccessForm');
  var emailInput = document.getElementById('emailInput');
  var submitBtn = document.getElementById('submitBtn');
  var formMessage = document.getElementById('formMessage');

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var email = emailInput.value.trim();

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showMessage('Please enter a valid email address.', 'error');
        return;
      }

      submitBtn.classList.add('loading');
      submitBtn.disabled = true;

      fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email }),
      })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          submitBtn.classList.remove('loading');
          submitBtn.disabled = false;

          if (data.success) {
            showMessage("You're on the list! We'll be in touch soon.", 'success');
            emailInput.value = '';
          } else {
            showMessage(data.error || 'Something went wrong. Please try again.', 'error');
          }
        })
        .catch(function () {
          submitBtn.classList.remove('loading');
          submitBtn.disabled = false;
          showMessage('Network error. Please try again.', 'error');
        });
    });
  }

  function showMessage(text, type) {
    formMessage.textContent = text;
    formMessage.className = 'form-message ' + type;
    setTimeout(function () {
      formMessage.textContent = '';
      formMessage.className = 'form-message';
    }, 5000);
  }

  // ── Video fallback ──
  var video = document.getElementById('demoVideo');
  if (video) {
    video.addEventListener('error', function () {
      video.style.display = 'none';
    });
  }
})();
