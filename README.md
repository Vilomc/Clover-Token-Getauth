# Manual de uso del backend OAuth de Clover (Sandbox)

## 1. Requisitos previos

Antes de ejecutar este backend necesitas:

- Node.js (v16 o superior recomendado)
- npm (v8 o superior recomendado)
- Una cuenta de desarrollador en [Clover] para obtener:
  - `APP_ID` (Client ID)
  - `APP_SECRET` (Client Secret)

---

## 2. Instalación

1. **Clonar o copiar el proyecto**

   ```bash
   git clone <repositorio>  # o simplemente crea una carpeta y guarda el archivo server.js
   cd <nombre_del_proyecto>
   ```

2. **Inicializar proyecto Node.js (si no existe package.json)**

   ```bash
   npm init -y
   ```

3. **Instalar dependencias**

   ```bash
   npm install express axios
   ```

4. **Configurar las credenciales**

   En el archivo `app.js`, reemplaza:

   ```js
   const APP_ID = 'TU_APP_ID';
   const APP_SECRET = 'TU_APP_SECRET';
   ```

   Por tus valores de sandbox de Clover.

---

## 3. Cómo ejecutar

```bash
node server.js
```

Deberías ver en consola:

```
App listening at http://localhost:3000
```

El backend quedará escuchando en `http://localhost:3000`.

---

## 4. Uso del endpoint principal

### Endpoint

```
GET /
```

### Query parameters obligatorios

- `merchant_id`: ID del comercio.
- `client_id`: Debe coincidir con `APP_ID`.
- `code`: Código de autorización proporcionado por Clover.

### Ejemplo de request

```
http://localhost:3000/?merchant_id=123&client_id=TU_APP_ID&code=abcd1234
```

---

## 5. Funcionamiento interno

1. **Validación de parámetros**

   - Si falta `merchant_id`, `client_id` o `code` → retorna **400** con error.
   - Si `client_id` no coincide con `APP_ID` → retorna **403**.

2. **Obtención del token**

   La función `getAccessToken()` decide a qué endpoint llamar según el formato del `code`:

   - **Si el code NO contiene "-"** → POST JSON a `https://sandbox.dev.clover.com/oauth/v2/token`
     ```json
     {
       "client_id": "<APP_ID>",
       "client_secret": "<APP_SECRET>",
       "code": "<code>"
     }
     ```
   - **Si el code contiene "-"** → GET a `https://sandbox.dev.clover.com/oauth/token` con query params.

3. **Tiempo de espera**: 10 segundos máximo por request.

---

## 6. Respuestas posibles

| Situación | Código HTTP | Respuesta JSON |
|-----------|------------|----------------|
| Parámetros faltantes | 400 | `{ error: 'Missing required query parameters: merchant_id, client_id, code' }` |
| `client_id` incorrecto | 403 | `{ error: 'Backend configurado para otra app' }` |
| Token obtenido correctamente | 200 | `{ access_token: "...", refresh_token: "...", expires_in: ..., token_type: "bearer" }` |
| Error en el servidor de Clover | 500 o status upstream | `{ message: 'Error fetching access token', error: "<mensaje>" }` o `{ message: 'Error fetching access token (upstream)', status: <status>, data: <datos> }` |

> En consola siempre se loguean los valores de `merchant_id`, `client_id`, `code` y la respuesta de token.

---

## 7. Descargo de responsabilidad

- Este backend **solo funciona en el entorno Sandbox** de Clover.  
- No debe usarse en producción sin cambios y revisiones de seguridad.  
- Los tokens y códigos son **solo para pruebas en equipo sandbox asociado al merchantId correspondiente**,  
- El código es **educativo y de prueba**, no se garantiza seguridad ni disponibilidad en un entorno real.

