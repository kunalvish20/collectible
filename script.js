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
  const storySequence = document.getElementById('storySequence');
  const storyVisual = document.getElementById('storyVisual');
  const storyA = document.querySelector('.story-image--a');
  const storyB = document.querySelector('.story-image--b');
  const storyOrb = document.querySelector('.story-orb');
  const storyPromoGrid = document.getElementById('storyPromoGrid');
  const storyPromoUltimate = document.querySelector('[data-story-promo="ultimate"]');
  const storyPromoVintage = document.querySelector('[data-story-promo="vintage"]');
  const storyPromoUltimateBg = document.querySelector('.story-promo-card__bg--ultimate');
  const storyPromoVintageBg = document.querySelector('.story-promo-card__bg--vintage');
  const storyCopyPanel = document.querySelector('[data-story-panel="copy"]');
  const storyPeoplePanel = document.querySelector('[data-story-panel="people"]');
  const storyMediaPanel = document.querySelector('[data-story-panel="media"]');
  const storyPeopleMedia = document.querySelector('.story-panel__media--people');
  const storyMediaMedia = document.querySelector('.story-panel__media--media');
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

    if (!prefersReducedMotion && storySequence && storyVisual) {
      const rect = storySequence.getBoundingClientRect();
      const scrollable = storySequence.offsetHeight - window.innerHeight;
      const p = clamp(-rect.top / Math.max(scrollable, 1));

      // Stage 0: preserve the exact initial transforms supplied for the two
      // story images and the orb, then settle them into the pinned viewport.
      const visualIn = clamp(p / .115);
      const visualDrift = clamp(p / .24);
      storyA.style.transform = `translate3d(0, ${lerp(window.innerHeight * .52, -28, visualIn)}px, 0) rotate(${lerp(-7, -1.5, visualIn) + visualDrift * .8}deg) scale(${lerp(.92, 1, visualIn)})`;
      storyB.style.transform = `translate3d(0, ${lerp(window.innerHeight * .78, 16, visualIn)}px, 0) rotate(${lerp(7, 1.4, visualIn) - visualDrift * .8}deg) scale(${lerp(.92, 1, visualIn)})`;
      storyOrb.style.transform = `translate3d(0, ${lerp(110, -22, visualIn)}px, 0) scale(${lerp(.72, 1.04, visualIn)})`;

      // Stage 1: the two promo cards from the supplied reference rise over the
      // pinned visual. The card settles from 0.985 -> 1 while each background
      // receives the small negative-Y / 1.06-ish parallax scale visible in the
      // reference markup.
      const promoIn = clamp((p - .105) / .19);
      const promoSettle = clamp((promoIn - .68) / .32);
      const promoY = lerp(window.innerHeight * 1.05, 0, promoIn);
      if (storyPromoGrid) {
        storyPromoGrid.style.opacity = promoIn;
        storyPromoGrid.style.transform = `translate3d(0, ${promoY}px, 0)`;
      }

      const promoCardScale = lerp(.985, 1, promoSettle);
      if (storyPromoUltimate) storyPromoUltimate.style.transform = `scale(${promoCardScale})`;
      if (storyPromoVintage) {
        const stagger = clamp((promoIn - .08) / .92);
        storyPromoVintage.style.transform = `translate3d(0, ${lerp(34, 0, stagger)}px, 0) scale(${lerp(.985, 1, clamp((stagger - .68) / .32))})`;
      }

      if (storyPromoUltimateBg) {
        storyPromoUltimateBg.style.transform = `translate3d(0, ${lerp(34, -20.64, promoIn)}px, 0) scale(${lerp(1.10, 1.06521, promoIn)})`;
      }
      if (storyPromoVintageBg) {
        const vintageBgIn = clamp((promoIn - .06) / .94);
        storyPromoVintageBg.style.transform = `translate3d(0, ${lerp(38, -18.045, vintageBgIn)}px, 0) scale(${lerp(1.11, 1.07712, vintageBgIn)})`;
      }

      // The pinned background darkens while the promo cards take visual focus,
      // matching the brightness-reduction behavior in the supplied section.
      const bgDim = lerp(1, .23, promoIn);
      storyA.style.filter = `brightness(${bgDim})`;
      storyB.style.filter = `brightness(${bgDim})`;
      storyOrb.style.opacity = lerp(1, .18, promoIn);

      const setPanel = (panel, progress, previousProgress = 0) => {
        if (!panel) return;
        const y = lerp(105, 0, progress);
        const settle = clamp((progress - .82) / .18);
        const scale = lerp(.985, 1, settle);
        panel.style.transform = `translate3d(0, ${y}%, 0) scale(${scale})`;
        panel.style.borderRadius = `${lerp(28, 0, settle)}px ${lerp(28, 0, settle)}px 0 0`;
        if (previousProgress > 0) panel.style.filter = `brightness(${lerp(1, .97, previousProgress)})`;
      };

      // Stage 2: existing copy panel now arrives after the promo-card reveal and
      // covers the entire story visual. The remaining existing panels are kept.
      const copyIn = clamp((p - .34) / .17);
      const peopleIn = clamp((p - .57) / .17);
      const mediaIn = clamp((p - .79) / .17);

      setPanel(storyCopyPanel, copyIn, peopleIn);
      setPanel(storyPeoplePanel, peopleIn, mediaIn);
      setPanel(storyMediaPanel, mediaIn, 0);

      // As the next card arrives, the visible card beneath recedes slightly,
      // preserving the layered Rockstar-style stacked-card depth.
      if (storyCopyPanel) {
        const s = lerp(1, .955, peopleIn);
        storyCopyPanel.style.transform += ` scale(${s})`;
        storyCopyPanel.style.transformOrigin = 'center top';
      }
      if (storyPeoplePanel) {
        const s = lerp(1, .955, mediaIn);
        storyPeoplePanel.style.transform += ` scale(${s})`;
        storyPeoplePanel.style.transformOrigin = 'center top';
      }

      if (storyPeopleMedia) storyPeopleMedia.style.transform = `scale(${lerp(1.08, 1.0, peopleIn)}) translate3d(0, ${lerp(28, -8, peopleIn)}px, 0)`;
      if (storyMediaMedia) storyMediaMedia.style.transform = `scale(${lerp(1.08, 1.0, mediaIn)}) translate3d(0, ${lerp(28, -8, mediaIn)}px, 0)`;
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
