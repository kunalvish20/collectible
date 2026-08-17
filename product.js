(() => {
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const money = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
  const UNIT_PRICE = 9999;

  const progressBar = document.getElementById('progressBar');
  const header = document.getElementById('siteHeader');
  const mobileBuybar = document.getElementById('mobileBuybar');
  const purchaseSection = document.getElementById('purchase');
  let lastY = window.scrollY;
  let scrollTicking = false;

  function updateScroll() {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (progressBar) progressBar.style.width = `${max > 0 ? (y / max) * 100 : 0}%`;

    if (header) {
      if (y > lastY && y > 150) header.classList.add('is-hidden');
      else header.classList.remove('is-hidden');
    }

    if (mobileBuybar && purchaseSection) {
      const purchaseBottom = purchaseSection.offsetTop + purchaseSection.offsetHeight;
      mobileBuybar.classList.toggle('is-visible', y > Math.min(420, purchaseBottom * 0.35));
    }

    lastY = y;
    scrollTicking = false;
  }

  window.addEventListener('scroll', () => {
    if (!scrollTicking) {
      requestAnimationFrame(updateScroll);
      scrollTicking = true;
    }
  }, { passive: true });
  updateScroll();

  const menuToggle = document.getElementById('menuToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  function setMenu(open) {
    if (!menuToggle || !mobileMenu) return;
    document.body.classList.toggle('menu-open', open);
    mobileMenu.classList.toggle('is-open', open);
    mobileMenu.setAttribute('aria-hidden', String(!open));
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  menuToggle?.addEventListener('click', () => setMenu(!mobileMenu.classList.contains('is-open')));
  mobileMenu?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));

  const galleryPanels = [...document.querySelectorAll('[data-gallery-panel]')];
  const galleryTabs = [...document.querySelectorAll('[data-gallery]')];
  const galleryIndex = document.getElementById('galleryIndex');
  const order = ['box', 'art', 'detail'];

  function setGallery(name) {
    galleryPanels.forEach(panel => {
      const active = panel.dataset.galleryPanel === name;
      panel.classList.toggle('is-active', active);
      panel.setAttribute('aria-hidden', String(!active));
    });
    galleryTabs.forEach(tab => {
      const active = tab.dataset.gallery === name;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    const index = Math.max(0, order.indexOf(name));
    if (galleryIndex) galleryIndex.textContent = `${String(index + 1).padStart(2, '0')} / 03`;
  }

  galleryTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => setGallery(tab.dataset.gallery));
    tab.addEventListener('keydown', event => {
      if (!['ArrowRight', 'ArrowLeft'].includes(event.key)) return;
      event.preventDefault();
      const offset = event.key === 'ArrowRight' ? 1 : -1;
      const next = (index + offset + galleryTabs.length) % galleryTabs.length;
      galleryTabs[next].focus();
      setGallery(galleryTabs[next].dataset.gallery);
    });
  });
  setGallery('box');

  let qty = 1;
  let inCart = false;
  const qtyValue = document.getElementById('qtyValue');
  const buyNowPrice = document.getElementById('buyNowPrice');
  const mobileBuyPrice = document.getElementById('mobileBuyPrice');
  const cartQty = document.getElementById('cartQty');
  const cartLinePrice = document.getElementById('cartLinePrice');
  const cartTotal = document.getElementById('cartTotal');
  const headerCartCount = document.getElementById('headerCartCount');

  function renderQuantity() {
    const total = UNIT_PRICE * qty;
    if (qtyValue) qtyValue.textContent = String(qty);
    if (buyNowPrice) buyNowPrice.textContent = money.format(total);
    if (mobileBuyPrice) mobileBuyPrice.textContent = money.format(UNIT_PRICE);
    if (cartQty) cartQty.textContent = String(qty);
    if (cartLinePrice) cartLinePrice.textContent = money.format(UNIT_PRICE);
    if (cartTotal) cartTotal.textContent = money.format(total);
    if (headerCartCount) headerCartCount.textContent = inCart ? String(qty) : '0';
  }

  function changeQuantity(delta) {
    qty = clamp(qty + delta, 1, 10);
    renderQuantity();
  }

  document.getElementById('qtyMinus')?.addEventListener('click', () => changeQuantity(-1));
  document.getElementById('qtyPlus')?.addEventListener('click', () => changeQuantity(1));
  document.getElementById('cartMinus')?.addEventListener('click', () => changeQuantity(-1));
  document.getElementById('cartPlus')?.addEventListener('click', () => changeQuantity(1));
  renderQuantity();

  const drawer = document.getElementById('cartDrawer');
  const toast = document.getElementById('productToast');
  let toastTimer;

  function setCart(open) {
    if (!drawer) return;
    drawer.classList.toggle('is-open', open);
    drawer.setAttribute('aria-hidden', String(!open));
    document.body.style.overflow = open ? 'hidden' : '';
  }

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
  }

  function addToCart(openDrawer = true) {
    inCart = true;
    renderQuantity();
    showToast(`${qty} × Collectible Box added to cart.`);
    if (openDrawer) setTimeout(() => setCart(true), 180);
  }

  document.getElementById('addToCart')?.addEventListener('click', () => addToCart(true));
  document.getElementById('mobileAddToCart')?.addEventListener('click', () => addToCart(true));
  document.getElementById('buyNow')?.addEventListener('click', () => {
    inCart = true;
    renderQuantity();
    setCart(true);
  });
  document.getElementById('headerCart')?.addEventListener('click', () => setCart(true));
  drawer?.querySelectorAll('[data-close-cart]').forEach(element => element.addEventListener('click', () => setCart(false)));
  document.getElementById('checkoutBtn')?.addEventListener('click', () => showToast('Checkout is ready to connect to your payment flow.'));

  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    setMenu(false);
    setCart(false);
  });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -4% 0px' });
  document.querySelectorAll('.reveal-product').forEach(element => observer.observe(element));
})();
