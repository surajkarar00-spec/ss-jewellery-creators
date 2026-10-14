/* ══════════════════════════════════════════════════════════════════
   SS JEWELLERY CREATORS — app.js
   Full application logic: state, filtering, cart, checkout,
   3D viewer (Three.js), Web Audio hero, CDN download pipeline,
   dashboard (buyer / creator / admin), currency, promo codes.
   ══════════════════════════════════════════════════════════════════ */

'use strict';

/* ─── State ────────────────────────────────────────────────────────── */
const state = {
  currency:       'USD',
  activeCategory: 'all',
  activeSubcat:   null,
  searchQuery:    '',
  sortBy:         'featured',
  maxPrice:       500,
  communityProducts: [],
  cart:           [],      // [{product, qty, format}]
  wishlist:       new Set(),
  promoCode:      null,
  promoDiscount:  0,
  checkoutStep:   1,
  paymentMethod:  'card',
  dashboardRole:  'buyer',
  dashboardSection: 'purchases',
  purchases:      [],      // simulated past orders
  viewerProduct:  null,
  viewerAutoRotate: true,
  viewerWireframe: false,
};

/* ─── Currency Rates (relative to USD) ────────────────────────────── */
const FX = { USD: 1, EUR: 0.92, GBP: 0.79, JPY: 149.5, INR: 83.2 };
const FX_SYM = { USD: '$', EUR: '€', GBP: '£', JPY: '¥', INR: '₹' };

function fmt(usd) {
  const rate = FX[state.currency] || 1;
  const sym  = FX_SYM[state.currency] || '$';
  const val  = usd * rate;
  if (state.currency === 'JPY') return `${sym}${Math.round(val).toLocaleString()}`;
  return `${sym}${val.toFixed(2)}`;
}

/* ─── Promo Codes ──────────────────────────────────────────────────── */
const PROMO_CODES = {
  'SSLAUNCH':  { type: 'pct',  value: 15, label: '15% off' },
  'ARCH20':    { type: 'pct',  value: 20, label: '20% off' },
  'GAME10':    { type: 'pct',  value: 10, label: '10% off' },
  'FLAT25':    { type: 'flat', value: 25, label: '$25 off' },
  'NEWUSER':   { type: 'pct',  value: 12, label: '12% off' },
};

/* ─── Platform Fee ─────────────────────────────────────────────────── */
const PLATFORM_FEE_PCT = 0.03; // 3%
const FREE_SHIPPING_THRESHOLD = 500;

/* ──────────────────────────────────────────────────────────────────── */
/*  DOM HELPERS                                                          */
/* ──────────────────────────────────────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

function setHTML(sel, html) {
  const el = typeof sel === 'string' ? $(sel) : sel;
  if (el) el.innerHTML = html;
}

function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[char]);
}

function allProducts() {
  return [...PRODUCTS, ...state.communityProducts];
}

function findProduct(productId) {
  return allProducts().find(product => String(product.id) === String(productId));
}

function show(el) { (typeof el === 'string' ? $(el) : el)?.classList.remove('hidden'); }
function hide(el) { (typeof el === 'string' ? $(el) : el)?.classList.add('hidden'); }

function starsHTML(rating) {
  return Array.from({ length: 5 }, (_, i) => {
    const filled = i < Math.floor(rating);
    const half   = !filled && i < rating;
    const color  = (filled || half) ? 'var(--star)' : 'var(--text-muted)';
    return `<span class="star" style="color:${color};" aria-hidden="true">${filled ? '★' : half ? '⭑' : '☆'}</span>`;
  }).join('');
}

/* ──────────────────────────────────────────────────────────────────── */
/*  TOAST NOTIFICATIONS                                                  */
/* ──────────────────────────────────────────────────────────────────── */
function toast(msg, type = 'info', duration = 3500) {
  const icons = { success: '✅', error: '❌', info: '💡', download: '⬇️' };
  const container = $('#toast-container');
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span class="toast-icon">${icons[type] || icons.info}</span><span>${msg}</span>`;
  container.appendChild(el);
  setTimeout(() => {
    el.classList.add('exiting');
    el.addEventListener('animationend', () => el.remove());
  }, duration);
}

/* ──────────────────────────────────────────────────────────────────── */
/*  HERO CANVAS — Particle / Grid Visualiser                            */
/* ──────────────────────────────────────────────────────────────────── */
function initHeroCanvas() {
  const canvas = $('#hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // Particles
  const particles = Array.from({ length: 60 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    r: Math.random() * 1.5 + 0.5,
    opacity: Math.random() * 0.5 + 0.1,
  }));

  function drawFrame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(14, 165, 255, ${0.08 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    // Draw particles
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(14, 165, 255, ${p.opacity})`;
      ctx.fill();

      // Move
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
    });

    requestAnimationFrame(drawFrame);
  }
  drawFrame();
}

/* ──────────────────────────────────────────────────────────────────── */
/*  PRODUCT SVG GENERATORS (fallback if products.js SVGs not loaded)   */
/* ──────────────────────────────────────────────────────────────────── */
function getSVGForType(svgType, accentColor = '#0ea5ff', size = 90) {
  const c = accentColor;
  const s = size;
  const gradId = `g${Math.random().toString(36).slice(2)}`;

  const defs = `<defs>
    <linearGradient id="${gradId}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${c}" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="${c}" stop-opacity="0.2"/>
    </linearGradient>
    <filter id="glow${gradId}"><feGaussianBlur stdDeviation="2" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>`;

  const shapes = {
    building: `<rect x="20" y="25" width="30" height="50" fill="url(#${gradId})" stroke="${c}" stroke-width="1.5" filter="url(#glow${gradId})"/>
      <rect x="55" y="35" width="22" height="40" fill="${c}" opacity="0.4" stroke="${c}" stroke-width="1"/>
      <rect x="27" y="32" width="6" height="6" fill="${c}" opacity="0.8"/><rect x="37" y="32" width="6" height="6" fill="${c}" opacity="0.8"/>
      <rect x="27" y="44" width="6" height="6" fill="${c}" opacity="0.6"/><rect x="37" y="44" width="6" height="6" fill="${c}" opacity="0.6"/>
      <rect x="27" y="56" width="6" height="6" fill="${c}" opacity="0.4"/><rect x="37" y="56" width="6" height="6" fill="${c}" opacity="0.4"/>`,

    interior: `<rect x="15" y="20" width="70" height="55" rx="2" fill="none" stroke="${c}" stroke-width="1.5" opacity="0.6"/>
      <line x1="15" y1="55" x2="85" y2="55" stroke="${c}" stroke-width="1" opacity="0.4"/>
      <rect x="30" y="56" width="18" height="19" fill="url(#${gradId})"/>
      <rect x="20" y="25" width="20" height="25" rx="1" fill="${c}" opacity="0.15" stroke="${c}" stroke-width="1"/>
      <circle cx="55" cy="38" r="10" fill="${c}" opacity="0.12" stroke="${c}" stroke-width="1"/>`,

    city: `<rect x="10" y="40" width="15" height="35" fill="url(#${gradId})" stroke="${c}" stroke-width="1"/>
      <rect x="30" y="28" width="18" height="47" fill="${c}" opacity="0.5" stroke="${c}" stroke-width="1"/>
      <rect x="53" y="20" width="22" height="55" fill="url(#${gradId})" stroke="${c}" stroke-width="1.5" filter="url(#glow${gradId})"/>
      <rect x="80" y="45" width="12" height="30" fill="${c}" opacity="0.3" stroke="${c}" stroke-width="1"/>
      <line x1="10" y1="75" x2="92" y2="75" stroke="${c}" stroke-width="2" opacity="0.5"/>`,

    cathedral: `<polygon points="50,12 70,35 70,75 30,75 30,35" fill="url(#${gradId})" stroke="${c}" stroke-width="1.5" filter="url(#glow${gradId})"/>
      <line x1="50" y1="12" x2="50" y2="75" stroke="${c}" stroke-width="1" opacity="0.4"/>
      <ellipse cx="50" cy="35" rx="10" ry="14" fill="none" stroke="${c}" stroke-width="1" opacity="0.7"/>
      <rect x="42" y="55" width="16" height="20" fill="${c}" opacity="0.3"/>`,

    character: `<circle cx="50" cy="25" r="12" fill="url(#${gradId})" stroke="${c}" stroke-width="1.5" filter="url(#glow${gradId})"/>
      <rect x="38" y="38" width="24" height="28" rx="4" fill="${c}" opacity="0.5" stroke="${c}" stroke-width="1"/>
      <line x1="38" y1="42" x2="22" y2="58" stroke="${c}" stroke-width="3" stroke-linecap="round"/>
      <line x1="62" y1="42" x2="78" y2="58" stroke="${c}" stroke-width="3" stroke-linecap="round"/>
      <line x1="44" y1="66" x2="38" y2="80" stroke="${c}" stroke-width="3" stroke-linecap="round"/>
      <line x1="56" y1="66" x2="62" y2="80" stroke="${c}" stroke-width="3" stroke-linecap="round"/>`,

    environment: `<rect x="10" y="55" width="80" height="20" fill="url(#${gradId})" opacity="0.5"/>
      <polygon points="20,55 40,30 60,55" fill="${c}" opacity="0.4" stroke="${c}" stroke-width="1"/>
      <polygon points="50,55 68,28 85,55" fill="${c}" opacity="0.6" stroke="${c}" stroke-width="1" filter="url(#glow${gradId})"/>
      <circle cx="25" cy="30" r="8" fill="${c}" opacity="0.3"/>
      <circle cx="75" cy="42" r="5" fill="${c}" opacity="0.5"/>`,

    texture: `<rect x="12" y="12" width="35" height="35" fill="url(#${gradId})" stroke="${c}" stroke-width="1"/>
      <rect x="47" y="12" width="35" height="35" fill="${c}" opacity="0.3" stroke="${c}" stroke-width="1"/>
      <rect x="12" y="47" width="35" height="35" fill="${c}" opacity="0.3" stroke="${c}" stroke-width="1"/>
      <rect x="47" y="47" width="35" height="35" fill="url(#${gradId})" stroke="${c}" stroke-width="1"/>`,

    ring: `<ellipse cx="50" cy="64" rx="24" ry="10" fill="none" stroke="url(#${gradId})" stroke-width="8"/>
      <path d="M39 57 46 39 54 31 62 39 69 57" fill="url(#${gradId})" stroke="${c}" stroke-width="1.5" stroke-linejoin="round"/>
      <circle cx="54" cy="31" r="5" fill="${c}" opacity="0.9" filter="url(#glow${gradId})"/>`,

    necklace: `<path d="M20 30 Q50 95 80 30" fill="none" stroke="${c}" stroke-width="4" opacity="0.7"/>
      <path d="M27 39 Q50 85 73 39" fill="none" stroke="${c}" stroke-width="2" opacity="0.45"/>
      <path d="M50 70 61 81 50 94 39 81Z" fill="url(#${gradId})" stroke="${c}" stroke-width="1.5"/>
      <circle cx="50" cy="81" r="4" fill="${c}" opacity="0.9"/>`,

    earrings: `<circle cx="34" cy="48" r="15" fill="none" stroke="url(#${gradId})" stroke-width="5"/>
      <circle cx="66" cy="48" r="15" fill="none" stroke="url(#${gradId})" stroke-width="5"/>
      <path d="M34 64 41 75 34 88 27 75Z M66 64 73 75 66 88 59 75Z" fill="${c}" opacity="0.65" stroke="${c}" stroke-width="1"/>`,

    pendant: `<path d="M39 19 Q50 29 61 19 M50 27 V43" fill="none" stroke="${c}" stroke-width="3"/>
      <path d="M50 39 70 59 50 88 30 59Z" fill="url(#${gradId})" stroke="${c}" stroke-width="2" stroke-linejoin="round"/>
      <path d="M50 43 50 84 M32 59h36" fill="none" stroke="${c}" stroke-width="1" opacity="0.6"/>`,

    bracelet: `<ellipse cx="50" cy="56" rx="32" ry="20" fill="none" stroke="url(#${gradId})" stroke-width="7"/>
      ${Array.from({length:8}, (_,i) => {
        const a = i * Math.PI / 4;
        return `<circle cx="${50 + Math.cos(a) * 32}" cy="${56 + Math.sin(a) * 20}" r="4" fill="${c}" opacity="0.85"/>`;
      }).join('')}`,

    vehicle: `<ellipse cx="50" cy="58" rx="35" ry="10" fill="${c}" opacity="0.2"/>
      <path d="M18 58 Q18 45 28 40 L40 35 L60 35 L72 40 Q82 45 82 58 Z" fill="url(#${gradId})" stroke="${c}" stroke-width="1.5" filter="url(#glow${gradId})"/>
      <circle cx="30" cy="58" r="8" fill="${c}" opacity="0.6" stroke="${c}" stroke-width="1"/>
      <circle cx="70" cy="58" r="8" fill="${c}" opacity="0.6" stroke="${c}" stroke-width="1"/>`,

    prop: `<rect x="30" y="25" width="40" height="45" rx="6" fill="url(#${gradId})" stroke="${c}" stroke-width="1.5" filter="url(#glow${gradId})"/>
      <line x1="30" y1="40" x2="70" y2="40" stroke="${c}" stroke-width="1" opacity="0.5"/>
      <circle cx="50" cy="55" r="8" fill="${c}" opacity="0.4"/>`,
  };

  const shape = shapes[svgType] || shapes.building;
  return `<svg width="${s}" height="${s}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">${defs}${shape}</svg>`;
}

/* ──────────────────────────────────────────────────────────────────── */
/*  PRODUCT CARD RENDERER                                               */
/* ──────────────────────────────────────────────────────────────────── */
function renderProductCard(p) {
  const productId = escapeHTML(p.id);
  const productName = escapeHTML(p.name);
  const productCreator = escapeHTML(p.creator);
  const productCategory = escapeHTML(p.subcategory);
  const productFileSize = escapeHTML(p.fileSize);
  const isWished = state.wishlist.has(String(p.id));
  const discount = p.originalPrice
    ? Math.round((1 - p.price / p.originalPrice) * 100)
    : 0;
  const productImage = p.image || PRODUCT_IMAGES[p.id] || '';
  const fallbackSvg = getSVGForType(p.svgType, p.accentColor, 90);
  const productVisualMarkup = productImage
    ? `<img class="product-card-visual" src="${escapeHTML(productImage)}" alt="${productName}" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" />
       <div class="product-image-fallback" style="display:none;">${fallbackSvg}</div>`
    : `<div class="product-image-fallback">${fallbackSvg}</div>`;

  const badges = [
    p.featured ? `<span class="badge badge-blue">Featured</span>` : '',
    p.new      ? `<span class="badge badge-green">New</span>` : '',
    discount > 0 ? `<span class="badge badge-amber">-${discount}%</span>` : '',
  ].filter(Boolean).join('');

  const formatChips = p.formats.slice(0, 3)
    .map(f => `<span class="format-chip">${escapeHTML(f)}</span>`)
    .join('');

  return `
    <article class="product-card" role="listitem" data-id="${productId}"
             tabindex="0" aria-label="${productName} by ${productCreator}, ${fmt(p.price)}">

      <!-- Image / SVG area -->
      <div class="product-card-image">
        <div class="product-image-bg" aria-hidden="true"
             style="background:radial-gradient(ellipse at center,${p.accentColor}18 0%,transparent 70%)"></div>
        ${productVisualMarkup}

        <div class="product-badges" aria-hidden="true">${badges}</div>

        <div class="product-actions" aria-label="Quick actions">
          <button class="product-action-btn wishlist-toggle ${isWished ? 'favorited' : ''}"
                  data-id="${productId}" aria-label="${isWished ? 'Remove from' : 'Add to'} wishlist"
                  aria-pressed="${isWished}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="${isWished ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
          <button class="product-action-btn quick-view" data-id="${productId}" aria-label="Quick view ${productName}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
            </svg>
          </button>
        </div>

        <div class="product-format-chips" aria-hidden="true">${formatChips}</div>
      </div>

      <!-- Body -->
      <div class="product-card-body">
        <div class="product-meta">
          <span class="product-creator">${productCreator}</span>
          <span class="product-subcategory">${productCategory}</span>
        </div>

        <h3 class="product-name">${productName}</h3>

        <div class="product-specs">
          <span class="spec-item">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            ${productFileSize}
          </span>
          <span class="spec-item">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/></svg>
            ${p.polygons}
          </span>
          <span class="spec-item" style="color:var(--text-accent);opacity:0.7">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            ${p.downloads.toLocaleString()}
          </span>
        </div>

        <div class="product-rating">
          <div class="stars" aria-hidden="true">${starsHTML(p.rating)}</div>
          <span class="rating-value">${p.rating}</span>
          <span class="rating-count">(${p.reviews})</span>
        </div>

        <div class="product-footer">
          <div class="product-price-wrap">
            <span class="product-price" style="color:${p.accentColor};text-shadow:0 0 12px ${p.accentColor}60">
              ${fmt(p.price)}
            </span>
            ${p.originalPrice ? `<span class="product-price-original">${fmt(p.originalPrice)}</span>` : ''}
            ${discount > 0 ? `<span class="product-sale-pct">-${discount}%</span>` : ''}
          </div>
          <button class="btn btn-primary btn-sm add-to-cart" data-id="${productId}" aria-label="Add ${productName} to cart">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            Add
          </button>
        </div>
      </div>
    </article>
  `;
}

/* ──────────────────────────────────────────────────────────────────── */
/*  PRODUCT FILTERING & RENDERING                                       */
/* ──────────────────────────────────────────────────────────────────── */
function getFilteredProducts() {
  let list = allProducts();

  // Category
  if (state.activeCategory !== 'all') {
    list = list.filter(p => p.category === state.activeCategory);
  }

  // Subcategory
  if (state.activeSubcat) {
    list = list.filter(p => p.subcategory === state.activeSubcat);
  }

  // Search
  if (state.searchQuery) {
    const q = state.searchQuery.toLowerCase();
    list = list.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.creator.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q)) ||
      p.formats.some(f => f.toLowerCase().includes(q))
    );
  }

  // Price
  list = list.filter(p => p.price <= state.maxPrice);

  // Sort
  switch (state.sortBy) {
    case 'price-asc':   list.sort((a, b) => a.price - b.price); break;
    case 'price-desc':  list.sort((a, b) => b.price - a.price); break;
    case 'rating':      list.sort((a, b) => b.rating - a.rating); break;
    case 'newest':      list.sort((a, b) => (b.new ? 1 : 0) - (a.new ? 1 : 0)); break;
    case 'popular':     list.sort((a, b) => b.downloads - a.downloads); break;
    case 'featured':    list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0)); break;
  }

  return list;
}

function renderProducts() {
  const grid = $('#product-grid');
  const filtered = getFilteredProducts();

  $('#results-count').textContent = filtered.length;

  const categoryLabel = state.activeCategory
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
  const label = state.activeCategory !== 'all'
    ? ` in <strong style="color:var(--text-primary)">${categoryLabel}</strong>` : '';
  const searchLabel = state.searchQuery
    ? ` for "<strong style="color:var(--text-primary)">${escapeHTML(state.searchQuery)}</strong>"` : '';
  setHTML('#results-filter-label', label + searchLabel);

  if (filtered.length === 0) {
    grid.innerHTML = '';
    show('#empty-state');
  } else {
    hide('#empty-state');
    grid.innerHTML = filtered.map(renderProductCard).join('');
  }

  updateFilterCounts();
}

function updateFilterCounts() {
  const catIds = ['all', 'jewellery', 'architecture', 'game-design'];
  const products = allProducts();
  catIds.forEach(cat => {
    const el = $(`#count-${cat}`);
    if (!el) return;
    const count = cat === 'all'
      ? products.length
      : products.filter(p => p.category === cat).length;
    el.textContent = count;
  });
}

/* ─── Subcategory Chips ─────────────────────────────────────────────── */
function renderSubcategoryChips() {
  const wrap = $('#subcategory-chips');
  if (!wrap) return;

  const subcats = [...new Set(allProducts().map(p => p.subcategory))];

  wrap.innerHTML = subcats.map(sc => `
    <button class="filter-tab ${state.activeSubcat === sc ? 'active' : ''}"
            data-subcat="${sc}" style="font-size:0.72rem;padding:4px 10px;">
      ${sc}
    </button>
  `).join('');

  $$('[data-subcat]').forEach(btn => {
    btn.addEventListener('click', () => {
      const sc = btn.dataset.subcat;
      state.activeSubcat = state.activeSubcat === sc ? null : sc;
      renderSubcategoryChips();
      renderProducts();
    });
  });
}

/* ──────────────────────────────────────────────────────────────────── */
/*  SEARCH AUTOCOMPLETE                                                  */
/* ──────────────────────────────────────────────────────────────────── */
function renderAutocomplete(query) {
  const box = $('#search-autocomplete');
  if (!query.trim()) { box.classList.remove('open'); return; }

  const q = query.toLowerCase();
  const matches = allProducts().filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.tags.some(t => t.startsWith(q))
  ).slice(0, 6);

  if (!matches.length) { box.classList.remove('open'); return; }

  box.innerHTML = matches.map(p => `
    <div class="autocomplete-item" data-id="${p.id}" role="option" tabindex="0">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
      <span>${escapeHTML(p.name)}</span>
      <span class="autocomplete-item-cat">${escapeHTML(p.category)}</span>
    </div>
  `).join('');

  box.classList.add('open');

  $$('.autocomplete-item', box).forEach(item => {
    item.addEventListener('click', () => {
      const p = findProduct(item.dataset.id);
      if (p) { openViewer(p); }
      box.classList.remove('open');
      $('#nav-search').value = '';
    });
  });
}

/* ──────────────────────────────────────────────────────────────────── */
/*  CART OPERATIONS                                                      */
/* ──────────────────────────────────────────────────────────────────── */
function addToCart(productId, format) {
  const p = findProduct(productId);
  if (!p) return;

  const existing = state.cart.find(i => String(i.product.id) === String(productId) && i.format === (format || p.formats[0]));
  if (existing) {
    existing.qty++;
  } else {
    state.cart.push({ product: p, qty: 1, format: format || p.formats[0] });
  }

  renderCart();
  updateCartBadge();
  toast(`${escapeHTML(p.name)} added to cart`, 'success');
  openCart();
}

function removeFromCart(productId, format) {
  state.cart = state.cart.filter(i => !(String(i.product.id) === String(productId) && i.format === format));
  renderCart();
  updateCartBadge();
}

function updateQty(productId, format, delta) {
  const item = state.cart.find(i => String(i.product.id) === String(productId) && i.format === format);
  if (!item) return;
  item.qty = Math.max(1, item.qty + delta);
  renderCart();
}

function cartSubtotalUSD() {
  return state.cart.reduce((sum, i) => sum + i.product.price * i.qty, 0);
}

function renderCart() {
  const itemsEl = $('#cart-items');
  const emptyEl = $('#cart-empty');

  if (state.cart.length === 0) {
    itemsEl.innerHTML = '';
    itemsEl.appendChild(emptyEl);
    show(emptyEl);
    $('#checkout-btn').disabled = true;
  } else {
    hide(emptyEl);
    itemsEl.innerHTML = state.cart.map(item => `
      <div class="cart-item" role="listitem">
        <div class="cart-item-img">
          ${getSVGForType(item.product.svgType, item.product.accentColor, 36)}
        </div>
        <div>
          <div class="cart-item-name">${escapeHTML(item.product.name)}</div>
          <div class="cart-item-creator">${escapeHTML(item.product.creator)}</div>
          <div class="cart-item-format">${escapeHTML(item.format)}</div>
          <div class="cart-item-qty">
            <button class="qty-btn" data-id="${escapeHTML(item.product.id)}" data-fmt="${escapeHTML(item.format)}" data-delta="-1" aria-label="Decrease quantity">−</button>
            <span class="qty-value">${item.qty}</span>
            <button class="qty-btn" data-id="${escapeHTML(item.product.id)}" data-fmt="${escapeHTML(item.format)}" data-delta="1" aria-label="Increase quantity">+</button>
          </div>
        </div>
        <div>
          <div class="cart-item-price">${fmt(item.product.price * item.qty)}</div>
          <span class="cart-item-remove" data-id="${escapeHTML(item.product.id)}" data-fmt="${escapeHTML(item.format)}" role="button" tabindex="0" aria-label="Remove ${escapeHTML(item.product.name)} from cart">Remove</span>
        </div>
      </div>
    `).join('');

    // Bind qty/remove buttons
    $$('.qty-btn', itemsEl).forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        updateQty(btn.dataset.id, btn.dataset.fmt, +btn.dataset.delta);
      });
    });
    $$('.cart-item-remove', itemsEl).forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        removeFromCart(btn.dataset.id, btn.dataset.fmt);
      });
    });

    $('#checkout-btn').disabled = false;
  }

  // Shipping progress
  const subtotal = cartSubtotalUSD();
  const pct = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
  $('#shipping-fill').style.width = `${pct}%`;
  if (subtotal >= FREE_SHIPPING_THRESHOLD) {
    setHTML('#shipping-msg', '<span style="color:var(--success);font-weight:600;">🎉 Free global shipping unlocked!</span>');
  } else {
    const rem = (FREE_SHIPPING_THRESHOLD - subtotal).toFixed(2);
    setHTML('#shipping-msg', `Add <strong id="shipping-remaining">${fmt(+rem)}</strong> more for free global courier shipping!`);
  }

  // Totals
  const discount = state.promoCode
    ? (state.promoCode.type === 'pct'
       ? subtotal * state.promoCode.value / 100
       : Math.min(subtotal, state.promoCode.value))
    : 0;

  const discounted = subtotal - discount;
  const fee  = discounted * PLATFORM_FEE_PCT;
  const total = discounted + fee;

  $('#cart-subtotal').textContent = fmt(subtotal);
  $('#cart-fee').textContent = fmt(fee);
  $('#cart-total').textContent = fmt(total);

  const discRow = $('#discount-row');
  if (discount > 0) {
    discRow.style.display = 'flex';
    $('#cart-discount').textContent = `−${fmt(discount)}`;
  } else {
    discRow.style.display = 'none';
  }

  // Header count
  const totalQty = state.cart.reduce((s, i) => s + i.qty, 0);
  $('#cart-header-count').textContent = `${totalQty} item${totalQty !== 1 ? 's' : ''}`;
}

function updateCartBadge() {
  const qty = state.cart.reduce((s, i) => s + i.qty, 0);
  const badge = $('#cart-count');
  if (qty > 0) {
    badge.textContent = qty;
    show(badge);
    badge.classList.add('bump');
    setTimeout(() => badge.classList.remove('bump'), 300);
  } else {
    hide(badge);
  }
}

/* ─── Cart Drawer Open/Close ──────────────────────────────────────── */
function openCart() {
  $('#cart-drawer').classList.add('open');
  $('#cart-overlay').classList.add('open');
  $('#cart-btn').setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  $('#cart-drawer').classList.remove('open');
  $('#cart-overlay').classList.remove('open');
  $('#cart-btn').setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

/* ──────────────────────────────────────────────────────────────────── */
/*  WISHLIST                                                             */
/* ──────────────────────────────────────────────────────────────────── */
function toggleWishlist(productId) {
  const p = findProduct(productId);
  if (!p) return;
  const normalizedId = String(productId);

  if (state.wishlist.has(normalizedId)) {
    state.wishlist.delete(normalizedId);
    toast(`Removed from wishlist`, 'info');
  } else {
    state.wishlist.add(normalizedId);
    toast(`${escapeHTML(p.name)} saved to wishlist`, 'success');
  }

  renderProducts();
  updateWishlistBadge();
}

function updateWishlistBadge() {
  const count = state.wishlist.size;
  const badge = $('#wishlist-count');
  if (count > 0) {
    badge.textContent = count;
    show(badge);
  } else {
    hide(badge);
  }
}

/* ──────────────────────────────────────────────────────────────────── */
/*  3D PRODUCT VIEWER (Three.js)                                        */
/* ──────────────────────────────────────────────────────────────────── */
let viewerScene, viewerCamera, viewerRenderer, viewerMesh, viewerAnimFrame;

function openViewer(product) {
  state.viewerProduct = product;
  const modal = $('#viewer-modal');
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';

  // Populate sidebar
  populateViewerSidebar(product);

  // Init Three.js
  requestAnimationFrame(() => initThreeViewer(product));
}

function closeViewer() {
  $('#viewer-modal').classList.remove('open');
  document.body.style.overflow = '';
  if (viewerAnimFrame) cancelAnimationFrame(viewerAnimFrame);
  if (viewerRenderer) { viewerRenderer.dispose(); viewerRenderer = null; }
}

function populateViewerSidebar(p) {
  const discount = p.originalPrice ? Math.round((1 - p.price / p.originalPrice) * 100) : 0;

  // Badges
  setHTML('#viewer-badges', [
    p.featured ? `<span class="badge badge-blue">Featured</span>` : '',
    p.new      ? `<span class="badge badge-green">New</span>` : '',
    `<span class="badge badge-violet">${escapeHTML(p.category)}</span>`,
  ].filter(Boolean).join(''));

  setHTML('#viewer-title', escapeHTML(p.name));
  setHTML('#viewer-creator', `by ${escapeHTML(p.creator)}`);
  setHTML('#viewer-rating', `
    <div class="stars">${starsHTML(p.rating)}</div>
    <span class="rating-value">${p.rating}</span>
    <span class="rating-count">(${p.reviews} reviews · ${p.downloads.toLocaleString()} downloads)</span>
  `);
  setHTML('#viewer-description', escapeHTML(p.description));

  // Specs grid
  const specData = {
    'File Size':   escapeHTML(p.fileSize),
    'Polygons':    escapeHTML(p.polygons),
    'Textures':    escapeHTML(p.textures),
    'License':     escapeHTML(p.licensed),
  };
  setHTML('#viewer-specs', Object.entries(specData).map(([k, v]) => `
    <div class="viewer-spec-item">
      <div class="viewer-spec-label">${k}</div>
      <div class="viewer-spec-value">${v}</div>
    </div>
  `).join(''));

  // Formats
  setHTML('#viewer-formats', p.formats.map(f => `
    <div class="download-option">
      <span class="download-option-format">${escapeHTML(f)}</span>
      <span class="download-option-size">${escapeHTML(p.fileSize)}</span>
    </div>
  `).join(''));

  // Price
  setHTML('#viewer-price', fmt(p.price));
  if (p.originalPrice) {
    setHTML('#viewer-price-original', fmt(p.originalPrice));
    show('#viewer-sale-pct');
    setHTML('#viewer-sale-pct', `-${discount}%`);
  } else {
    setHTML('#viewer-price-original', '');
    hide('#viewer-sale-pct');
  }

  // Reviews stub
  setHTML('#viewer-reviews', `
    <div style="border-top:1px solid var(--border);padding-top:1rem;">
      <p style="font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--text-muted);margin-bottom:0.75rem;">Top Reviews</p>
      ${p.reviews > 0 ? generateFakeReviews(p) : '<p style="font-size:0.8rem;color:var(--text-secondary);">No reviews yet.</p>'}
    </div>
  `);
}

function generateFakeReviews(p) {
  const reviewers = ['arch_viz_pro', 'gamedev_studio', 'PixelCraft3D', 'NordForm_Fan', 'TechVizMaster'];
  return reviewers.slice(0, 3).map((name, i) => `
    <div style="padding:0.75rem 0;border-bottom:1px solid rgba(255,255,255,0.04);">
      <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
        <span style="font-size:0.8rem;font-weight:600;font-family:var(--font-ui);">@${name}</span>
        <div class="stars" style="font-size:0.7rem;">${starsHTML(p.rating - (i * 0.1))}</div>
      </div>
      <p style="font-size:0.78rem;color:var(--text-secondary);">
        ${['Incredible detail and optimized geometry. Saved hours of modeling time.',
           'Perfect for my arch-viz project. Great textures and clean topology.',
           'Very impressed with the file organisation and documentation.'][i]}
      </p>
    </div>
  `).join('');
}

function initThreeViewer(product) {
  const canvas = $('#product-viewer-canvas');
  if (!canvas || typeof THREE === 'undefined') {
    // Fallback: show SVG art
    const ctx2d = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth || 500;
    canvas.height = canvas.offsetHeight || 400;
    drawFallbackViewer(ctx2d, canvas.width, canvas.height, product);
    return;
  }

  if (viewerRenderer) { viewerRenderer.dispose(); }

  const W = canvas.offsetWidth || 500;
  const H = canvas.offsetHeight || 400;

  viewerScene    = new THREE.Scene();
  viewerCamera   = new THREE.PerspectiveCamera(50, W / H, 0.1, 100);
  viewerCamera.position.set(2.5, 1.5, 2.5);
  viewerCamera.lookAt(0, 0, 0);

  viewerRenderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  viewerRenderer.setSize(W, H);
  viewerRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  viewerRenderer.setClearColor(0x000000, 0);

  // Lighting
  const ambient = new THREE.AmbientLight(0x404060, 2);
  viewerScene.add(ambient);
  const dirLight = new THREE.DirectionalLight(0x0ea5ff, 3);
  dirLight.position.set(3, 5, 4);
  viewerScene.add(dirLight);
  const rimLight = new THREE.DirectionalLight(0x7c3aed, 1);
  rimLight.position.set(-3, -1, -2);
  viewerScene.add(rimLight);

  // Build geometry based on category
  const geom = buildViewerGeometry(product);
  const mat  = new THREE.MeshStandardMaterial({
    color: new THREE.Color(product.accentColor),
    metalness: 0.6,
    roughness: 0.3,
    wireframe: state.viewerWireframe,
  });

  viewerMesh = new THREE.Mesh(geom, mat);
  viewerScene.add(viewerMesh);

  // Grid helper
  const grid = new THREE.GridHelper(6, 12, 0x0ea5ff, 0x0ea5ff);
  grid.material.opacity = 0.08;
  grid.material.transparent = true;
  grid.position.y = -1;
  viewerScene.add(grid);

  // Mouse drag
  let isDragging = false, prevX = 0, prevY = 0;
  canvas.addEventListener('mousedown', e => { isDragging = true; prevX = e.clientX; prevY = e.clientY; });
  window.addEventListener('mouseup', () => { isDragging = false; });
  window.addEventListener('mousemove', e => {
    if (!isDragging || !viewerMesh) return;
    const dx = e.clientX - prevX;
    const dy = e.clientY - prevY;
    viewerMesh.rotation.y += dx * 0.01;
    viewerMesh.rotation.x += dy * 0.01;
    prevX = e.clientX; prevY = e.clientY;
    state.viewerAutoRotate = false;
  });

  // Animate
  let t = 0;
  function animate() {
    viewerAnimFrame = requestAnimationFrame(animate);
    t += 0.01;
    if (state.viewerAutoRotate && viewerMesh) {
      viewerMesh.rotation.y += 0.008;
      viewerMesh.position.y = Math.sin(t) * 0.08;
    }
    viewerRenderer.render(viewerScene, viewerCamera);
  }
  animate();
}

function buildViewerGeometry(product) {
  switch (product.category) {
    case 'architecture':
      return product.subcategory === 'urban'
        ? new THREE.BoxGeometry(1, 2.4, 1)
        : new THREE.BoxGeometry(1.6, 0.9, 1.4);
    case 'game-design':
      return product.subcategory === 'characters'
        ? new THREE.SphereGeometry(1, 24, 16)
        : new THREE.OctahedronGeometry(1.2, 1);
    case 'jewellery':
      if (product.subcategory === 'earrings') return new THREE.TorusGeometry(0.45, 0.09, 16, 48);
      if (product.subcategory === 'necklaces') return new THREE.TorusGeometry(0.9, 0.06, 12, 64);
      if (product.subcategory === 'bracelets') return new THREE.TorusGeometry(0.75, 0.08, 12, 64);
      return new THREE.TorusGeometry(0.62, 0.13, 16, 64);
    default:
      return new THREE.TorusKnotGeometry(0.8, 0.25, 120, 16);
  }
}

function drawFallbackViewer(ctx, w, h, product) {
  // Simple canvas art when Three.js unavailable
  ctx.clearRect(0, 0, w, h);
  const grd = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, Math.min(w,h)/2);
  grd.addColorStop(0, product.accentColor + '33');
  grd.addColorStop(1, 'transparent');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, w, h);

  // Draw large SVG
  const svgStr = getSVGForType(product.svgType, product.accentColor, Math.min(w, h) * 0.6);
  const blob = new Blob([svgStr], { type: 'image/svg+xml' });
  const url  = URL.createObjectURL(blob);
  const img  = new Image();
  img.onload = () => {
    ctx.drawImage(img, w/2 - img.width/2, h/2 - img.height/2);
    URL.revokeObjectURL(url);
  };
  img.src = url;
}

/* ──────────────────────────────────────────────────────────────────── */
/*  CHECKOUT FLOW                                                        */
/* ──────────────────────────────────────────────────────────────────── */
function openCheckout() {
  closeCart();
  state.checkoutStep = 1;
  renderCheckoutStep(1);
  $('#checkout-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCheckout() {
  $('#checkout-modal').classList.remove('open');
  document.body.style.overflow = '';
}

function renderCheckoutStep(step) {
  state.checkoutStep = step;

  // Step panels
  $$('.checkout-step-panel').forEach(p => p.classList.remove('active'));
  $(`#checkout-step-${step}`)?.classList.add('active');

  // Step indicators
  for (let i = 1; i <= 3; i++) {
    const ind = $(`#step-ind-${i}`);
    if (!ind) continue;
    ind.classList.remove('active', 'done');
    if (i === step) ind.classList.add('active');
    else if (i < step) ind.classList.add('done');
  }

  // Populate order summary in step 2
  if (step === 2) {
    const subtotal = cartSubtotalUSD();
    const discount = state.promoCode
      ? (state.promoCode.type === 'pct' ? subtotal * state.promoCode.value / 100 : Math.min(subtotal, state.promoCode.value))
      : 0;
    const discounted = subtotal - discount;
    const fee   = discounted * PLATFORM_FEE_PCT;
    const total = discounted + fee;

    setHTML('#checkout-summary-items', state.cart.map(i => `
      <div style="display:flex;justify-content:space-between;margin-bottom:4px;color:var(--text-secondary);">
        <span>${escapeHTML(i.product.name)} (${escapeHTML(i.format)}) ×${i.qty}</span>
        <span>${fmt(i.product.price * i.qty)}</span>
      </div>
    `).join('') + (discount > 0 ? `
      <div style="display:flex;justify-content:space-between;margin-bottom:4px;color:var(--success);">
        <span>Promo discount</span><span>−${fmt(discount)}</span>
      </div>
    ` : ''));

    setHTML('#checkout-total', fmt(total));
  }
}

function validateStep1() {
  const email = $('#email').value.trim();
  const firstName = $('#first-name').value.trim();

  let valid = true;

  if (!firstName) {
    $('#first-name').classList.add('error');
    valid = false;
  } else {
    $('#first-name').classList.remove('error');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    $('#email').classList.add('error');
    show('#email-error');
    valid = false;
  } else {
    $('#email').classList.remove('error');
    hide('#email-error');
  }

  return valid;
}

/* ──────────────────────────────────────────────────────────────────── */
/*  DASHBOARD                                                            */
/* ──────────────────────────────────────────────────────────────────── */
function openDashboard() {
  $('#dashboard-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  renderDashboard();
}

function closeDashboard() {
  $('#dashboard-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

function switchDashboardSection(section) {
  state.dashboardSection = section;

  $$('.dashboard-nav-item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.section === section);
  });
  $$('.dashboard-section').forEach(sec => {
    sec.classList.toggle('active', sec.id === `section-${section}`);
  });
}

function switchDashboardRole(role) {
  state.dashboardRole = role;

  const roleLabels = { buyer: 'Buyer Dashboard', creator: 'Creator Studio', admin: 'Admin Panel' };
  setHTML('#dashboard-role-label', roleLabels[role] || 'Dashboard');

  const buyerNav   = $('#buyer-nav');
  const creatorNav = $('#creator-nav');

  // Rebuild sidebar nav per role
  if (role === 'buyer') {
    buyerNav.style.display = '';
    if (creatorNav) creatorNav.style.display = 'none';
    switchDashboardSection('purchases');
  } else if (role === 'creator') {
    buyerNav.style.display = 'none';
    if (creatorNav) creatorNav.style.display = '';
    else buildCreatorNav();
    switchDashboardSection('analytics');
  } else {
    buyerNav.style.display = 'none';
    if (creatorNav) creatorNav.style.display = 'none';
    buildAdminNav();
    switchDashboardSection('users');
  }

  renderDashboard();
}

function buildCreatorNav() {
  const sidebar = $('.dashboard-sidebar');
  const existing = $('#creator-nav');
  if (existing) { existing.style.display = ''; return; }

  const nav = document.createElement('div');
  nav.id = 'creator-nav';
  nav.innerHTML = `
    <button class="dashboard-nav-item" data-section="analytics">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> Analytics
    </button>
    <button class="dashboard-nav-item" data-section="my-products">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> My Products
    </button>
    <button class="dashboard-nav-item" data-section="earnings">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> Earnings
    </button>
  `;
  const roleBadge = $('.dashboard-role-badge');
  roleBadge.insertAdjacentElement('afterend', nav);

  nav.querySelectorAll('[data-section]').forEach(btn => {
    btn.addEventListener('click', () => switchDashboardSection(btn.dataset.section));
  });
}

function buildAdminNav() {
  const sidebar = $('.dashboard-sidebar');
  const existing = $('#admin-nav');
  if (existing) { existing.style.display = ''; return; }

  const nav = document.createElement('div');
  nav.id = 'admin-nav';
  nav.innerHTML = `
    <button class="dashboard-nav-item" data-section="users">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> Users
    </button>
    <button class="dashboard-nav-item" data-section="moderation">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> Moderation
    </button>
  `;
  const roleBadge = $('.dashboard-role-badge');
  roleBadge.insertAdjacentElement('afterend', nav);

  nav.querySelectorAll('[data-section]').forEach(btn => {
    btn.addEventListener('click', () => switchDashboardSection(btn.dataset.section));
  });
}

function renderDashboard() {
  const role = state.dashboardRole;

  if (role === 'buyer') {
    // Buyer stats
    const totalSpent = state.purchases.reduce((s, o) => s + o.total, 0);
    setHTML('#buyer-stats', [
      { label: 'Total Purchases', value: state.purchases.length, delta: '' },
      { label: 'Total Spent',     value: fmt(totalSpent), delta: '' },
      { label: 'Saved Items',     value: state.wishlist.size, delta: '' },
      { label: 'Licenses Owned',  value: state.purchases.length, delta: '' },
    ].map(s => `
      <div class="stat-card">
        <div class="stat-card-label">${s.label}</div>
        <div class="stat-card-value">${s.value}</div>
      </div>
    `).join(''));

    // Purchases table
    if (state.purchases.length === 0) {
      setHTML('#purchases-table-wrap', '<p style="color:var(--text-muted);font-size:0.875rem;">No purchases yet. Browse assets to get started.</p>');
    } else {
      setHTML('#purchases-table-wrap', `
        <table class="data-table">
          <thead><tr>
            <th>Order ID</th><th>Date</th><th>Items</th><th>Total</th><th>Status</th>
          </tr></thead>
          <tbody>${state.purchases.map(o => `
            <tr>
              <td style="font-family:var(--font-mono);font-size:0.75rem;color:var(--blue-soft)">${o.orderId}</td>
              <td>${o.date}</td>
              <td>${o.items.length} item${o.items.length !== 1 ? 's' : ''}</td>
              <td style="color:var(--blue-vivid);font-family:var(--font-display);font-weight:700">${fmt(o.total)}</td>
              <td><span class="badge badge-green">${o.status}</span></td>
            </tr>
          `).join('')}</tbody>
        </table>
      `);
    }

    // Downloads
    setHTML('#downloads-list', state.purchases.length === 0
      ? '<p style="color:var(--text-muted);font-size:0.875rem;">No downloads yet.</p>'
      : state.purchases.flatMap(o => o.items).map(item => `
          <div style="display:flex;align-items:center;justify-content:space-between;padding:0.75rem;background:var(--bg-surface);border:1px solid var(--border);border-radius:var(--radius-lg);margin-bottom:0.5rem;">
            <div style="display:flex;align-items:center;gap:0.75rem;">
              ${getSVGForType(item.product.svgType, item.product.accentColor, 32)}
              <div>
                <div style="font-size:0.85rem;font-weight:600;">${escapeHTML(item.product.name)}</div>
                <div style="font-size:0.72rem;color:var(--text-muted);font-family:var(--font-mono);">${escapeHTML(item.format)} · ${escapeHTML(item.product.fileSize)}</div>
              </div>
            </div>
            <button class="btn btn-outline btn-sm" onclick="simulateCDNDownload('${item.product.name}', '${item.format}', '${item.product.fileSize}')">
              ⬇ Re-download
            </button>
          </div>
        `).join('')
    );

    // Wishlist
    const wishedProducts = allProducts().filter(p => state.wishlist.has(String(p.id)));
    setHTML('#wishlist-grid', wishedProducts.length === 0
      ? '<p style="color:var(--text-muted);font-size:0.875rem;grid-column:1/-1;">No saved items yet.</p>'
      : wishedProducts.map(renderProductCard).join('')
    );

    // Licenses
    setHTML('#licenses-list', state.purchases.length === 0
      ? '<p style="color:var(--text-muted);font-size:0.875rem;">No licenses yet.</p>'
      : state.purchases.flatMap(o => o.items).map(item => `
          <div style="padding:0.75rem;background:var(--bg-surface);border:1px solid var(--border);border-radius:var(--radius-lg);margin-bottom:0.5rem;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <div>
                <div style="font-size:0.85rem;font-weight:600;">${escapeHTML(item.product.name)}</div>
                <div style="font-family:var(--font-mono);font-size:0.72rem;color:var(--blue-soft);margin-top:2px;">
                  LIC-${Math.random().toString(36).slice(2,10).toUpperCase()}
                </div>
              </div>
              <span class="badge badge-blue">Standard License</span>
            </div>
          </div>
        `).join('')
    );

  } else if (role === 'creator') {
    // Creator stats (simulated)
    setHTML('#creator-stats', [
      { label: 'Total Revenue',   value: fmt(14820) },
      { label: 'Assets Listed',   value: '18' },
      { label: 'Total Downloads', value: '4,320' },
      { label: 'Avg Rating',      value: '4.8 ★' },
    ].map(s => `
      <div class="stat-card">
        <div class="stat-card-label">${s.label}</div>
        <div class="stat-card-value" style="font-size:1.4rem">${s.value}</div>
      </div>
    `).join(''));

    // Analytics chart (CSS bar chart)
    const months = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
    const sales   = [890, 1240, 980, 1650, 1320, 1890];
    const maxSale = Math.max(...sales);
    setHTML('#analytics-chart-wrap', `
      <p style="font-size:0.8rem;font-weight:600;font-family:var(--font-ui);color:var(--text-muted);margin-bottom:1.5rem;text-transform:uppercase;letter-spacing:0.08em;">Monthly Revenue (USD)</p>
      <div style="display:flex;align-items:flex-end;gap:1rem;height:120px;">
        ${months.map((m, i) => `
          <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;">
            <div style="font-size:0.7rem;color:var(--text-muted)">${fmt(sales[i]).replace('.00','')}</div>
            <div style="width:100%;background:linear-gradient(180deg,var(--blue-vivid),var(--blue-dim));border-radius:4px 4px 0 0;
                        height:${(sales[i]/maxSale)*100}px;box-shadow:0 0 8px var(--blue-glow);transition:height 0.5s ease;"></div>
            <div style="font-size:0.72rem;color:var(--text-muted)">${m}</div>
          </div>
        `).join('')}
      </div>
    `);

    // My Products table
    const creatorProducts = allProducts().slice(0, 5);
    setHTML('#my-products-table', `
      <table class="data-table">
        <thead><tr><th>Asset</th><th>Category</th><th>Price</th><th>Downloads</th><th>Rating</th><th>Status</th></tr></thead>
        <tbody>${creatorProducts.map(p => `
          <tr>
            <td style="font-weight:600">${escapeHTML(p.name)}</td>
            <td><span class="badge badge-violet">${p.category}</span></td>
            <td style="color:var(--blue-vivid);font-weight:700">${fmt(p.price)}</td>
            <td>${p.downloads.toLocaleString()}</td>
            <td>${p.rating} ★</td>
            <td><span class="badge badge-green">Live</span></td>
          </tr>
        `).join('')}</tbody>
      </table>
    `);

    // Earnings
    setHTML('#earnings-stats', [
      { label: 'Pending Payout',  value: fmt(2340) },
      { label: 'Total Earned',    value: fmt(14820) },
      { label: 'Commission Rate', value: '80%' },
    ].map(s => `
      <div class="stat-card">
        <div class="stat-card-label">${s.label}</div>
        <div class="stat-card-value" style="font-size:1.4rem">${s.value}</div>
      </div>
    `).join(''));

    setHTML('#payouts-table', `
      <table class="data-table">
        <thead><tr><th>Date</th><th>Amount</th><th>Method</th><th>Status</th></tr></thead>
        <tbody>
          <tr><td>2026-08-01</td><td style="color:var(--success)">+${fmt(1840)}</td><td>Bank Transfer</td><td><span class="badge badge-green">Paid</span></td></tr>
          <tr><td>2026-07-01</td><td style="color:var(--success)">+${fmt(2100)}</td><td>Bank Transfer</td><td><span class="badge badge-green">Paid</span></td></tr>
          <tr><td>2026-06-01</td><td style="color:var(--success)">+${fmt(980)}</td><td>Bank Transfer</td><td><span class="badge badge-green">Paid</span></td></tr>
        </tbody>
      </table>
    `);

  } else if (role === 'admin') {
    // Admin stats
    setHTML('#admin-stats', [
      { label: 'Total Users',    value: '8,247' },
      { label: 'Active Listings', value: '50,182' },
      { label: 'Monthly Revenue', value: fmt(284000) },
      { label: 'Disputes Open',  value: '3' },
    ].map(s => `
      <div class="stat-card">
        <div class="stat-card-label">${s.label}</div>
        <div class="stat-card-value" style="font-size:1.4rem">${s.value}</div>
      </div>
    `).join(''));

    setHTML('#users-table-wrap', `
      <table class="data-table">
        <thead><tr><th>User</th><th>Role</th><th>Joined</th><th>Revenue</th><th>Status</th><th>Action</th></tr></thead>
        <tbody>
          <tr><td>@ironpoly</td><td>Creator</td><td>2024-03</td><td style="color:var(--blue-vivid)">${fmt(18200)}</td><td><span class="badge badge-green">Verified</span></td><td><button class="btn btn-ghost btn-sm">Manage</button></td></tr>
          <tr><td>@archicore</td><td>Creator</td><td>2023-11</td><td style="color:var(--blue-vivid)">${fmt(22800)}</td><td><span class="badge badge-green">Verified</span></td><td><button class="btn btn-ghost btn-sm">Manage</button></td></tr>
          <tr><td>@shadowforge</td><td>Creator</td><td>2025-01</td><td style="color:var(--blue-vivid)">${fmt(9100)}</td><td><span class="badge badge-amber">Pending</span></td><td><button class="btn btn-ghost btn-sm">Review</button></td></tr>
          <tr><td>@buyer_5821</td><td>Buyer</td><td>2026-07</td><td>—</td><td><span class="badge badge-green">Active</span></td><td><button class="btn btn-ghost btn-sm">Manage</button></td></tr>
        </tbody>
      </table>
    `);

    setHTML('#moderation-queue', `
      ${[
        { name: 'Cyberpunk Vehicle Pack', creator: '@newuser99', status: 'Pending Review' },
        { name: 'Fantasy Creature Bundle', creator: '@sketchy_artist', status: 'Flagged' },
        { name: 'Parametric Tower Kit', creator: '@arch_new', status: 'Pending Review' },
      ].map(item => `
        <div style="display:flex;align-items:center;justify-content:space-between;padding:0.75rem;background:var(--bg-surface);border:1px solid var(--border);border-radius:var(--radius-lg);margin-bottom:0.5rem;">
          <div>
            <div style="font-size:0.85rem;font-weight:600;">${item.name}</div>
            <div style="font-size:0.72rem;color:var(--text-muted);">${item.creator}</div>
          </div>
          <div style="display:flex;gap:0.5rem;align-items:center;">
            <span class="badge ${item.status === 'Flagged' ? 'badge-amber' : 'badge-blue'}">${item.status}</span>
            <button class="btn btn-success btn-sm" onclick="toast('Asset approved ✓','success')">Approve</button>
            <button class="btn btn-danger btn-sm" onclick="toast('Asset rejected','error')">Reject</button>
          </div>
        </div>
      `).join('')}
    `);
  }

  // Re-bind product cards in wishlist section
  $$('.add-to-cart', $('#wishlist-grid')).forEach(btn => {
    btn.addEventListener('click', e => { e.stopPropagation(); addToCart(btn.dataset.id); });
  });
  $$('.wishlist-toggle', $('#wishlist-grid')).forEach(btn => {
    btn.addEventListener('click', e => { e.stopPropagation(); toggleWishlist(btn.dataset.id); });
  });
}

/* ─── CDN Download Simulation ───────────────────────────────────────── */
function simulateCDNDownload(name, format, size) {
  toast(`⬇ Starting CDN download: ${name} ${format}`, 'download');

  setTimeout(() => {
    const anchor = document.createElement('a');
    anchor.href = '#';
    anchor.download = `${name.replace(/\s+/g,'_')}${format}`;
    anchor.click();
    toast(`✓ ${name} downloaded via edge CDN`, 'success');
  }, 1200);
}

window.simulateCDNDownload = simulateCDNDownload;

/* ──────────────────────────────────────────────────────────────────── */
/*  EVENT LISTENERS — Bootstrap                                          */
/* ──────────────────────────────────────────────────────────────────── */
function initEventListeners() {

  // ── Navbar scroll ──
  window.addEventListener('scroll', () => {
    $('#navbar').classList.toggle('scrolled', window.scrollY > 20);
  });

  // ── Search ──
  const searchInput = $('#nav-search');
  let searchDebounce;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => {
      state.searchQuery = searchInput.value.trim();
      renderAutocomplete(state.searchQuery);
      renderProducts();
    }, 250);
  });

  document.addEventListener('click', e => {
    if (!e.target.closest('.nav-search-wrap')) {
      $('#search-autocomplete').classList.remove('open');
    }
  });

  // ── Category filter tabs ──
  $$('[data-cat]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.activeCategory = btn.dataset.cat;
      state.activeSubcat   = null;

      $$('[data-cat]').forEach(b => b.classList.remove('active'));
      $$(`[data-cat="${btn.dataset.cat}"]`).forEach(b => b.classList.add('active'));

      renderSubcategoryChips();
      renderProducts();

      // Scroll to products
      document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // ── Sort ──
  $('#sort-select').addEventListener('change', e => {
    state.sortBy = e.target.value;
    renderProducts();
  });

  // ── Price slider ──
  const slider = $('#price-slider');
  slider.addEventListener('input', () => {
    state.maxPrice = +slider.value;
    const pct = ((state.maxPrice - 0) / (500 - 0)) * 100;
    slider.style.setProperty('--slider-pct', `${pct}%`);
    setHTML('#price-max-label', `$${state.maxPrice}`);
    renderProducts();
  });

  // ── Currency ──
  $('#currency-select').addEventListener('change', e => {
    state.currency = e.target.value;
    renderProducts();
    renderCart();
  });

  // ── Cart open / close ──
  $('#cart-btn').addEventListener('click', openCart);
  $('#cart-close').addEventListener('click', closeCart);
  $('#cart-overlay').addEventListener('click', closeCart);

  // ── Promo code ──
  $('#promo-apply').addEventListener('click', () => {
    const code = $('#promo-input').value.trim().toUpperCase();
    const msgEl = $('#promo-msg');

    if (PROMO_CODES[code]) {
      state.promoCode = PROMO_CODES[code];
      $('#promo-input').classList.add('applied');
      show(msgEl);
      msgEl.classList.remove('error');
      msgEl.textContent = `✓ ${PROMO_CODES[code].label} applied!`;
      renderCart();
      toast(`Promo code applied: ${PROMO_CODES[code].label}`, 'success');
    } else {
      state.promoCode = null;
      $('#promo-input').classList.remove('applied');
      show(msgEl);
      msgEl.classList.add('error');
      msgEl.textContent = '✗ Invalid promo code.';
      renderCart();
    }
  });

  // ── Checkout open / close ──
  $('#checkout-btn').addEventListener('click', openCheckout);
  $('#checkout-close').addEventListener('click', closeCheckout);

  // ── Step 1 → 2 ──
  $('#step1-next').addEventListener('click', () => {
    if (validateStep1()) renderCheckoutStep(2);
  });

  // ── Step 2 back ──
  $('#step2-back').addEventListener('click', () => renderCheckoutStep(1));

  // ── Payment method selection ──
  const paymentMethods = $$('.payment-method');
  paymentMethods.forEach((btn, index) => {
    btn.addEventListener('click', () => {
      paymentMethods.forEach(b => {
        b.classList.remove('selected');
        b.setAttribute('aria-checked', 'false');
      });
      btn.classList.add('selected');
      btn.setAttribute('aria-checked', 'true');
      state.paymentMethod = btn.dataset.method;
      const methodName = btn.querySelector('.payment-method-name').textContent;
      $('#payment-method-message').textContent =
        `${methodName} selected. Connect a payment provider to accept real payments. This preview does not collect payment details.`;
    });
    btn.addEventListener('keydown', event => {
      if (!['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'].includes(event.key)) return;
      event.preventDefault();
      const direction = ['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : -1;
      const nextIndex = (index + direction + paymentMethods.length) % paymentMethods.length;
      paymentMethods[nextIndex].focus();
      paymentMethods[nextIndex].click();
    });
  });

  // ── Close checkout after confirmation ──
  $('#confirm-done').addEventListener('click', () => {
    closeCheckout();
    openDashboard();
  });

  // ── Dashboard ──
  $('#dashboard-btn').addEventListener('click', openDashboard);
  $('#dashboard-close').addEventListener('click', closeDashboard);

  $$('.dashboard-nav-item[data-section]').forEach(btn => {
    btn.addEventListener('click', () => switchDashboardSection(btn.dataset.section));
  });

  $('#role-switcher').addEventListener('change', e => {
    switchDashboardRole(e.target.value);
  });

  $('#request-payout-btn')?.addEventListener('click', () => {
    toast('Payout request submitted. Processing within 3 business days.', 'success');
  });

  // ── Viewer open/close ──
  $('#viewer-close').addEventListener('click', closeViewer);
  $('#viewer-modal').addEventListener('click', e => {
    if (e.target === $('#viewer-modal')) closeViewer();
  });

  $('#viewer-add-to-cart').addEventListener('click', () => {
    if (state.viewerProduct) {
      addToCart(state.viewerProduct.id);
    }
  });

  $('#viewer-wishlist').addEventListener('click', () => {
    if (state.viewerProduct) toggleWishlist(state.viewerProduct.id);
  });

  $('#viewer-rotate-btn').addEventListener('click', () => {
    state.viewerAutoRotate = !state.viewerAutoRotate;
    $('#viewer-rotate-btn').style.color = state.viewerAutoRotate ? 'var(--blue-vivid)' : '';
  });

  $('#viewer-wireframe-btn').addEventListener('click', () => {
    state.viewerWireframe = !state.viewerWireframe;
    if (viewerMesh) viewerMesh.material.wireframe = state.viewerWireframe;
    $('#viewer-wireframe-btn').style.color = state.viewerWireframe ? 'var(--blue-vivid)' : '';
  });

  $('#viewer-reset-btn').addEventListener('click', () => {
    if (viewerMesh) { viewerMesh.rotation.set(0, 0, 0); }
    state.viewerAutoRotate = true;
  });

  // ── Hero buttons ──
  $('#hero-browse-btn')?.addEventListener('click', () => {
    document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
  });

  $('#hero-upload-btn')?.addEventListener('click', () => {
    window.openCreatorUploadPanel?.();
  });
  $('#open-upload-panel')?.addEventListener('click', () => {
    closeDashboard();
    window.openCreatorUploadPanel?.();
  });

  // ── Product grid delegation ──
  $('#product-grid').addEventListener('click', e => {
    const card = e.target.closest('.product-card');
    if (!card) return;

    if (e.target.closest('.wishlist-toggle')) {
      toggleWishlist(e.target.closest('[data-id]').dataset.id);
      return;
    }
    if (e.target.closest('.add-to-cart')) {
      addToCart(e.target.closest('[data-id]').dataset.id);
      return;
    }
    if (e.target.closest('.quick-view') || card) {
      const p = findProduct(card.dataset.id);
      if (p) openViewer(p);
    }
  });

  // Keyboard support for product cards
  $('#product-grid').addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      const card = e.target.closest('.product-card');
      if (card) {
        e.preventDefault();
        const p = findProduct(card.dataset.id);
        if (p) openViewer(p);
      }
    }
  });

  // ── Wishlist dashboard btn ──
  $('#wishlist-btn').addEventListener('click', () => {
    state.dashboardRole = 'buyer';
    openDashboard();
    setTimeout(() => switchDashboardSection('wishlist'), 100);
  });

  // ── ESC to close modals ──
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if ($('#viewer-modal').classList.contains('open'))    closeViewer();
      if ($('#checkout-modal').classList.contains('open'))  closeCheckout();
      if ($('#dashboard-overlay').classList.contains('open')) closeDashboard();
      if ($('#cart-drawer').classList.contains('open'))     closeCart();
    }
  });
}

/* ──────────────────────────────────────────────────────────────────── */
/*  INITIALISE                                                           */
/* ──────────────────────────────────────────────────────────────────── */
function init() {
  initHeroCanvas();
  document.addEventListener('community-products-loaded', event => {
    state.communityProducts = Array.isArray(event.detail?.products) ? event.detail.products : [];
    hide('#community-sync-error');
    renderSubcategoryChips();
    renderProducts();
  });
  document.addEventListener('community-products-error', event => {
    const errorEl = $('#community-sync-error');
    errorEl.textContent = `Community uploads could not be loaded: ${event.detail?.message || 'Check the cloud storage connection and retry.'}`;
    show(errorEl);
  });
  renderSubcategoryChips();
  renderProducts();
  renderCart();
  initEventListeners();

  // Seed a demo purchase for showcase
  state.purchases.push({
    orderId: 'SSJ-DEMO2026-SAMPLE',
    date: '2026-09-01',
    items: [{ product: PRODUCTS[0], qty: 1, format: PRODUCTS[0].formats[0] }],
    total: PRODUCTS[0].price,
    status: 'Completed',
    email: 'demo@ssjewellery.com',
  });

  // Animate hero stats counter
  animateCounters();

  console.log('%c SS JEWELLERY CREATORS ', 'background:#0ea5ff;color:#000;font-weight:700;padding:4px 12px;border-radius:4px;', '— 3D Asset Marketplace Loaded');
}

function animateCounters() {
  // Simple number counter animation
  const counters = [
    { el: '#stat-assets', target: 50000, suffix: 'K+', divisor: 1000 },
    { el: '#stat-creators', target: 8200, suffix: '+', divisor: 1 },
    { el: '#stat-downloads', target: 2100000, suffix: 'M+', divisor: 1000000 },
  ];

  counters.forEach(({ el, target, suffix, divisor }) => {
    const element = $(el);
    if (!element) return;
    let current = 0;
    const increment = target / 60;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      const display = divisor > 1 ? (current / divisor).toFixed(1).replace('.0','') : Math.floor(current).toLocaleString();
      element.textContent = display + suffix;
    }, 30);
  });
}

/* ──────────────────────────────────────────────────────────────────────
   CONTACT & FOUNDER SECTION — Mr. Surya / SS Jewellery Creators
   ─────────────────────────────────────────────────────────────────── */

/* Contact form: builds a WhatsApp message and opens it */
function submitInquiry() {
  const nameEl  = document.getElementById('inquiry-name');
  const emailEl = document.getElementById('inquiry-email');
  const msgEl   = document.getElementById('inquiry-msg');

  if (!nameEl || !emailEl || !msgEl) return;

  const name    = nameEl.value.trim();
  const contact = emailEl.value.trim();
  const message = msgEl.value.trim();

  if (!name || !contact || !message) {
    toast('Please fill in all required fields.', 'error');
    return;
  }

  const btn = document.querySelector('#direct-inquiry-form button[type="submit"]');
  const originalHTML = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = `
    <svg style="animation:spin-anim 0.8s linear infinite" width="16" height="16"
         viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
    </svg> Sending…`;

  setTimeout(() => {
    const waText =
      `Hello Mr. Surya,\n\n` +
      `*Inquiry from SS Jewellery Creators Website*\n\n` +
      `*Name:* ${name}\n` +
      `*Contact:* ${contact}\n\n` +
      `*Message:*\n${message}\n\n` +
      `Looking forward to hearing from you!`;

    const waURL = `https://wa.me/918983405429?text=${encodeURIComponent(waText)}`;

    // Reset form
    nameEl.value  = '';
    emailEl.value = '';
    msgEl.value   = '';

    btn.disabled  = false;
    btn.innerHTML = originalHTML;

    toast('Opening WhatsApp with your message…', 'success');
    setTimeout(() => window.open(waURL, '_blank', 'noopener,noreferrer'), 700);
  }, 1400);
}

window.submitInquiry = submitInquiry;

/* Top-bar hide/reveal on scroll */
function initTopBar() {
  const bar = document.getElementById('top-bar');
  if (!bar) return;
  bar.style.transition = 'transform 0.3s ease';

  let prev = window.scrollY;
  window.addEventListener('scroll', () => {
    const cur = window.scrollY;
    if (cur > 80 && cur > prev) {
      bar.style.transform = 'translateY(-100%)';
    } else {
      bar.style.transform = 'translateY(0)';
    }
    prev = cur;
  }, { passive: true });
}

/* ─── Patched init to include new features ───────────────────────── */
// Run on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => { init(); initTopBar(); });
} else {
  init();
  initTopBar();
}
