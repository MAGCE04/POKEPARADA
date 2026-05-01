// Mercado Pago checkout integration
// IMPORTANT: replace MP_PUBLIC_KEY with your real Mercado Pago public key.
// The backend at /api/create-preference must run for live payments.
// See server.js + README.md for setup instructions.

const MP_PUBLIC_KEY = window.POKEPARADA_CONFIG?.MP_PUBLIC_KEY || 'TEST-REPLACE-WITH-YOUR-PUBLIC-KEY';
const API_BASE = window.POKEPARADA_CONFIG?.API_BASE || ''; // e.g. http://localhost:3000

const SHIPPING_OPTIONS = {
  standard: { label: 'Estándar', cost: 149 },
  express:  { label: 'Express',  cost: 249 },
  pickup:   { label: 'Recoger en CDMX', cost: 0 },
};

function getCheckoutCart() {
  try { return JSON.parse(localStorage.getItem('pokeparada_cart_v1')) || []; }
  catch { return []; }
}

function fmt(n) { return `$${n.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`; }

function renderSummary() {
  const cart = getCheckoutCart();
  const itemsEl = document.getElementById('summary-items');
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const shipMethod = document.getElementById('ck-shipping')?.value || 'standard';
  let shipping = SHIPPING_OPTIONS[shipMethod].cost;
  if (subtotal >= 1500 && shipMethod !== 'express') shipping = 0;
  const total = subtotal + shipping;

  if (!cart.length) {
    itemsEl.innerHTML = `<p class="form-help">Tu carrito está vacío. <a href="comprar.html" style="color:var(--color-primary); font-weight:600;">Ver catálogo</a></p>`;
  } else {
    itemsEl.innerHTML = cart.map(i => `
      <div class="cart-row" style="grid-template-columns: 1fr auto;">
        <div>
          <div style="font-weight:600;">${i.title}</div>
          <div class="form-help">${i.set || ''} · Cant: ${i.qty}</div>
        </div>
        <div class="price">${fmt(i.price * i.qty)}</div>
      </div>
    `).join('');
  }

  document.getElementById('sum-subtotal').textContent = fmt(subtotal);
  document.getElementById('sum-shipping').textContent = shipping === 0 ? 'Gratis' : fmt(shipping);
  document.getElementById('sum-total').textContent = `${fmt(total)} MXN`;
}

async function startMercadoPagoCheckout() {
  const form = document.getElementById('checkout-form');
  if (!form.checkValidity()) { form.reportValidity(); return; }

  const cart = getCheckoutCart();
  if (!cart.length) { alert('Tu carrito está vacío.'); return; }

  const shipMethod = document.getElementById('ck-shipping').value;
  const shippingCost = (() => {
    const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
    let cost = SHIPPING_OPTIONS[shipMethod].cost;
    if (subtotal >= 1500 && shipMethod !== 'express') cost = 0;
    return cost;
  })();

  const buyer = Object.fromEntries(new FormData(form).entries());

  const payBtn = document.getElementById('pay-button');
  payBtn.disabled = true;
  payBtn.textContent = 'Conectando con Mercado Pago...';

  try {
    const res = await fetch(`${API_BASE}/api/create-preference`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: cart.map(i => ({
          id: i.id,
          title: i.title,
          quantity: i.qty,
          unit_price: i.price,
          currency_id: 'MXN',
        })),
        shipping: { method: shipMethod, cost: shippingCost },
        payer: {
          name: buyer.name,
          email: buyer.email,
          phone: buyer.phone,
          address: {
            street_name: buyer.address,
            zip_code: buyer.zip,
            city: buyer.city,
            state: buyer.state,
          },
        },
      }),
    });

    if (!res.ok) throw new Error('No se pudo crear la preferencia');
    const data = await res.json();

    // Redirige al checkout de Mercado Pago
    window.location.href = data.init_point || data.sandbox_init_point;
  } catch (err) {
    console.error(err);
    payBtn.disabled = false;
    payBtn.textContent = 'Pagar con Mercado Pago';

    // Fallback / modo demo: si no hay backend configurado, mostramos aviso.
    const container = document.getElementById('mp-button-container');
    container.innerHTML = `
      <div class="alert alert-warn">
        <strong>Modo demostración:</strong> aún no se ha configurado el backend de Mercado Pago.
        Sigue las instrucciones del archivo <code>README.md</code> para activar pagos reales.
      </div>`;
  }
}

function initCheckout() {
  renderSummary();
  document.querySelectorAll('#checkout-form input, #checkout-form select').forEach(el => {
    el.addEventListener('change', renderSummary);
  });
  document.getElementById('pay-button').addEventListener('click', startMercadoPagoCheckout);
}

window.renderSummary = renderSummary;
window.initCheckout = initCheckout;
