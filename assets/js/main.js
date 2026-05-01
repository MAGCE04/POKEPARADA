// Header / Footer / Cart shared logic for PokéParada

const NAV_LINKS = [
  { id: 'inicio', label: 'Inicio', href: 'index.html' },
  { id: 'comprar', label: 'Comprar', href: 'comprar.html' },
  { id: 'vender', label: 'Vender', href: 'vender.html' },
  { id: 'restaurar', label: 'Restaurar', href: 'restaurar.html' },
  { id: 'contacto', label: 'Contacto', href: 'contacto.html' },
];

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
          <p style="color:#8a93a3; max-width: 40ch; margin-top: 12px;">
            Compra, venta y restauración profesional de cartas Pokémon en México. Atención personalizada por coleccionistas.
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

/* ---------- Cart ---------- */
const CART_KEY = 'pokeparada_cart_v1';

function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch { return []; }
}
function setCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  updateCartCount();
  renderCartDrawer();
}
function addToCart(product) {
  const cart = getCart();
  const idx = cart.findIndex(i => i.id === product.id);
  if (idx >= 0) cart[idx].qty += 1;
  else cart.push({ id: product.id, title: product.title, price: product.price, qty: 1, set: product.set });
  setCart(cart);
  openCart();
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
function updateCartCount() {
  const el = document.getElementById('cart-count');
  if (!el) return;
  const count = getCart().reduce((s, i) => s + i.qty, 0);
  el.textContent = count;
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
        <button class="btn btn-primary btn-block" id="checkout-button">Pagar con Mercado Pago</button>
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
          <div style="font-weight:600;">${i.title}</div>
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

window.addToCart = addToCart;
window.changeQty = changeQty;
window.removeFromCart = removeFromCart;
window.openCart = openCart;
window.closeCart = closeCart;
window.renderHeader = renderHeader;
window.renderFooter = renderFooter;
