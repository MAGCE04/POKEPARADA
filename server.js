// Backend mínimo para integrar Mercado Pago Checkout Pro
// Ejecuta: npm install && npm start
//
// Variables de entorno requeridas (.env):
//   MP_ACCESS_TOKEN=APP_USR-... (token privado de Mercado Pago)
//   PUBLIC_URL=https://tudominio.com (para back_urls de MP)
//   PORT=3000
//
// Documentación oficial:
//   https://www.mercadopago.com.mx/developers/es/docs/checkout-pro/landing

const express = require('express');
const cors = require('cors');
const path = require('path');
const { MercadoPagoConfig, Preference } = require('mercadopago');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const PUBLIC_URL = process.env.PUBLIC_URL || `http://localhost:${PORT}`;

if (!process.env.MP_ACCESS_TOKEN) {
  console.warn('[ADVERTENCIA] MP_ACCESS_TOKEN no está configurado. Crea un archivo .env con tu token de Mercado Pago.');
}

const mp = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN || 'TEST-MISSING-TOKEN',
});

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname)));

app.post('/api/create-preference', async (req, res) => {
  try {
    const { items = [], shipping = {}, payer = {} } = req.body;

    if (!items.length) return res.status(400).json({ error: 'No hay artículos en el carrito' });

    const mpItems = items.map(i => ({
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
        phone: payer.phone ? { number: payer.phone } : undefined,
        address: payer.address ? {
          street_name: payer.address.street_name,
          zip_code: payer.address.zip_code,
        } : undefined,
      },
      shipments: {
        cost: Number(shipping.cost) || 0,
        mode: 'not_specified',
        receiver_address: payer.address ? {
          street_name: payer.address.street_name,
          city_name: payer.address.city,
          state_name: payer.address.state,
          zip_code: payer.address.zip_code,
        } : undefined,
      },
      back_urls: {
        success: `${PUBLIC_URL}/gracias.html`,
        failure: `${PUBLIC_URL}/checkout.html?status=failure`,
        pending: `${PUBLIC_URL}/gracias.html?status=pending`,
      },
      auto_return: 'approved',
      statement_descriptor: 'POKEPARADA',
      payment_methods: {
        installments: 12, // hasta 12 MSI según el banco
      },
      notification_url: `${PUBLIC_URL}/api/mp-webhook`,
    };

    const preference = await new Preference(mp).create({ body: preferenceBody });

    res.json({
      id: preference.id,
      init_point: preference.init_point,
      sandbox_init_point: preference.sandbox_init_point,
    });
  } catch (err) {
    console.error('Error creando preferencia MP:', err);
    res.status(500).json({ error: 'No se pudo crear la preferencia', detail: err.message });
  }
});

// Webhook para recibir notificaciones de pago
app.post('/api/mp-webhook', (req, res) => {
  // Aquí deberías validar la notificación contra la API de MP y actualizar tu base de datos.
  // Mercado Pago envía: ?type=payment&data.id=PAYMENT_ID
  console.log('Webhook MP recibido:', req.query, req.body);
  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`PokéParada corriendo en ${PUBLIC_URL}`);
});
