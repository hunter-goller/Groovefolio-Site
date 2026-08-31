(() => {
  // Load the phone-specific density pass separately so the desktop redesign
  // remains untouched and mobile changes stay easy to maintain.
  if (!document.querySelector('link[data-mobile-css]')) {
    const mobileCss = document.createElement('link');
    mobileCss.rel = 'stylesheet';
    mobileCss.href = 'mobile.css?rev=20260831-mobile1';
    mobileCss.dataset.mobileCss = '';
    document.head.appendChild(mobileCss);
  }

  const root = document.documentElement;
  const progress = document.querySelector('.scroll-progress span');
  const header = document.querySelector('[data-header]');
  const menuButton = document.querySelector('[data-menu-button]');
  const menu = document.querySelector('[data-menu]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const updateScrollUI = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = max > 0 ? window.scrollY / max : 0;
    if (progress) progress.style.transform = `scaleX(${Math.min(1, Math.max(0, pct))})`;
    if (header) header.classList.toggle('scrolled', window.scrollY > 12);
  };

  updateScrollUI();
  window.addEventListener('scroll', updateScrollUI, { passive: true });
  window.addEventListener('resize', updateScrollUI, { passive: true });

  if (menuButton && menu) {
    menuButton.addEventListener('click', () => {
      const open = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!open));
      menu.classList.toggle('open', !open);
    });

    menu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        menuButton.setAttribute('aria-expanded', 'false');
        menu.classList.remove('open');
      });
    });
  }

  const revealItems = [...document.querySelectorAll('.reveal')];
  if (reducedMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach((el) => el.classList.add('in'));
  } else {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealItems.forEach((el) => observer.observe(el));
  }

  // Close the mobile menu if the layout changes back to desktop.
  window.matchMedia('(min-width: 821px)').addEventListener?.('change', (event) => {
    if (!event.matches || !menuButton || !menu) return;
    menuButton.setAttribute('aria-expanded', 'false');
    menu.classList.remove('open');
  });
})();
