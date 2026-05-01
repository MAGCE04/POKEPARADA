// Vercel Serverless Function: POST /api/create-preference
// Crea una preferencia de pago en Mercado Pago y devuelve la URL de checkout.
//
// Variables de entorno requeridas en Vercel (Project Settings → Environment Variables):
//   MP_ACCESS_TOKEN  -> Token privado de Mercado Pago
//   PUBLIC_URL       -> URL pública del sitio (ej. https://pokeparada-green.vercel.app)

const { MercadoPagoConfig, Preference } = require('mercadopago');

module.exports = async (req, res) => {
  // CORS básico (mismo dominio en producción, abierto para desarrollo)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!process.env.MP_ACCESS_TOKEN) {
    return res.status(500).json({
      error: 'Falta configurar MP_ACCESS_TOKEN en las variables de entorno de Vercel.',
    });
  }

  try {
    const { items = [], shipping = {}, payer = {} } = req.body || {};
    if (!items.length) return res.status(400).json({ error: 'No hay artículos en el carrito' });

    const mp = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });

    const PUBLIC_URL =
      process.env.PUBLIC_URL ||
      (req.headers['x-forwarded-host']
        ? `https://${req.headers['x-forwarded-host']}`
        : `https://${req.headers.host}`);

    const mpItems = items.map((i) => ({
      id: String(i.id),
      title: String(i.title).slice(0, 250),
      quantity: Number(i.quantity),
      unit_price: Number(i.unit_price),
      currency_id: 'MXN',
    }));

    const preferenceBody = {
      items: mpItems,
      payer: {
        name: payer.name,
        email: payer.email,
        phone: payer.phone ? { number: String(payer.phone) } : undefined,
        address: payer.address
          ? {
              street_name: payer.address.street_name,
              zip_code: payer.address.zip_code,
            }
          : undefined,
      },
      shipments: {
        cost: Number(shipping.cost) || 0,
        mode: 'not_specified',
        receiver_address: payer.address
          ? {
              street_name: payer.address.street_name,
              city_name: payer.address.city,
              state_name: payer.address.state,
              zip_code: payer.address.zip_code,
            }
          : undefined,
      },
      back_urls: {
        success: `${PUBLIC_URL}/gracias.html`,
        failure: `${PUBLIC_URL}/checkout.html?status=failure`,
        pending: `${PUBLIC_URL}/gracias.html?status=pending`,
      },
      auto_return: 'approved',
      statement_descriptor: 'POKEPARADA',
      payment_methods: { installments: 12 },
      notification_url: `${PUBLIC_URL}/api/mp-webhook`,
    };

    const preference = await new Preference(mp).create({ body: preferenceBody });

    return res.status(200).json({
      id: preference.id,
      init_point: preference.init_point,
      sandbox_init_point: preference.sandbox_init_point,
    });
  } catch (err) {
    console.error('Error creando preferencia MP:', err);
    return res.status(500).json({
      error: 'No se pudo crear la preferencia',
      detail: err?.message,
    });
  }
};
