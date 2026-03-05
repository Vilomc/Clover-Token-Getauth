# Clover OAuth V2 Backend (Sandbox – Alternate Launch)

Backend Node.js para implementar el flujo OAuth V2 con Alternate Launch en Clover (entorno Sandbox).

## 1. Requisitos
- Node.js 16+
- npm 8+
- Aplicación creada en Clover Sandbox

**Credenciales:**
- `APP_ID` (Client ID)
- `APP_SECRET` (Client Secret)

## 2. Instalación
### Crear proyecto:
```bash
mkdir clover-oauth-backend
cd clover-oauth-backend
```
### Inicializar Node:
```bash
npm init -y
```
### Instalar dependencias:
```bash
npm install express axios
```
### Configurar credenciales en `server.js`:
```js
const APP_ID = 'TU_APP_ID';
const APP_SECRET = 'TU_APP_SECRET';
```

## 3. Configuración en Clover Dashboard
En **Edit REST Configuration**:
- **Site URL:**
  ```http://localhost:3000``` 
- **Alternate Launch Path:**
  ```/alternate-launch``` 
Clover construirá automáticamente:
```http://localhost:3000/alternate-launch```
Ese es el endpoint que Clover invoca cuando se instala o ejecuta la aplicación.

## 4. Diferencia entre `Alternate Launch` y `redirect_uri`
### Alternate Launch:
Es el endpoint inicial que Clover llama:
```http://localhost:3000/alternate-launch```
Se define mediante:
sitio URL y Alternate Launch Path.
El `redirect_uri` es el endpoint al que Clover redirige después de generar el authorization code.
Ejemplo configurado en el backend:

http://localhost:3000/oauth/callback

ejemplo real de callback: http://localhost:3000/oauth/callback?merchant_id=MERCHANT_ID&employee_id=EMPLOYEE_ID&state=STATE&client_id=APP_ID&code=AUTH_CODE, ese endpoint recibe el code, intercambia por access_token y devuelve el JSON del token en navegador.

## 5. Flujo OAuth V2
1. **Clover llama Alternate Launch:**
get `/alternate-launch?merchant_id=...&client_id=...`
el backend valida client_id y responde con redirección 302.
2. **Redirección a Clover OAuth:**
https://sandbox.dev.clover.com/oauth/v2/merchants/{merchant_id}
párametros enviados incluyen client_id, redirect_uri, response_type, y state.
3. **Callback OAuth:**
get `/oauth/callback?code=AUTH_CODE&state=MERCHANT_ID`.
donde se intercambia el código por token mediante POST a la API de tokens con payload incluyendo client_id, client_secret, code, grant_type.
4. **Respuesta Final:**
el backend devuelve exactamente el JSON recibido desde Clover, ejemplo:
{"access_token": "...","access_token_expiration": 1772680513,"refresh_token": "...","refresh_token_expiration": 1804214713}

Es importante notar que `access_token_expiration` es timestamp Unix.
La respuesta de Clover no se modifica.

## 6. Ejecución
Ejecutar con comando:
node server.js 
Salida esperada: Server running at http://localhost:3000.
Debido a que indica que está corriendo correctamente.
También muestra si hay errores o problemas de conexión.
Ya se puede acceder a la app desde la web de Clover para probar los endpoints definidos.
todo esto asumiendo configuración correcta del entorno y credenciales válidas en la app de Clover Sandbox.
yo debe asegurarse de tener permisos adecuados y configurar correctamente los URLs en dashboard de Clover para evitar errores de redireccionamiento o autenticación incorrecta.'
