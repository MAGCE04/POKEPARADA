// Vercel Serverless Function: POST /api/mp-webhook
// Recibe notificaciones de Mercado Pago cuando cambia el estado de un pago.
// Documentación: https://www.mercadopago.com.mx/developers/es/docs/checkout-pro/additional-content/notifications/webhooks

module.exports = async (req, res) => {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Mercado Pago suele enviar: ?type=payment&data.id=PAYMENT_ID
  console.log('MP Webhook recibido:', {
    query: req.query,
    body: req.body,
  });

  // TODO: validar la notificación contra la API de MP usando MP_ACCESS_TOKEN
  // y actualizar el estado del pedido en tu base de datos.

  return res.status(200).json({ received: true });
};
