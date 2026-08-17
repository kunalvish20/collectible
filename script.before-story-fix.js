(() => {
  const clamp = (n, min = 0, max = 1) => Math.min(max, Math.max(min, n));
  const lerp = (a, b, t) => a + (b - a) * t;

  const header = document.getElementById('siteHeader');
  const progressBar = document.getElementById('progressBar');
  const hero = document.getElementById('hero');
  const stage = document.getElementById('posterStage');
  const slices = [...document.querySelectorAll('.poster-slice')];
  const heroLogo = document.querySelector('.hero-logo');
  const heroCopy = document.querySelector('.hero-copy');
  const storyVisual = document.getElementById('storyVisual');
  const storyA = document.querySelector('.story-image--a');
  const storyB = document.querySelector('.story-image--b');
  const storyOrb = document.querySelector('.story-orb');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const initialTransforms = [
    [-15, -12, -4], [-8, -18, 3], [10, -18, -3], [16, -8, 4],
    [-18, 13, 4], [-8, 18, -4], [9, 17, 3], [18, 11, -3]
  ];

  let lastY = window.scrollY;
  let ticking = false;

  function updateScrollScene() {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = `${max > 0 ? (y / max) * 100 : 0}%`;

    if (y > lastY && y > 150) header.classList.add('is-hidden');
    else header.classList.remove('is-hidden');
    lastY = y;

    if (!prefersReducedMotion && hero) {
      const rect = hero.getBoundingClientRect();
      const heroScrollable = hero.offsetHeight - window.innerHeight;
      const heroProgress = clamp(-rect.top / Math.max(heroScrollable, 1));
      const assemble = clamp(heroProgress / 0.48);
      const logoIn = clamp((heroProgress - .32) / .24);
      const fadeCopy = clamp((heroProgress - .12) / .25);
      const finalZoom = clamp((heroProgress - .72) / .28);

      slices.forEach((slice, i) => {
        const [x, yy, rot] = initialTransforms[i];
        const tx = lerp(x, 0, assemble);
        const ty = lerp(yy, 0, assemble);
        const rr = lerp(rot, 0, assemble);
        const extraScale = 1 + finalZoom * .12;
        slice.style.transform = `translate(${tx}vw, ${ty}vh) rotate(${rr}deg) scale(${extraScale})`;
      });

      stage.style.filter = `brightness(${lerp(1, .82, finalZoom)})`;
      heroLogo.style.opacity = logoIn;
      heroLogo.style.transform = `translate(-50%,-50%) scale(${lerp(.72, 1 + finalZoom * .12, logoIn)})`;
      heroCopy.style.opacity = 1 - fadeCopy;
    }

    if (!prefersReducedMotion && storyVisual) {
      const rect = storyVisual.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = clamp((vh - rect.top) / (rect.height + vh));
      storyA.style.transform = `translate3d(0, ${lerp(55, -75, p)}px, 0) rotate(${lerp(-2, 2, p)}deg)`;
      storyB.style.transform = `translate3d(0, ${lerp(-35, 90, p)}px, 0) rotate(${lerp(2, -2, p)}deg)`;
      storyOrb.style.transform = `translate3d(0, ${lerp(70, -40, p)}px, 0) scale(${lerp(.86, 1.08, p)})`;
    }

    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(updateScrollScene);
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  updateScrollScene();

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: .14, rootMargin: '0px 0px -5% 0px' });

  document.querySelectorAll('.reveal,.reveal-card,.reveal-section').forEach(el => observer.observe(el));

  const menuToggle = document.getElementById('menuToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  function setMenu(open) {
    document.body.classList.toggle('menu-open', open);
    mobileMenu.classList.toggle('is-open', open);
    mobileMenu.setAttribute('aria-hidden', String(!open));
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  menuToggle.addEventListener('click', () => setMenu(!mobileMenu.classList.contains('is-open')));
  mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));

  const videoModal = document.getElementById('videoModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalClose = document.getElementById('modalClose');
  function setModal(open, title = 'Trailer') {
    document.body.classList.toggle('modal-open', open);
    videoModal.classList.toggle('is-open', open);
    videoModal.setAttribute('aria-hidden', String(!open));
    modalTitle.textContent = title;
    if (open) modalClose.focus();
  }
  document.querySelectorAll('[data-video]').forEach(button => {
    button.addEventListener('click', () => setModal(true, button.dataset.video));
  });
  modalClose.addEventListener('click', () => setModal(false));
  videoModal.addEventListener('click', e => { if (e.target === videoModal) setModal(false); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (videoModal.classList.contains('is-open')) setModal(false);
      if (mobileMenu.classList.contains('is-open')) setMenu(false);
    }
  });

  const signup = document.getElementById('signupForm');
  const toast = document.getElementById('toast');
  signup.addEventListener('submit', e => {
    e.preventDefault();
    if (!signup.checkValidity()) return signup.reportValidity();
    toast.classList.add('show');
    signup.reset();
    setTimeout(() => toast.classList.remove('show'), 2600);
  });

  document.querySelectorAll('a[href="#"]').forEach(a => {
    a.addEventListener('click', e => e.preventDefault());
  });
})();
