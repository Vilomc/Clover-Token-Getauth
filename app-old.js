const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const port = 3000;

// Middleware para servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Configuración del proxy inverso para redirigir las solicitudes a la API de Clover
app.use('/v1', createProxyMiddleware({
    target: 'https://sandbox.dev.clover.com',
    changeOrigin: true,
    pathRewrite: {
        '^/v1': '', // elimina el prefijo /v1 de la solicitud
    },
}));

// Ruta para manejar la obtención de token y redireccionamiento
app.get('/connect', async (req, res) => {
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

        // Aquí deberías implementar la lógica para obtener el merchantId correctamente
        const merchantId = merchant_id; // Esto debe ser obtenido correctamente

        // Preparar la respuesta para el cliente
        const responseHtml = `
            <script>
                sessionStorage.setItem('accessToken', '${accessToken}');
                sessionStorage.setItem('clientId', '${appId}');
                sessionStorage.setItem('merchantId', '${merchantId}');
                window.location.href = '/cloudStarter.html';
            </script>
        `;
        res.send(responseHtml);

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

// Ruta Principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Escucha el servidor en el puerto especificado
app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});
