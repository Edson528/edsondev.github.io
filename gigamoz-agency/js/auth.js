// auth.js - Sistema de autenticação robusto (CORRIGIDO)
console.log('🔐 Carregando sistema de autenticação...');

// Fallback para funções de notificação
if (typeof showSuccess === 'undefined') {
  window.showSuccess = function(message, duration = 3000) {
    console.log('✅ ' + message);
    // Fallback com alert
    const fallback = document.createElement('div');
    fallback.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #10b981;
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    fallback.textContent = '✅ ' + message;
    document.body.appendChild(fallback);
    setTimeout(() => fallback.remove(), duration);
  };
}

if (typeof showError === 'undefined') {
  window.showError = function(message, duration = 5000) {
    console.error('❌ ' + message);
    // Fallback com alert
    const fallback = document.createElement('div');
    fallback.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #ef4444;
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    fallback.textContent = '❌ ' + message;
    document.body.appendChild(fallback);
    setTimeout(() => fallback.remove(), duration);
  };
}

if (typeof showInfo === 'undefined') {
  window.showInfo = function(message, duration = 3000) {
    console.log('ℹ️ ' + message);
    // Fallback com alert
    const fallback = document.createElement('div');
    fallback.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #06b6d4;
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    fallback.textContent = 'ℹ️ ' + message;
    document.body.appendChild(fallback);
    setTimeout(() => fallback.remove(), duration);
  };
}

class AuthManager {
  constructor() {
    this.currentUser = null;
    this.userData = null;
    this.authChecked = false;
    this.authListenerReady = false;
    this.init();
  }

  async init() {
    console.log('🚀 Inicializando AuthManager...');
    await window.waitForFirebase();
    this.setupAuthListener();
  }

  setupAuthListener() {
    if (!window.auth) {
      console.error('❌ Auth não disponível');
      return;
    }

    console.log('👂 Configurando listener de autenticação...');

    window.auth.onAuthStateChanged(async (user) => {
      console.log('🔄 Estado de autenticação mudou:', user ? user.email : 'não logado');
      
      this.currentUser = user;
      
      if (user) {
        try {
          this.userData = await this.getUserData(user.uid);
          console.log('✅ Dados do usuário carregados:', this.userData);
        } catch (error) {
          console.error('❌ Erro ao carregar dados do usuário:', error);
          this.userData = null;
        }
      } else {
        this.userData = null;
      }
      
      this.authChecked = true;
      this.authListenerReady = true;
      
      // Disparar evento customizado
      window.dispatchEvent(new CustomEvent('authStateChanged', { 
        detail: { user: this.currentUser, userData: this.userData } 
      }));
      
      // Gerenciar redirecionamentos APENAS se não for página de login
      if (!window.location.pathname.includes('login.html')) {
        this.handlePageAccess();
      }
    });
  }

  handlePageAccess() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    console.log('📄 Página atual:', currentPage);

    // Páginas que requerem autenticação
    const protectedPages = ['admin.html', 'dashboard.html'];
    
    // Se não está logado e está em página protegida
    if (!this.currentUser && protectedPages.includes(currentPage)) {
      console.log('🔒 Redirecionando para login...');
      window.location.href = 'login.html';
      return;
    }

    // Se está logado e está na página de login, NÃO redirecionar automaticamente
    if (this.currentUser && currentPage === 'login.html') {
      console.log('🔐 Usuário já logado na página de login - mantendo na página');
      // Mas podemos mostrar um botão para ir para o dashboard
      this.showLoggedInOptions();
      return;
    }

    // Verificar acesso admin
    if (currentPage === 'admin.html' && !this.isAdmin()) {
      console.log('⛔ Acesso negado ao admin, redirecionando...');
      window.location.href = this.currentUser ? 'dashboard.html' : 'login.html';
      return;
    }

    // Verificar se admin aprovado tentando acessar dashboard
    if (currentPage === 'dashboard.html' && this.isAdmin()) {
      console.log('🔀 Admin redirecionado para painel admin');
      window.location.href = 'admin.html';
      return;
    }
  }

  showLoggedInOptions() {
    // Adicionar opções para usuário já logado
    const loginBox = document.querySelector('.login-box');
    if (loginBox && !document.getElementById('loggedInOptions')) {
      const optionsDiv = document.createElement('div');
      optionsDiv.id = 'loggedInOptions';
      optionsDiv.style.cssText = `
        background: var(--glass);
        padding: 16px;
        border-radius: 8px;
        margin-top: 20px;
        text-align: center;
        border: 1px solid var(--border);
      `;
      
      const userType = this.isAdmin() ? '👑 Administrador' : '👤 Usuário';
      optionsDiv.innerHTML = `
        <h4>✅ Você já está logado!</h4>
        <p>Logado como: <strong>${this.userData?.name || this.currentUser?.email}</strong></p>
        <p>Tipo: ${userType}</p>
        <div style="display: flex; gap: 10px; justify-content: center; margin-top: 15px;">
          <button class="btn" onclick="window.location.href='${this.isAdmin() ? 'admin.html' : 'dashboard.html'}'">
            🚀 Ir para ${this.isAdmin() ? 'Painel Admin' : 'Meu Dashboard'}
          </button>
          <button class="ghost" onclick="authManager.logout()">
            🚪 Sair
          </button>
        </div>
      `;
      
      // Esconder formulários de login/registro
      document.querySelectorAll('.login-form').forEach(form => form.style.display = 'none');
      document.querySelector('.login-tabs').style.display = 'none';
      
      loginBox.appendChild(optionsDiv);
    }
  }

  async login(email, password) {
    try {
      console.log('🔐 Tentando login:', email);
      
      // Verificar se Firebase está disponível
      if (!window.auth) {
        throw new Error('Serviço de autenticação não disponível');
      }
      
      const userCredential = await window.auth.signInWithEmailAndPassword(email, password);
      const user = userCredential.user;
      
      console.log('✅ Autenticação Firebase bem-sucedida, buscando dados do usuário...');
      
      // Buscar dados do usuário
      this.userData = await this.getUserData(user.uid);
      
      if (!this.userData) {
        console.warn('⚠️ Dados do usuário não encontrados no Firestore');
        await window.auth.signOut();
        throw new Error('Dados do usuário não encontrados. Contate o administrador.');
      }

      console.log('✅ Dados do usuário encontrados:', this.userData);

      // Verificar se admin foi aprovado
      if (this.userData.type === 'admin' && !this.userData.approved) {
        await window.auth.signOut();
        throw new Error('Conta admin aguardando aprovação. Entre em contato com o administrador.');
      }

      console.log('✅ Login completo bem-sucedido');
      
      // Redirecionar baseado no tipo de usuário
      if (this.userData.type === 'admin' && this.userData.approved) {
        showSuccess('✅ Login admin bem-sucedido! Redirecionando...');
        setTimeout(() => {
          window.location.href = 'admin.html';
        }, 1500);
      } else {
        showSuccess('✅ Login bem-sucedido! Redirecionando para seu dashboard...');
        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 1500);
      }
      
      return { success: true, user: this.userData };

    } catch (error) {
      console.error('❌ Erro no login:', error);
      const errorMessage = this.getAuthErrorMessage(error);
      
      // Verificar se é erro de usuário não encontrado
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-login-credentials') {
        return { 
          success: false, 
          error: errorMessage,
          userNotFound: true,
          email: email // Retornar o email para pré-preencher no registro
        };
      }
      
      return { success: false, error: errorMessage };
    }
  }

  async register(userData) {
    try {
      console.log('📝 Registrando novo usuário:', userData.email);
      
      // Verificar se Firebase está disponível
      if (!window.auth) {
        throw new Error('Serviço de autenticação não disponível');
      }
      
      // Criar usuário no Authentication
      console.log('🔐 Criando usuário no Firebase Auth...');
      const userCredential = await window.auth.createUserWithEmailAndPassword(
        userData.email, 
        userData.password
      );
      
      const user = userCredential.user;
      console.log('✅ Usuário criado no Auth, ID:', user.uid);

      // Salvar dados no Firestore
      console.log('💾 Salvando dados no Firestore...');
      const userDoc = {
        name: userData.name,
        email: userData.email,
        whatsapp: userData.whatsapp,
        type: userData.type,
        approved: userData.type === 'user', // Users aprovados automaticamente
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      };

      await window.db.collection('users').doc(user.uid).set(userDoc);
      console.log('✅ Dados salvos no Firestore:', userDoc);

      // Atualizar dados locais
      this.userData = userDoc;
      this.currentUser = user;

      console.log('✅ Usuário registrado com sucesso - tipo:', userData.type);

      // Se for admin, fazer logout imediato
      if (userData.type === 'admin') {
        console.log('👑 Conta admin criada - fazendo logout para aprovação');
        await window.auth.signOut();
        showSuccess('✅ Conta admin criada! Aguarde aprovação de um administrador.');
        return { 
          success: true, 
          message: 'Conta admin criada! Aguarde aprovação de um administrador.',
          needsApproval: true 
        };
      }

      // Se for usuário normal, redirecionar para dashboard
      console.log('👤 Conta usuário criada - redirecionando para dashboard');
      showSuccess('✅ Conta criada com sucesso! Redirecionando...');
      
      // Dar tempo para o Firestore salvar e o listener atualizar
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 2000);
      
      return { success: true, user: user };

    } catch (error) {
      console.error('❌ Erro no registro:', error);
      
      // Se houve erro após criar o usuário, tentar limpar
      if (window.auth.currentUser) {
        try {
          await window.auth.currentUser.delete();
          console.log('🧹 Usuário removido do Auth devido a erro');
        } catch (deleteError) {
          console.error('❌ Erro ao remover usuário:', deleteError);
        }
      }
      
      const errorMessage = this.getAuthErrorMessage(error);
      return { success: false, error: errorMessage };
    }
  }

  async logout() {
    try {
      console.log('🚪 Fazendo logout...');
      await window.auth.signOut();
      
      // Limpar dados locais
      this.currentUser = null;
      this.userData = null;
      
      showSuccess('✅ Logout realizado com sucesso!');
      
      // Redirecionar para index
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1000);
      
    } catch (error) {
      console.error('❌ Erro no logout:', error);
      showError('Erro ao fazer logout');
    }
  }

  async getUserData(uid) {
    try {
      // Verificar se Firestore está disponível
      if (!window.db) {
        console.error('❌ Firestore não disponível');
        return null;
      }
      
      console.log('📖 Buscando dados do usuário:', uid);
      const userDoc = await window.db.collection('users').doc(uid).get();
      
      if (!userDoc.exists) {
        console.warn('⚠️ Documento do usuário não encontrado no Firestore');
        return null;
      }
      
      const userData = userDoc.data();
      console.log('✅ Dados do usuário encontrados:', userData);
      return userData;
      
    } catch (error) {
      console.error('❌ Erro ao buscar dados do usuário:', error);
      return null;
    }
  }

  isAdmin() {
    return this.userData && 
           this.userData.type === 'admin' && 
           this.userData.approved === true;
  }

  isLoggedIn() {
    return this.currentUser !== null && this.userData !== null;
  }

  getAuthErrorMessage(error) {
    const errorMessages = {
      'auth/user-not-found': 'Usuário não encontrado',
      'auth/wrong-password': 'Senha incorreta',
      'auth/email-already-in-use': 'Este email já está em uso',
      'auth/weak-password': 'Senha muito fraca (mínimo 6 caracteres)',
      'auth/invalid-email': 'Email inválido',
      'auth/network-request-failed': 'Erro de conexão. Verifique sua internet',
      'auth/too-many-requests': 'Muitas tentativas. Aguarde alguns minutos',
      'auth/user-disabled': 'Esta conta foi desativada',
      'auth/invalid-login-credentials': 'Email ou senha incorretos',
      'auth/invalid-credential': 'Credenciais inválidas',
      'auth/operation-not-allowed': 'Operação não permitida'
    };
    
    return errorMessages[error.code] || error.message || 'Erro desconhecido';
  }
}

// Inicializar AuthManager
const authManager = new AuthManager();

// Funções globais para formulários
async function handleLogin(event) {
  event.preventDefault();
  
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  const submitBtn = event.target.querySelector('button[type="submit"]');
  const btnText = submitBtn.querySelector('.btn-text');
  const spinner = submitBtn.querySelector('.spinner');

  // Validação básica
  if (!email || !password) {
    showError('Por favor, preencha todos os campos');
    return;
  }

  // UI Loading
  btnText.textContent = 'Entrando...';
  if (spinner) spinner.style.display = 'inline-block';
  submitBtn.disabled = true;

  // Fazer login
  const result = await authManager.login(email, password);

  if (!result.success) {
    if (result.userNotFound) {
      // Usuário não encontrado - sugerir registro
      showInfo(`📝 Conta não encontrada. Vamos criar uma nova conta para ${result.email}?`);
      
      // Trocar para aba de registro
      setTimeout(() => {
        showTab('register');
        
        // Pré-preencher o email no formulário de registro
        document.getElementById('registerEmail').value = result.email;
        document.getElementById('registerName').focus();
      }, 1500);
    } else {
      showError(result.error);
    }
    
    btnText.textContent = '🔑 Entrar';
    if (spinner) spinner.style.display = 'none';
    submitBtn.disabled = false;
  }
  // Se success, o redirecionamento é feito no método login
}

async function handleRegister(event) {
  event.preventDefault();
  
  const userData = {
    name: document.getElementById('registerName').value,
    email: document.getElementById('registerEmail').value,
    whatsapp: document.getElementById('registerWhatsApp').value,
    password: document.getElementById('registerPassword').value,
    type: document.getElementById('registerType').value
  };

  const submitBtn = event.target.querySelector('button[type="submit"]');
  const btnText = submitBtn.querySelector('.btn-text');
  const spinner = submitBtn.querySelector('.spinner');

  // Validação
  if (!userData.name || !userData.email || !userData.whatsapp || !userData.password || !userData.type) {
    showError('Por favor, preencha todos os campos');
    return;
  }

  // Validar tipo de conta
  if (!userData.type) {
    showError('Selecione o tipo de conta');
    return;
  }

  // Validar WhatsApp
  const whatsappRegex = /^\+258[0-9]{9}$/;
  if (!whatsappRegex.test(userData.whatsapp)) {
    showError('Formato de WhatsApp inválido. Use: +258841234567');
    return;
  }

  // Confirmar se é admin
  if (userData.type === 'admin') {
    if (!confirm('⚠️ Contas admin precisam de aprovação. Você não poderá acessar o sistema até ser aprovado. Deseja continuar?')) {
      return;
    }
  }

  // UI Loading
  btnText.textContent = 'Criando conta...';
  if (spinner) spinner.style.display = 'inline-block';
  submitBtn.disabled = true;

  // Fazer registro
  const result = await authManager.register(userData);

  if (result.success) {
    if (result.needsApproval) {
      showSuccess('✅ Conta admin criada! Aguarde aprovação de um administrador.');
      
      // Resetar formulário
      event.target.reset();
      
      // Trocar para aba de login após 2 segundos
      setTimeout(() => {
        showTab('login');
      }, 2000);
    }
    // Se não precisa de aprovação, o redirecionamento é feito no método register
  } else {
    showError(result.error);
    btnText.textContent = '🚀 Criar Conta';
    if (spinner) spinner.style.display = 'none';
    submitBtn.disabled = false;
  }
}

// Setup dos formulários quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
    console.log('✅ Formulário de login configurado');
  }
  
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
    console.log('✅ Formulário de registro configurado');
  }

  // Mostrar opções se usuário já está logado
  if (authManager.isLoggedIn() && window.location.pathname.includes('login.html')) {
    console.log('👤 Usuário já logado na página de login');
    authManager.showLoggedInOptions();
  }
});

// Exportar para window
window.authManager = authManager;
window.handleLogin = handleLogin;
window.handleRegister = handleRegister;

console.log('✅ Sistema de autenticação carregado');