// firebase-config.js - Configuração robusta do Firebase
console.log('🔧 Carregando Firebase Config...');

const firebaseConfig = {
  apiKey: "AIzaSyAJVXlPg1gE2l8W4BgIWOSloLg-8mc_d0A",
  authDomain: "gigamoz-agency.firebaseapp.com",
  projectId: "gigamoz-agency",
  storageBucket: "gigamoz-agency.firebasestorage.app",
  messagingSenderId: "1012835914296",
  appId: "1:1012835914296:web:0decb9f4aa0ba50d384ccd",
  measurementId: "G-2ZLTKDG7JT"
};

// Inicializar Firebase
let firebaseApp;
let auth;
let db;
let storage;

try {
  // Verificar se Firebase já foi inicializado
  if (!firebase.apps.length) {
    firebaseApp = firebase.initializeApp(firebaseConfig);
    console.log('✅ Firebase App inicializado');
  } else {
    firebaseApp = firebase.app();
    console.log('✅ Firebase App já estava inicializado');
  }

  // Inicializar serviços
  auth = firebase.auth();
  db = firebase.firestore();
  
  // Inicializar storage apenas se a função existir
  if (typeof firebase.storage === 'function') {
    storage = firebase.storage();
    console.log('✅ Storage inicializado');
  } else {
    console.warn('⚠️ Storage não disponível nesta versão');
    storage = null;
  }

  console.log('✅ Todos os serviços Firebase carregados com sucesso');

  // Exportar para window (global)
  window.firebase = firebase;
  window.firebaseApp = firebaseApp;
  window.auth = auth;
  window.db = db;
  window.storage = storage;

  // Marcar Firebase como pronto
  window.firebaseReady = true;

  // Disparar evento customizado
  window.dispatchEvent(new Event('firebaseReady'));

} catch (error) {
  console.error('❌ Erro crítico ao inicializar Firebase:', error);
  
  // Mostrar mensagem de erro ao usuário
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', showFirebaseError);
  } else {
    showFirebaseError();
  }
  
  function showFirebaseError() {
    const errorMsg = document.createElement('div');
    errorMsg.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #ef4444;
      color: white;
      padding: 16px 24px;
      border-radius: 8px;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
    errorMsg.textContent = '❌ Erro ao conectar com o Firebase. Recarregue a página.';
    document.body.appendChild(errorMsg);
  }
}

// Função helper para aguardar Firebase estar pronto
window.waitForFirebase = function() {
  return new Promise((resolve) => {
    if (window.firebaseReady) {
      resolve();
      return;
    }

    let attempts = 0;
    const maxAttempts = 50; // 5 segundos

    const checkFirebase = () => {
      attempts++;
      
      if (window.firebaseReady && window.auth && window.db) {
        console.log('✅ Firebase pronto após', attempts * 100, 'ms');
        resolve();
      } else if (attempts >= maxAttempts) {
        console.error('❌ Timeout aguardando Firebase');
        resolve(); // Resolve anyway para não bloquear a aplicação
      } else {
        setTimeout(checkFirebase, 100);
      }
    };

    checkFirebase();
  });
};

console.log('✅ Firebase Config carregado');