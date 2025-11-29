// debug-auth.js - Script temporário para debug
console.log('🐛 Debug Auth - Verificando estado...');

// Verificar estado a cada 2 segundos
setInterval(() => {
  console.log('=== DEBUG AUTH STATE ===');
  console.log('Current User:', authManager.currentUser?.email);
  console.log('User Data:', authManager.userData);
  console.log('Is Logged In:', authManager.isLoggedIn());
  console.log('Is Admin:', authManager.isAdmin());
  console.log('Auth Checked:', authManager.authChecked);
  console.log('========================');
}, 2000);

// Verificar redirecionamentos
console.log('📍 Página atual:', window.location.pathname);