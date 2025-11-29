// js/dashboard.js - Funcionalidades do dashboard do usuário
console.log('📊 Carregando dashboard...');

class DashboardManager {
  constructor() {
    this.userData = null;
    this.userOrders = [];
    this.init();
  }

  async init() {
    console.log('🚀 Inicializando DashboardManager...');
    
    // Aguardar Firebase estar pronto
    await window.waitForFirebase();
    
    // Aguardar AuthManager estar pronto
    await this.waitForAuthManager();
    
    // Verificar autenticação
    if (!window.authManager || !window.authManager.isLoggedIn()) {
      console.error('❌ Usuário não autenticado');
      this.redirectToLogin();
      return;
    }

    // Verificar se é admin (redirecionar se for)
    if (window.authManager.isAdmin()) {
      console.log('🔀 Usuário é admin, redirecionando...');
      window.location.href = 'admin.html';
      return;
    }

    console.log('✅ Usuário autenticado como usuário normal');
    
    await this.loadUserData();
    await this.loadUserOrders();
    this.updateUI();
    
    console.log('✅ DashboardManager inicializado');
  }

  async waitForAuthManager() {
    return new Promise((resolve) => {
      const checkAuth = () => {
        if (window.authManager && window.authManager.authChecked) {
          console.log('✅ AuthManager verificado');
          resolve();
        } else {
          setTimeout(checkAuth, 100);
        }
      };
      checkAuth();
    });
  }

  redirectToLogin() {
    console.log('🔒 Redirecionando para login...');
    showError('Sessão expirada. Faça login novamente.');
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 2000);
  }

  async loadUserData() {
    try {
      this.userData = window.authManager.userData;
      
      if (!this.userData) {
        throw new Error('Dados do usuário não disponíveis');
      }
      
      // Atualizar UI
      document.getElementById('userName').textContent = this.userData.name || 'Usuário';
      document.getElementById('userEmail').textContent = this.userData.email;
      
      // Atualizar avatar com primeira letra do nome
      const avatar = document.getElementById('userAvatar');
      if (this.userData.name) {
        avatar.textContent = this.userData.name.charAt(0).toUpperCase();
        avatar.style.background = this.generateColorFromName(this.userData.name);
      }
      
      console.log('✅ Dados do usuário carregados:', this.userData);
      
    } catch (error) {
      console.error('❌ Erro ao carregar dados do usuário:', error);
      showError('Erro ao carregar dados do usuário');
    }
  }

  async loadUserOrders() {
    try {
      if (!window.authManager.currentUser) {
        console.warn('⚠️ Usuário não autenticado, não é possível carregar pedidos');
        return;
      }

      const userId = window.authManager.currentUser.uid;
      console.log('📦 Carregando pedidos do usuário:', userId);

      const ordersSnapshot = await window.db.collection('orders')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(10)
        .get();

      this.userOrders = ordersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log(`✅ ${this.userOrders.length} pedidos carregados`);
      this.renderOrders();
      this.updateStats();
      
    } catch (error) {
      console.error('❌ Erro ao carregar pedidos:', error);
      document.getElementById('ordersList').innerHTML = 
        '<p class="muted">Erro ao carregar pedidos. Tente recarregar a página.</p>';
    }
  }

  renderOrders() {
    const ordersList = document.getElementById('ordersList');
    
    if (this.userOrders.length === 0) {
      ordersList.innerHTML = `
        <div style="text-align: center; padding: 40px;">
          <div style="font-size: 48px; margin-bottom: 16px;">📦</div>
          <h3>Nenhum pedido encontrado</h3>
          <p class="muted">Seus pedidos aparecerão aqui</p>
          <a href="index.html" class="btn" style="margin-top: 16px;">🛒 Fazer Primeiro Pedido</a>
        </div>
      `;
      return;
    }

    ordersList.innerHTML = this.userOrders.map(order => `
      <div class="order-item">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
          <div>
            <strong>${order.service || 'Serviço'}</strong>
            <div class="muted">Pedido #${order.id.slice(-6)}</div>
          </div>
          <span class="order-status status-${order.status || 'pending'}">
            ${this.getStatusText(order.status)}
          </span>
        </div>
        <div class="muted" style="margin-bottom: 8px;">${order.details || 'Sem detalhes adicionais'}</div>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span class="muted">${this.formatDate(order.createdAt)}</span>
          <strong>${order.amount || 0} MT</strong>
        </div>
      </div>
    `).join('');
  }

  updateStats() {
    const completedOrders = this.userOrders.filter(order => order.status === 'completed').length;
    const pendingOrders = this.userOrders.filter(order => order.status === 'pending').length;
    const totalSpent = this.userOrders
      .filter(order => order.status === 'completed')
      .reduce((sum, order) => sum + (order.amount || 0), 0);

    document.getElementById('ordersCount').textContent = this.userOrders.length;
    document.getElementById('completedOrders').textContent = completedOrders;
    document.getElementById('pendingOrders').textContent = pendingOrders;
    document.getElementById('totalSpent').textContent = totalSpent + ' MT';
  }

  updateUI() {
    showSuccess('✅ Dashboard carregado com sucesso!');
  }

  getStatusText(status) {
    const statusMap = {
      'pending': '⏳ Pendente',
      'processing': '⚙️ Processando',
      'completed': '✅ Concluído',
      'cancelled': '❌ Cancelado'
    };
    return statusMap[status] || '⏳ Pendente';
  }

  formatDate(timestamp) {
    if (!timestamp) return 'Data não disponível';
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('pt-MZ', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return 'Data inválida';
    }
  }

  generateColorFromName(name) {
    const colors = [
      '#ef4444', '#f59e0b', '#10b981', '#06b6d4', 
      '#3b82f6', '#8b5cf6', '#ec4899', '#84cc16'
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  }
}

// Inicializar dashboard quando DOM estiver pronto
let dashboardManager;

document.addEventListener('DOMContentLoaded', async function() {
  console.log('📄 DOM carregado - inicializando dashboard...');
  
  try {
    dashboardManager = new DashboardManager();
    window.dashboardManager = dashboardManager;
  } catch (error) {
    console.error('❌ Erro ao inicializar dashboard:', error);
    showError('Erro ao carregar dashboard: ' + error.message);
  }
});

// Funções globais
function openWhatsApp() {
  const phone = '258847206883';
  const message = encodeURIComponent('Olá! Preciso de suporte sobre minha conta GigaMoz.');
  window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
}

console.log('✅ Dashboard.js carregado');