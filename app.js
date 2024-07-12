const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const port = 3000;

// Middleware para servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', async (req, res) => {
  const { merchant_id, client_id, code } = req.query;

  if (!merchant_id || !client_id || !code) {
    return res.status(400).send('Missing required query parameters');
  }

  console.log('Merchant ID:', merchant_id);
  console.log('Client ID:', client_id);
  console.log('Code:', code);

  const appId = client_id;
  const appSecret = 'efe982e2-79d0-182c-4029-ae6317c8e7a7';

  try {
    const accessToken = await getAccessToken(appId, appSecret, code);
    console.log('Access Token:', accessToken);

    // Almacenar el token en sessionStorage si es necesario
    const script = `<script>sessionStorage.setItem('accessToken', '${accessToken}'); window.location.href = '/token.html';</script>`;
    res.send(script);

  } catch (error) {
    console.error('Error fetching access token:', error);
    res.status(500).send('Error fetching access token');
  }
});

async function getAccessToken(appId, appSecret, code) {
  try {
    const response = await axios.get('https://sandbox.dev.clover.com/oauth/token', {
      params: {
        client_id: appId,
        client_secret: appSecret,
        code: code
      }
    });

    return response.data.access_token;
  } catch (error) {
    throw new Error('Failed to fetch access token');
  }
}

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
