# PokéParada

Sitio web del negocio **PokéParada**: compra, venta y restauración de cartas Pokémon en México, con pagos integrados por **Mercado Pago**.

## Estructura

```
POKEPARADA/
├── index.html            # Landing con las 3 vertientes de negocio
├── comprar.html          # Catálogo (filtros + carrito)
├── vender.html           # Formulario para que el cliente venda sus cartas
├── restaurar.html        # Formulario de cotización de restauración
├── checkout.html         # Pago con Mercado Pago
├── gracias.html          # Confirmación post-pago
├── contacto.html
├── server.js             # Backend Node/Express para crear preferencias MP
├── package.json
├── .env.example
└── assets/
    ├── css/styles.css
    └── js/
        ├── main.js       # Header, footer, carrito (localStorage)
        ├── products.js   # Catálogo + render
        ├── checkout.js   # Integración con Mercado Pago
        └── config.js     # Llave pública MP y endpoints
```

## 1) Probar el sitio en local (sin pagos)

Solo abre `index.html` en tu navegador. Todo el frontend funciona, excepto el pago real (que verá el modo demostración).

Para servirlo con un servidor local:
```bash
npx serve .
```

## 2) Activar pagos con Mercado Pago

### a) Crea tu cuenta de desarrollador
1. Entra a <https://www.mercadopago.com.mx/developers/panel/app> y crea una aplicación.
2. Copia el **Access Token** (privado) y la **Public Key**.

### b) Configura las credenciales

```bash
cp .env.example .env
# Edita .env y pega tu MP_ACCESS_TOKEN y MP_PUBLIC_KEY
```

Edita también `assets/js/config.js`:
```js
window.POKEPARADA_CONFIG = {
  MP_PUBLIC_KEY: 'APP_USR-tu-llave-publica',
  API_BASE: 'http://localhost:3000', // o tu dominio en producción
  // ...
};
```

E incluye el script en cada página antes de `main.js`:
```html
<script src="assets/js/config.js"></script>
```

### c) Instala dependencias y arranca el backend

```bash
npm install
npm start
```

El servidor expone:
- `POST /api/create-preference` → crea la preferencia de pago.
- `POST /api/mp-webhook` → recibe notificaciones de pago.
- Sirve los archivos estáticos en la raíz.

Abre <http://localhost:3000> y prueba el flujo completo:
**Catálogo → Carrito → Checkout → Mercado Pago → /gracias.html**

### d) Pasar a producción

1. Sube el proyecto a un VPS, Render, Railway, Fly.io, Vercel (con functions) o similar.
2. En el panel de MP, crea credenciales **de producción** y reemplaza las TEST.
3. Configura `PUBLIC_URL` en `.env` con tu dominio real.
4. Configura HTTPS (obligatorio para Mercado Pago en producción).
5. (Opcional) Implementa el webhook para marcar pedidos como pagados en tu BD.

## 3) Métodos de pago disponibles (México)

A través de Mercado Pago Checkout Pro, los clientes podrán pagar con:
- Tarjetas de crédito y débito (Visa, Mastercard, AMEX)
- **Meses sin intereses** (hasta 12 MSI según banco)
- **SPEI** (transferencia bancaria)
- **Pago en OXXO** y otros corresponsales
- Mercado Crédito y saldo en cuenta MP

## 4) Personalización rápida

| Quiero cambiar... | Archivo |
|---|---|
| Productos del catálogo | `assets/js/products.js` |
| Colores, fuentes, espaciados | `assets/css/styles.css` (variables `:root`) |
| Datos de contacto y logo | `assets/js/main.js` (`renderHeader` / `renderFooter`) |
| WhatsApp / correo | `assets/js/config.js` y enlaces `wa.me` en cada página |
| Costos de envío | `assets/js/checkout.js` (`SHIPPING_OPTIONS`) y `checkout.html` |
| Precios de restauración | `restaurar.html` |

## 5) Conexión con un CRM / hojas de cálculo (opcional)

Los formularios de **Vender** y **Restaurar** actualmente solo guardan en `console.log`. Conéctalos a:
- [Formspree](https://formspree.io/) (zero-code)
- [Make / Zapier / n8n](https://n8n.io/) → Google Sheets, Notion, Airtable
- Tu propio endpoint en `server.js`

Ejemplo con Formspree: cambia el `<form>` por:
```html
<form action="https://formspree.io/f/TU_ID" method="POST">
```

## Licencia

Proyecto privado de PokéParada. Todos los derechos reservados.
