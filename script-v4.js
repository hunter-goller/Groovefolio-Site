// Groovefolio Site V4 additions.
// V3 remains responsible for navigation, motion, scroll progress, story switching,
// phone tilt, and Shelf Coverage. V4 adds the Discogs import sequence and reveals.

(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function initV4Reveals() {
    const targets = [
      ...document.querySelectorAll('.import-heading > *'),
      ...document.querySelectorAll('.import-step'),
      ...document.querySelectorAll('.relationship-copy, .relationship-phone'),
    ];

    if (!targets.length) return;

    targets.forEach((target) => target.classList.add('v4-reveal'));

    if (reduceMotion.matches || !('IntersectionObserver' in window)) {
      targets.forEach((target) => target.classList.add('v4-visible'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('v4-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.16, rootMargin: '0px 0px -5% 0px' });

    targets.forEach((target) => observer.observe(target));
  }

  function initImportFlow() {
    const section = document.querySelector('[data-import-flow]');
    if (!section) return;

    const steps = [...section.querySelectorAll('[data-import-step]')];
    const dots = [...document.querySelectorAll('.import-progress i')];
    if (steps.length < 2) return;

    let active = 0;
    let timer = null;

    const activate = (index) => {
      active = ((index % steps.length) + steps.length) % steps.length;
      steps.forEach((step, i) => step.classList.toggle('is-current', i === active));
      dots.forEach((dot, i) => dot.classList.toggle('is-active', i === active));
    };

    steps.forEach((step, index) => {
      step.addEventListener('click', () => activate(index));
    });

    if (reduceMotion.matches) {
      activate(0);
      return;
    }

    const start = () => {
      if (timer) return;
      timer = window.setInterval(() => activate(active + 1), 2600);
    };

    const stop = () => {
      if (!timer) return;
      window.clearInterval(timer);
      timer = null;
    };

    if (!('IntersectionObserver' in window)) {
      start();
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      const visible = entries.some((entry) => entry.isIntersecting);
      if (visible) start(); else stop();
    }, { threshold: 0.28 });

    observer.observe(section);
  }

  initV4Reveals();
  initImportFlow();
})();
