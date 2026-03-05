import express from 'express'
import axios from 'axios'
import crypto from 'crypto'

const app = express();
const port = 3000;

const APP_ID = 'APP_ID_GENERADO_EN_CLOVER';
const APP_SECRET = 'SECRET_KEY_GENERADO_EN_CLOVER';

const REDIRECT_URI = 'http://localhost:3000/oauth/callback';

app.use(express.json());

/* =====================================================
   Middleware de trazabilidad
   Genera un identificador único por request para poder
   correlacionar logs cuando existen múltiples flujos
   concurrentes.
===================================================== */
app.use((req, res, next) => {
  req.traceId = crypto.randomUUID();
  req.startTime = Date.now();

  console.log(`[${req.traceId}] Incoming ${req.method} ${req.originalUrl}`);
  next();
});

/* =====================================================
   1. Alternate Launch Endpoint

   - Recibe merchant_id y client_id desde Clover.
   - Valida consistencia del client_id.
   - Construye dinámicamente la URL OAuth V2 específica
     del merchant.
   - Responde con HTTP 302 hacia Clover.
===================================================== */
app.get('/alternate-launch', (req, res) => {
  const { merchant_id, client_id } = req.query;
  const traceId = req.traceId;

  console.log(`[${traceId}] Processing alternate-launch request`);

  if (!merchant_id || !client_id) {
    console.log(`[${traceId}] Validation failed: missing parameters`);
    return res.status(400).json({
      error: 'Missing merchant_id or client_id'
    });
  }

  console.log(`[${traceId}] Merchant ID: ${merchant_id}`);
  console.log(`[${traceId}] Client ID received: ${client_id}`);

  if (client_id !== APP_ID) {
    console.log(`[${traceId}] Client ID mismatch`);
    return res.status(403).json({
      error: 'client_id does not match configured APP_ID'
    });
  }

  const encodedRedirectUri = encodeURIComponent(REDIRECT_URI);

  const cloverUrl =
    `https://sandbox.dev.clover.com/oauth/v2/merchants/${merchant_id}` +
    `?client_id=${APP_ID}` +
    `&redirect_uri=${encodedRedirectUri}` +
    `&response_type=code` +
    `&state=${merchant_id}`;

  console.log(`[${traceId}] Redirecting to Clover OAuth V2 endpoint`);
  console.log(`[${traceId}] Redirect URL: ${cloverUrl}`);

  return res.redirect(cloverUrl);
});

/* =====================================================
   2. OAuth Callback Endpoint

   - Recibe el authorization code desde Clover.
   - Intercambia el code por access_token en OAuth V2.
   - Devuelve exactamente el JSON recibido desde Clover.
===================================================== */
app.get('/oauth/callback', async (req, res) => {
  const { code, state } = req.query;
  const traceId = req.traceId;

  console.log(`[${traceId}] OAuth callback invoked`);
  console.log(`[${traceId}] Merchant (state): ${state}`);

  if (!code) {
    console.log(`[${traceId}] Missing authorization code`);
    return res.status(400).json({ error: 'Missing authorization code' });
  }

  try {
    console.log(`[${traceId}] Initiating token exchange with Clover`);

    const tokenData = await getAccessTokenV2(
      APP_ID,
      APP_SECRET,
      code,
      traceId
    );

    console.log(`[${traceId}] Token exchange successful`);
console.log(
  `[${traceId}] Access token expiration (unix): ${tokenData.access_token_expiration}`
);
    const duration = Date.now() - req.startTime;
    console.log(`[${traceId}] Request completed in ${duration} ms`);

    return res.json(tokenData);

  } catch (error) {
    console.log(`[${traceId}] Token exchange failed`);
    handleAxiosError(error, res, traceId);
  }
});

/* =====================================================
   3. OAuth V2 Token Exchange

   - Realiza POST a /oauth/v2/token.
   - Envía credenciales del backend y authorization code.
   - Devuelve el payload original de Clover.
===================================================== */
async function getAccessTokenV2(appId, appSecret, code, traceId) {
  const url = 'https://sandbox.dev.clover.com/oauth/v2/token';

  const payload = {
    client_id: appId,
    client_secret: appSecret,
    code: code,
    grant_type: 'authorization_code'
  };

  console.log(`[${traceId}] POST ${url}`);
  console.log(`[${traceId}] Exchanging authorization code for access token`);

  const response = await axios.post(url, payload, {
    headers: { 'Content-Type': 'application/json' },
    timeout: 10000
  });

  console.log(`[${traceId}] Clover responded with status ${response.status}`);

  return response.data;
}

/* =====================================================
   4. Centralized Error Handling

   - Diferencia errores upstream (Clover) de errores internos.
   - Log estructurado con traceId.
===================================================== */
function handleAxiosError(error, res, traceId) {
  if (error.response) {
    console.log(
      `[${traceId}] Upstream error from Clover: ${error.response.status}`
    );
    console.log(
      `[${traceId}] Response data:`,
      JSON.stringify(error.response.data)
    );

    return res
      .status(error.response.status || 500)
      .json(error.response.data);
  }

  console.log(`[${traceId}] Internal error: ${error.message}`);

  return res.status(500).json({
    error: error.message
  });
}

/* =====================================================
   5. Server Initialization
===================================================== */
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
