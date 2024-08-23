import express from 'express'
import axios from 'axios'
import path from 'path'
import {dirname} from 'path'
import {config} from 'dotenv'
import { fileURLToPath } from 'url';

config()
const app = express();
const port = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  const appSecret = process.env.APPSECRET;

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
