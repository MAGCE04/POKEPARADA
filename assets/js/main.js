/* =========================================================
   PokéParada — Effects, Header, Footer, Cart
   ========================================================= */

const NAV_LINKS = [
  { id: 'inicio', label: 'Inicio', href: 'index.html' },
  { id: 'comprar', label: 'Comprar', href: 'comprar.html' },
  { id: 'vender', label: 'Vender', href: 'vender.html' },
  { id: 'restaurar', label: 'Restaurar', href: 'restaurar.html' },
  { id: 'contacto', label: 'Contacto', href: 'contacto.html' },
];

const isCoarse = matchMedia('(pointer: coarse)').matches || matchMedia('(max-width: 860px)').matches;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Boot: inject loader, cursor, bg fx ---------- */
function injectGlobalElements() {
  if (!document.querySelector('.bg-fx')) {
    const bg = document.createElement('div');
    bg.className = 'bg-fx';
    document.body.prepend(bg);
  }
  if (!isCoarse && !document.querySelector('.cursor-dot')) {
    const dot = document.createElement('div');
    dot.className = 'cursor-dot';
    const ring = document.createElement('div');
    ring.className = 'cursor-ring';
    document.body.append(dot, ring);
  }
  if (!document.querySelector('.preloader')) {
    const pl = document.createElement('div');
    pl.className = 'preloader';
    pl.innerHTML = `<div class="pokeball" aria-hidden="true"></div>`;
    document.body.prepend(pl);
  }
}

function dismissLoader() {
  const pl = document.querySelector('.preloader');
  if (!pl) return;
  setTimeout(() => pl.classList.add('hidden'), 350);
  setTimeout(() => pl.remove(), 1200);
}

/* ---------- Custom cursor ---------- */
function initCursor() {
  if (isCoarse) return;
  const dot = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  if (!dot || !ring) return;

  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let rx = mx, ry = my;

  window.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
  });

  function loop() {
    rx += (mx - rx) * 0.18;
    ry += (my - ry) * 0.18;
    ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  const hoverSel = 'a, button, summary, .service-card, .product-card, input, select, textarea, label';
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(hoverSel)) document.body.classList.add('cursor-hover');
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(hoverSel) && !e.relatedTarget?.closest(hoverSel)) {
      document.body.classList.remove('cursor-hover');
    }
  });
  document.addEventListener('mousedown', () => document.body.classList.add('cursor-down'));
  document.addEventListener('mouseup', () => document.body.classList.remove('cursor-down'));
}

/* ---------- 3D tilt for service cards ---------- */
function init3DTilt() {
  if (reduceMotion || isCoarse) return;
  document.querySelectorAll('.service-card').forEach(card => {
    let raf;
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const rx = ((y / rect.height) - 0.5) * -10;
      const ry = ((x / rect.width) - 0.5) * 10;
      card.style.setProperty('--mx', `${x}px`);
      card.style.setProperty('--my', `${y}px`);
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        card.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
      });
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

/* ---------- Holographic hero card ---------- */
function initHolo() {
  const stage = document.querySelector('.holo-stage');
  if (!stage || reduceMotion) return;
  const card = stage.querySelector('.holo-card');
  if (!card) return;

  let raf;
  stage.addEventListener('mousemove', (e) => {
    const rect = stage.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const px = (x / rect.width) * 100;
    const py = (y / rect.height) * 100;
    const rx = ((y / rect.height) - 0.5) * 24;
    const ry = ((x / rect.width) - 0.5) * 24;

    card.style.setProperty('--mx', `${px}%`);
    card.style.setProperty('--my', `${py}%`);
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      card.style.setProperty('--rx', `${ry}deg`);
      card.style.setProperty('--ry', `${-rx}deg`);
    });
  });
  stage.addEventListener('mouseleave', () => {
    card.style.setProperty('--rx', `0deg`);
    card.style.setProperty('--ry', `0deg`);
    card.style.setProperty('--mx', `50%`);
    card.style.setProperty('--my', `50%`);
  });
}

/* ---------- Magnetic buttons ---------- */
function initMagnetic() {
  if (reduceMotion || isCoarse) return;
  document.querySelectorAll('.btn-magnet').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.25}px, ${y * 0.4}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
}

/* ---------- Hero stagger text ---------- */
function initStaggerHero() {
  const h1 = document.querySelector('.hero h1');
  if (!h1 || h1.dataset.staggered) return;
  if (reduceMotion) return;
  h1.dataset.staggered = '1';
  h1.classList.add('h1-stagger');

  const wrapWords = (node) => {
    const result = [];
    node.childNodes.forEach((n) => {
      if (n.nodeType === Node.TEXT_NODE) {
        const words = n.textContent.split(/(\s+)/);
        words.forEach(w => {
          if (/^\s+$/.test(w)) {
            result.push(document.createTextNode(w));
          } else if (w.length) {
            const span = document.createElement('span');
            span.className = 'word';
            span.textContent = w;
            result.push(span);
          }
        });
      } else if (n.nodeType === Node.ELEMENT_NODE) {
        const wrapper = document.createElement('span');
        wrapper.className = 'word';
        wrapper.append(...n.cloneNode(true).childNodes);
        // Preserve original element's classes (like .accent) by re-using a new element
        const fresh = n.cloneNode(true);
        fresh.classList?.add?.('word');
        // Use `display:inline-block` via .word class on the original element
        result.push(fresh);
        fresh.classList.add('word');
      }
    });
    return result;
  };

  const replacements = wrapWords(h1);
  h1.innerHTML = '';
  replacements.forEach((el, i) => {
    if (el.classList?.contains('word')) {
      el.style.animationDelay = `${i * 60}ms`;
    }
    h1.appendChild(el);
  });
}

/* ---------- Reveal on scroll ---------- */
let revealObserver;
function initReveal() {
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('is-visible'));
    return;
  }
  if (!revealObserver) {
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          entry.target.style.transitionDelay = `${(entry.target.dataset.delay || i * 50)}ms`;
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  }
  document.querySelectorAll(
    'section:not(.hero):not(.marquee) > .container, .service-card, .product-card, .steps li, .trust-item, .faq details, .form-shell'
  ).forEach((el, i) => {
    if (el.matches('.hero .container, .page-head .container')) return;
    if (el.classList.contains('is-visible') || el.dataset.revealed) return;
    el.dataset.revealed = '1';
    el.classList.add('reveal');
    el.dataset.delay = (i % 4) * 80;
    revealObserver.observe(el);
  });
}

/* ---------- Confetti pokébolas (canvas) ---------- */
function shootPokeballs(originX, originY, count = 22) {
  if (reduceMotion) return;
  let canvas = document.getElementById('confetti-canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'confetti-canvas';
    Object.assign(canvas.style, {
      position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9998,
    });
    document.body.appendChild(canvas);
  }
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  canvas.width = innerWidth * dpr;
  canvas.height = innerHeight * dpr;
  canvas.style.width = innerWidth + 'px';
  canvas.style.height = innerHeight + 'px';
  ctx.scale(dpr, dpr);

  const balls = [];
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
    const speed = 6 + Math.random() * 6;
    balls.push({
      x: originX, y: originY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 3,
      r: 8 + Math.random() * 6,
      rot: Math.random() * Math.PI * 2,
      vrot: (Math.random() - 0.5) * 0.4,
      life: 0,
      ttl: 60 + Math.random() * 30,
    });
  }

  function drawPokeball(b) {
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.rotate(b.rot);
    // top red
    ctx.beginPath();
    ctx.arc(0, 0, b.r, Math.PI, Math.PI * 2);
    ctx.fillStyle = '#ff4d4d';
    ctx.fill();
    // bottom white
    ctx.beginPath();
    ctx.arc(0, 0, b.r, 0, Math.PI);
    ctx.fillStyle = '#f7f8fb';
    ctx.fill();
    // band
    ctx.fillStyle = '#0a0b10';
    ctx.fillRect(-b.r, -1.5, b.r * 2, 3);
    // center
    ctx.beginPath();
    ctx.arc(0, 0, b.r * 0.32, 0, Math.PI * 2);
    ctx.fillStyle = '#0a0b10';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, 0, b.r * 0.18, 0, Math.PI * 2);
    ctx.fillStyle = '#f7f8fb';
    ctx.fill();
    ctx.restore();
  }

  function frame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = 0;
    balls.forEach(b => {
      b.vy += 0.32; // gravity
      b.vx *= 0.99;
      b.x += b.vx;
      b.y += b.vy;
      b.rot += b.vrot;
      b.life++;
      if (b.life < b.ttl && b.y < innerHeight + 40) {
        ctx.globalAlpha = Math.max(0, 1 - b.life / b.ttl);
        drawPokeball(b);
        alive++;
      }
    });
    ctx.globalAlpha = 1;
    if (alive > 0) requestAnimationFrame(frame);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  requestAnimationFrame(frame);
}

/* =========================================================
   HEADER / FOOTER
   ========================================================= */
function renderHeader(activeId) {
  const header = document.getElementById('site-header');
  if (!header) return;
  header.innerHTML = `
    <div class="container nav">
      <a class="brand" href="index.html" aria-label="PokéParada inicio">
        <span class="brand-logo" aria-hidden="true"></span>
        <span>Poké<span style="color: var(--color-primary)">Parada</span></span>
      </a>
      <nav class="nav-links" id="nav-links">
        ${NAV_LINKS.map(l => `<a href="${l.href}" class="${l.id === activeId ? 'active' : ''}">${l.label}</a>`).join('')}
      </nav>
      <div class="nav-cta">
        <button class="cart-button" id="cart-button" aria-label="Ver carrito">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/></svg>
          Carrito <span class="cart-count" id="cart-count">0</span>
        </button>
        <button class="nav-toggle" id="nav-toggle" aria-label="Abrir menú"><span></span></button>
      </div>
    </div>
  `;

  document.getElementById('nav-toggle').addEventListener('click', () => {
    document.getElementById('nav-links').classList.toggle('open');
  });
  document.getElementById('cart-button').addEventListener('click', openCart);
  updateCartCount();
}

function renderFooter() {
  const footer = document.getElementById('site-footer');
  if (!footer) return;
  const year = new Date().getFullYear();
  footer.innerHTML = `
    <div class="container">
      <div class="footer-grid">
        <div>
          <div class="brand">
            <span class="brand-logo" aria-hidden="true"></span>
            <span>PokéParada</span>
          </div>
          <p style="color:#7a8295; max-width: 40ch; margin-top: 14px;">
            Compra, venta y restauración profesional de cartas Pokémon en México. Atención personalizada por coleccionistas reales.
          </p>
        </div>
        <div>
          <h5>Servicios</h5>
          <ul>
            <li><a href="comprar.html">Comprar cartas</a></li>
            <li><a href="vender.html">Vender mis cartas</a></li>
            <li><a href="restaurar.html">Restauración</a></li>
          </ul>
        </div>
        <div>
          <h5>Empresa</h5>
          <ul>
            <li><a href="contacto.html">Contacto</a></li>
            <li><a href="index.html#servicios">Cómo funciona</a></li>
            <li><a href="index.html#destacados">Destacados</a></li>
          </ul>
        </div>
        <div>
          <h5>Contacto</h5>
          <ul>
            <li>WhatsApp: +52 55 0000 0000</li>
            <li>hola@pokeparada.mx</li>
            <li>CDMX, México</li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© ${year} PokéParada. Todos los derechos reservados.</span>
        <span>Pagos seguros con Mercado Pago · SPEI · OXXO · Tarjetas · MSI</span>
      </div>
    </div>
    ${cartDrawerHTML()}
  `;

  document.getElementById('drawer-close').addEventListener('click', closeCart);
  document.getElementById('drawer-overlay').addEventListener('click', closeCart);
  document.getElementById('checkout-button').addEventListener('click', goToCheckout);
  renderCartDrawer();
}

/* =========================================================
   CART
   ========================================================= */
const CART_KEY = 'pokeparada_cart_v1';

function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch { return []; }
}
function setCart(items, opts = {}) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  updateCartCount(opts.bump);
  renderCartDrawer();
}
function addToCart(product, evt) {
  const cart = getCart();
  const idx = cart.findIndex(i => i.id === product.id);
  if (idx >= 0) cart[idx].qty += 1;
  else cart.push({ id: product.id, title: product.title, price: product.price, qty: 1, set: product.set });
  setCart(cart, { bump: true });

  // Confetti at click point or center
  const e = evt || window.event;
  const x = e?.clientX || innerWidth / 2;
  const y = e?.clientY || innerHeight / 2;
  shootPokeballs(x, y, 18);
}
function changeQty(id, delta) {
  const cart = getCart().map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i);
  setCart(cart);
}
function removeFromCart(id) {
  setCart(getCart().filter(i => i.id !== id));
}
function cartTotal() {
  return getCart().reduce((s, i) => s + i.price * i.qty, 0);
}
function updateCartCount(bump = false) {
  const el = document.getElementById('cart-count');
  if (!el) return;
  const count = getCart().reduce((s, i) => s + i.qty, 0);
  el.textContent = count;
  if (bump) {
    el.classList.remove('bump');
    void el.offsetWidth;
    el.classList.add('bump');
  }
}

function cartDrawerHTML() {
  return `
    <div class="drawer-overlay" id="drawer-overlay"></div>
    <aside class="drawer" id="drawer" aria-label="Carrito de compras">
      <div class="drawer-head">
        <h3>Tu carrito</h3>
        <button class="drawer-close" id="drawer-close" aria-label="Cerrar">×</button>
      </div>
      <div class="drawer-body" id="drawer-body"></div>
      <div class="drawer-foot">
        <div class="cart-totals">
          <span>Total</span>
          <span id="cart-total-amount">$0.00 MXN</span>
        </div>
        <button class="btn btn-primary btn-block btn-magnet" id="checkout-button">Pagar con Mercado Pago</button>
        <p class="form-help" style="text-align:center; margin-top: 10px;">Tarjetas, SPEI, OXXO y MSI disponibles</p>
      </div>
    </aside>
  `;
}

function renderCartDrawer() {
  const body = document.getElementById('drawer-body');
  const total = document.getElementById('cart-total-amount');
  if (!body || !total) return;
  const cart = getCart();
  if (!cart.length) {
    body.innerHTML = `<div class="cart-empty">Tu carrito está vacío.<br/><a href="comprar.html" style="color:var(--color-primary); font-weight:600;">Ver catálogo</a></div>`;
  } else {
    body.innerHTML = cart.map(i => `
      <div class="cart-row">
        <div class="thumb"></div>
        <div>
          <div style="font-weight:600; color: var(--color-text-strong);">${i.title}</div>
          <div class="form-help">${i.set || ''}</div>
          <div class="qty" style="margin-top:8px;">
            <button onclick="changeQty('${i.id}', -1)" aria-label="Disminuir">−</button>
            <span>${i.qty}</span>
            <button onclick="changeQty('${i.id}', 1)" aria-label="Aumentar">+</button>
            <button class="remove" onclick="removeFromCart('${i.id}')">Quitar</button>
          </div>
        </div>
        <div class="price">$${(i.price * i.qty).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</div>
      </div>
    `).join('');
  }
  total.textContent = `$${cartTotal().toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`;
}

function openCart() {
  document.getElementById('drawer')?.classList.add('open');
  document.getElementById('drawer-overlay')?.classList.add('open');
  renderCartDrawer();
}
function closeCart() {
  document.getElementById('drawer')?.classList.remove('open');
  document.getElementById('drawer-overlay')?.classList.remove('open');
}

function goToCheckout() {
  const cart = getCart();
  if (!cart.length) {
    alert('Tu carrito está vacío.');
    return;
  }
  window.location.href = 'checkout.html';
}

/* =========================================================
   BOOT
   ========================================================= */
injectGlobalElements();

document.addEventListener('DOMContentLoaded', () => {
  initCursor();
  initReveal();
  init3DTilt();
  initHolo();
  initMagnetic();
  initStaggerHero();
});

window.addEventListener('load', () => {
  dismissLoader();
});
// Safety: never let the loader stay too long
setTimeout(() => dismissLoader(), 2500);

/* Expose for inline handlers and product.js */
window.addToCart = addToCart;
window.changeQty = changeQty;
window.removeFromCart = removeFromCart;
window.openCart = openCart;
window.closeCart = closeCart;
window.renderHeader = renderHeader;
window.renderFooter = renderFooter;
window.initReveal = initReveal;
window.init3DTilt = init3DTilt;
window.initMagnetic = initMagnetic;
window.shootPokeballs = shootPokeballs;
