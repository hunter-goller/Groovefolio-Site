const toggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('#site-nav');

if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

const year = document.querySelector('#year');
if (year) year.textContent = new Date().getFullYear();

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

function initScrollReveals() {
  const targets = [
    ...document.querySelectorAll('.statement-grid > *'),
    ...document.querySelectorAll('.section-heading > *'),
    ...document.querySelectorAll('.feature'),
    ...document.querySelectorAll('.shot-card'),
    ...document.querySelectorAll('.screenshot-note'),
    ...document.querySelectorAll('.local-mark, .local-copy'),
    ...document.querySelectorAll('.roadmap-top > *'),
    ...document.querySelectorAll('.roadmap li'),
    ...document.querySelectorAll('.cta > *'),
  ];

  targets.forEach((element, index) => {
    element.classList.add('motion-reveal');
    element.style.setProperty('--motion-delay', `${Math.min((index % 4) * 70, 210)}ms`);
  });

  if (reducedMotion.matches || !('IntersectionObserver' in window)) {
    targets.forEach((element) => element.classList.add('motion-visible'));
    document.body.classList.add('motion-ready');
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('motion-visible');
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.14,
      rootMargin: '0px 0px -6% 0px',
    },
  );

  targets.forEach((element) => observer.observe(element));

  requestAnimationFrame(() => {
    document.body.classList.add('motion-ready');
  });
}

function initPhoneTilt() {
  if (reducedMotion.matches || !finePointer.matches) return;

  document.querySelectorAll('.phone').forEach((phone) => {
    const reset = () => {
      phone.style.setProperty('--phone-rx', '0deg');
      phone.style.setProperty('--phone-ry', '0deg');
    };

    phone.addEventListener('pointermove', (event) => {
      const rect = phone.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;

      const rotateY = (x - 0.5) * 8;
      const rotateX = (0.5 - y) * 7;

      phone.style.setProperty('--phone-rx', `${rotateX.toFixed(2)}deg`);
      phone.style.setProperty('--phone-ry', `${rotateY.toFixed(2)}deg`);
    });

    phone.addEventListener('pointerleave', reset);
    phone.addEventListener('pointercancel', reset);
  });
}

function initHeroParallax() {
  const visual = document.querySelector('.hero-visual');
  const hero = document.querySelector('.hero');

  if (!visual || !hero || reducedMotion.matches) return;

  let ticking = false;

  const update = () => {
    ticking = false;
    const rect = hero.getBoundingClientRect();
    const viewport = window.innerHeight || 1;

    // Only calculate while the hero is near the viewport.
    if (rect.bottom < -80 || rect.top > viewport + 80) return;

    const progress = Math.max(0, Math.min(1, -rect.top / Math.max(rect.height, 1)));
    visual.style.setProperty('--record-scroll', `${(progress * 28).toFixed(1)}px`);
    visual.style.setProperty('--folio-scroll', `${(-progress * 18).toFixed(1)}px`);
  };

  const requestUpdate = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };

  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate, { passive: true });
  update();
}

function initHeaderState() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  let ticking = false;

  const update = () => {
    ticking = false;
    header.classList.toggle('scrolled', window.scrollY > 18);
  };

  window.addEventListener(
    'scroll',
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    },
    { passive: true },
  );

  update();
}

initScrollReveals();
initPhoneTilt();
initHeroParallax();
initHeaderState();


// V3: page progress ----------------------------------------------------------
function initPageProgress() {
  const bar = document.querySelector('.scroll-progress span');
  if (!bar) return;

  let ticking = false;

  const update = () => {
    ticking = false;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    bar.style.transform = `scaleX(${progress})`;
  };

  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }, { passive: true });

  window.addEventListener('resize', update, { passive: true });
  update();
}

// V3: sticky product story ---------------------------------------------------
function initProductStory() {
  const steps = [...document.querySelectorAll('.story-step[data-story]')];
  const screens = [...document.querySelectorAll('.story-screen[data-screen]')];
  if (!steps.length || !screens.length) return;

  const activate = (name) => {
    steps.forEach((step) => {
      step.classList.toggle('is-active', step.dataset.story === name);
    });
    screens.forEach((screen) => {
      screen.classList.toggle('is-active', screen.dataset.screen === name);
    });
  };

  if (!('IntersectionObserver' in window)) {
    activate(steps[0].dataset.story);
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

    if (visible.length) {
      activate(visible[0].target.dataset.story);
    }
  }, {
    threshold: [0.35, 0.5, 0.65],
    rootMargin: '-18% 0px -30% 0px',
  });

  steps.forEach((step) => observer.observe(step));
}

// V3: shelf coverage concept animation --------------------------------------
function initCoverageDemo() {
  const card = document.querySelector('[data-coverage-card]');
  const number = document.querySelector('[data-coverage-number]');
  if (!card || !number) return;

  const finish = () => {
    card.classList.add('coverage-animated');
    if (reducedMotion.matches) {
      number.textContent = '68';
      return;
    }

    const duration = 1050;
    const start = performance.now();

    const frame = (now) => {
      const elapsed = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - elapsed, 3);
      number.textContent = String(Math.round(68 * eased));
      if (elapsed < 1) requestAnimationFrame(frame);
    };

    requestAnimationFrame(frame);
  };

  if (!('IntersectionObserver' in window)) {
    finish();
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    if (!entries.some((entry) => entry.isIntersecting)) return;
    observer.disconnect();
    finish();
  }, { threshold: .38 });

  observer.observe(card);
}

initPageProgress();
initProductStory();
initCoverageDemo();
