// Product catalog — replace with your real inventory or a CMS feed.

const PRODUCTS = [
  {
    id: 'charizard-bs-holo',
    title: 'Charizard Holo - Base Set',
    set: 'Base Set · 1999',
    rarity: 'Rara Holo',
    condition: 'NM',
    price: 24999.00,
    badge: 'Vintage',
    color: 'linear-gradient(135deg, #ff7a00, #c11f1f)',
    featured: true,
    category: 'singles',
  },
  {
    id: 'pikachu-illustrator-promo',
    title: 'Pikachu Promo Holo',
    set: 'Promo · McDonalds 25',
    rarity: 'Holo',
    condition: 'NM',
    price: 1299.00,
    color: 'linear-gradient(135deg, #ffcb05, #f59e0b)',
    featured: true,
    category: 'singles',
  },
  {
    id: 'mewtwo-vstar-rainbow',
    title: 'Mewtwo VSTAR Rainbow',
    set: 'Pokémon GO',
    rarity: 'Secreta',
    condition: 'M',
    price: 3499.00,
    badge: 'Top',
    color: 'linear-gradient(135deg, #c084fc, #6d28d9)',
    featured: true,
    category: 'singles',
  },
  {
    id: 'etb-paldea-evolved',
    title: 'Elite Trainer Box - Paldea Evolved',
    set: 'Scarlet & Violet',
    rarity: 'Producto sellado',
    condition: 'Sellado',
    price: 1599.00,
    color: 'linear-gradient(135deg, #34d399, #047857)',
    featured: true,
    category: 'sealed',
  },
  {
    id: 'booster-box-evolving-skies',
    title: 'Booster Box - Evolving Skies',
    set: 'Sword & Shield',
    rarity: 'Producto sellado',
    condition: 'Sellado',
    price: 18999.00,
    badge: 'Inversión',
    color: 'linear-gradient(135deg, #60a5fa, #1e3a8a)',
    featured: false,
    category: 'sealed',
  },
  {
    id: 'umbreon-vmax-alt',
    title: 'Umbreon VMAX Alt Art',
    set: 'Evolving Skies',
    rarity: 'Alt Art',
    condition: 'NM',
    price: 14999.00,
    badge: 'Top',
    color: 'linear-gradient(135deg, #1f2937, #4b5563)',
    featured: true,
    category: 'singles',
  },
  {
    id: 'gengar-vmax-rainbow',
    title: 'Gengar VMAX Rainbow',
    set: 'Fusion Strike',
    rarity: 'Secreta',
    condition: 'NM',
    price: 2299.00,
    color: 'linear-gradient(135deg, #a855f7, #312e81)',
    featured: false,
    category: 'singles',
  },
  {
    id: 'lugia-v-alt',
    title: 'Lugia V Alt Art',
    set: 'Silver Tempest',
    rarity: 'Alt Art',
    condition: 'NM',
    price: 5499.00,
    color: 'linear-gradient(135deg, #e5e7eb, #6b7280)',
    featured: false,
    category: 'singles',
  },
  {
    id: 'psa-blastoise-bs',
    title: 'Blastoise Holo PSA 8',
    set: 'Base Set · 1999',
    rarity: 'Graded',
    condition: 'PSA 8',
    price: 18499.00,
    badge: 'Graded',
    color: 'linear-gradient(135deg, #38bdf8, #1e40af)',
    featured: false,
    category: 'graded',
  },
  {
    id: 'scarlet-violet-151',
    title: 'Booster Bundle 151',
    set: 'Scarlet & Violet 151',
    rarity: 'Producto sellado',
    condition: 'Sellado',
    price: 899.00,
    color: 'linear-gradient(135deg, #fb7185, #be123c)',
    featured: false,
    category: 'sealed',
  },
  {
    id: 'rayquaza-vmax-alt',
    title: 'Rayquaza VMAX Alt Art',
    set: 'Evolving Skies',
    rarity: 'Alt Art',
    condition: 'NM',
    price: 7999.00,
    color: 'linear-gradient(135deg, #4ade80, #065f46)',
    featured: false,
    category: 'singles',
  },
  {
    id: 'giratina-vstar',
    title: 'Giratina VSTAR Gold',
    set: 'Lost Origin',
    rarity: 'Oro',
    condition: 'NM',
    price: 3299.00,
    color: 'linear-gradient(135deg, #fde68a, #b45309)',
    featured: false,
    category: 'singles',
  },
];

function formatPrice(n) {
  return `$${n.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`;
}

function productCard(p) {
  return `
    <article class="product-card">
      <div class="product-image" style="background: ${p.color}">
        ${p.badge ? `<span class="badge">${p.badge}</span>` : ''}
        <span>${p.title}</span>
      </div>
      <div class="product-body">
        <h3 class="product-title">${p.title}</h3>
        <div class="product-meta">${p.set} · ${p.condition}</div>
        <div class="product-price">${formatPrice(p.price)}</div>
      </div>
      <div class="product-actions">
        <button class="btn btn-outline" onclick='addToCart(${JSON.stringify({id: p.id, title: p.title, price: p.price, set: p.set})})'>Añadir</button>
        <button class="btn btn-primary" onclick='buyNow(${JSON.stringify({id: p.id, title: p.title, price: p.price, set: p.set})})'>Comprar</button>
      </div>
    </article>
  `;
}

function renderFeatured() {
  const grid = document.getElementById('featured-grid');
  if (!grid) return;
  grid.innerHTML = PRODUCTS.filter(p => p.featured).slice(0, 4).map(productCard).join('');
}

function renderCatalog() {
  const grid = document.getElementById('catalog-grid');
  if (!grid) return;
  const search = (document.getElementById('search')?.value || '').toLowerCase().trim();
  const cat = document.getElementById('cat-filter')?.value || 'all';
  const sort = document.getElementById('sort-filter')?.value || 'featured';

  let list = PRODUCTS.filter(p => {
    const matchText = !search || (p.title + ' ' + p.set).toLowerCase().includes(search);
    const matchCat = cat === 'all' || p.category === cat;
    return matchText && matchCat;
  });

  if (sort === 'price-asc') list.sort((a,b) => a.price - b.price);
  else if (sort === 'price-desc') list.sort((a,b) => b.price - a.price);
  else if (sort === 'name') list.sort((a,b) => a.title.localeCompare(b.title));

  if (!list.length) {
    grid.innerHTML = `<p class="form-help" style="grid-column: 1 / -1; text-align:center;">No encontramos cartas con esos filtros.</p>`;
    return;
  }
  grid.innerHTML = list.map(productCard).join('');
}

function buyNow(product) {
  addToCart(product);
  window.location.href = 'checkout.html';
}

window.PRODUCTS = PRODUCTS;
window.formatPrice = formatPrice;
window.renderFeatured = renderFeatured;
window.renderCatalog = renderCatalog;
window.buyNow = buyNow;
