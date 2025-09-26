import express from 'express'
import axios from 'axios'

const app = express();
const port = 3000;

// 🔑 Configuración fija del backend
const APP_ID = 'TU_APP_ID';
const APP_SECRET = 'TU_APP_SECRET';

app.use(express.json());

app.get('/', async (req, res) => {
  const { merchant_id, client_id, code } = req.query;

  if (!merchant_id || !client_id || !code) {
    return res.status(400).json({ error: 'Missing required query parameters: merchant_id, client_id, code' });
  }

  if (client_id !== APP_ID) {
    return res.status(403).json({ error: 'Backend configurado para otra app' });
  }

  console.log('Merchant ID:', merchant_id);
  console.log('Client ID recibido:', client_id);
  console.log('Code:', code);

  try {
    const tokenData = await getAccessToken(APP_ID, APP_SECRET, code);
    console.log('Token response:', tokenData);

    res.json(tokenData);
  } catch (error) {
    console.error('Error fetching access token:', error);

    if (error.response) {
      return res.status(error.response.status || 500).json({
        message: 'Error fetching access token (upstream)',
        status: error.response.status,
        data: error.response.data
      });
    }
    res.status(500).json({ message: 'Error fetching access token', error: error.message });
  }
});

async function getAccessToken(appId, appSecret, code) {
  const baseUrl = 'https://sandbox.dev.clover.com/oauth/token';
  const v2Url = 'https://sandbox.dev.clover.com/oauth/v2/token';

  if (!code.includes('-')) {
    // POST JSON al endpoint /v2/token
    const payload = {
      client_id: appId,
      client_secret: appSecret,
      code: code
    };

    const response = await axios.post(v2Url, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    });

    return response.data;
  } else {
    // GET JSON al endpoint /oauth/token
    const response = await axios.get(baseUrl, {
      params: { client_id: appId, client_secret: appSecret, code },
      timeout: 10000
    });

    return response.data;
  }
}

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
