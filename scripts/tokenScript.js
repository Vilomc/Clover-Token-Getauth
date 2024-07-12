// scripts/tokenScript.js
// Puedes recuperar el token de sessionStorage si lo necesitas
const accessTokenSession = sessionStorage.getItem('accessToken');

// Mostrar el token de acceso en el párrafo
if (accessTokenSession) {
  document.getElementById('access-token').textContent = accessTokenSession;
} else {
  document.getElementById('access-token').textContent = 'Access Token not found';
}

// Si no necesitas almacenar el token en sessionStorage, simplemente puedes mostrarlo directamente
const urlParams = new URLSearchParams(window.location.search);
const accessTokenURL = urlParams.get('accessToken');

if (accessTokenURL) {
  document.getElementById('access-token').textContent = accessTokenURL;
} else {
  // Asegúrate de no sobrescribir el contenido si el token de sessionStorage ya está presente
  if (!accessTokenSession) {
    document.getElementById('access-token').textContent = 'Access Token not found';
  }
}
