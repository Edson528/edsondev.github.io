// admin.js - Painel administrativo completo
console.log('👑 Carregando painel administrativo...');

// Fallback para funções de notificação
if (typeof showSuccess === 'undefined') {
  window.showSuccess = function(message, duration = 3000) {
    console.log('✅ ' + message);
    // Fallback simples
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
    // Fallback simples
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
    // Fallback simples
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

if (typeof showWarning === 'undefined') {
  window.showWarning = function(message, duration = 4000) {
    console.warn('⚠️ ' + message);
    // Fallback simples
    const fallback = document.createElement('div');
    fallback.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #f59e0b;
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    fallback.textContent = '⚠️ ' + message;
    document.body.appendChild(fallback);
    setTimeout(() => fallback.remove(), duration);
  };
}

class AdminManager {
  constructor() {
    this.stats = {
      totalUsers: 0,
      totalOrders: 0,
      totalProducts: 0,
      revenue: 0,
      pendingApprovals: 0
    };
    this.currentTab = 'dashboard';
    this.init();
  }

  async init() {
    console.log('🚀 Inicializando AdminManager...');
    
    await window.waitForFirebase();
    await this.waitForAuth();
    await this.verifyAdminAccess();
    
    this.setupEventListeners();
    await this.loadInitialData();
    
    console.log('✅ AdminManager inicializado');
  }

  async waitForAuth() {
    return new Promise((resolve) => {
      if (window.authManager && window.authManager.authChecked) {
        resolve();
        return;
      }

      const checkAuth = () => {
        if (window.authManager && window.authManager.authChecked) {
          console.log('✅ Autenticação verificada');
          resolve();
        } else {
          setTimeout(checkAuth, 100);
        }
      };

      checkAuth();
    });
  }

  async verifyAdminAccess() {
    console.log('🔍 Verificando acesso admin...');
    
    if (!window.authManager.isLoggedIn()) {
      console.log('❌ Não logado - redirecionando');
      window.location.href = 'login.html';
      return false;
    }

    if (!window.authManager.isAdmin()) {
      console.log('❌ Não é admin - redirecionando');
      window.location.href = 'dashboard.html';
      return false;
    }

    console.log('✅ Acesso admin verificado');
    
    const welcomeEl = document.getElementById('adminWelcome');
    if (welcomeEl) {
      welcomeEl.textContent = `Bem-vindo, ${window.authManager.userData.name || 'Admin'}!`;
    }
    
    return true;
  }

  async loadInitialData() {
    try {
      showInfo('📊 Carregando dados...', 2000);
      
      await Promise.all([
        this.loadStats(),
        this.loadRecentActivity(),
        this.loadProducts(),
        this.loadOrders(),
        this.loadUsers(),
        this.loadApprovals()
      ]);
      
      console.log('✅ Dados iniciais carregados');
      showSuccess('✅ Painel carregado com sucesso!', 3000);
      
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
      showError('Erro ao carregar alguns dados');
    }
  }

  async loadStats() {
    try {
      console.log('📊 Carregando estatísticas...');
      
      const [usersSnap, ordersSnap, productsSnap, completedSnap, pendingSnap] = await Promise.all([
        window.db.collection('users').get(),
        window.db.collection('orders').get(),
        window.db.collection('products').where('status', '==', 'active').get(),
        window.db.collection('orders').where('status', '==', 'completed').get(),
        window.db.collection('users').where('type', '==', 'admin').where('approved', '==', false).get()
      ]);

      this.stats.totalUsers = usersSnap.size;
      this.stats.totalOrders = ordersSnap.size;
      this.stats.totalProducts = productsSnap.size;
      this.stats.pendingApprovals = pendingSnap.size;
      
      // Calcular receita
      this.stats.revenue = 0;
      completedSnap.forEach(doc => {
        const order = doc.data();
        this.stats.revenue += (order.amount || 0);
      });

      this.updateStatsUI();
      console.log('✅ Estatísticas carregadas:', this.stats);

    } catch (error) {
      console.error('❌ Erro ao carregar estatísticas:', error);
    }
  }

  updateStatsUI() {
    const updates = {
      'totalUsers': this.stats.totalUsers,
      'totalOrders': this.stats.totalOrders,
      'totalProducts': this.stats.totalProducts,
      'revenue': this.stats.revenue + ' MT',
      'pendingApprovals': this.stats.pendingApprovals
    };

    Object.entries(updates).forEach(([id, value]) => {
      const el = document.getElementById(id);
      if (el) {
        el.textContent = value;
        el.classList.add('updated');
        setTimeout(() => el.classList.remove('updated'), 500);
      }
    });
  }

  async loadRecentActivity() {
    try {
      const recentOrders = await window.db.collection('orders')
        .orderBy('createdAt', 'desc')
        .limit(5)
        .get();

      const activityHTML = recentOrders.docs.map(doc => {
        const order = doc.data();
        return `
          <div style="padding: 12px 0; border-bottom: 1px solid var(--border);">
            <div style="display: flex; justify-content: space-between; align-items: start;">
              <div>
                <strong>${order.customerName || 'Cliente'}</strong>
                <div class="muted" style="font-size: 0.9rem;">${order.service} - ${order.amount || 0} MT</div>
              </div>
              <span class="status-badge status-${order.status || 'pending'}">
                ${this.getStatusText(order.status)}
              </span>
            </div>
            <small class="muted">${this.formatDate(order.createdAt)}</small>
          </div>
        `;
      }).join('');

      const activityEl = document.getElementById('recentActivity');
      if (activityEl) {
        activityEl.innerHTML = activityHTML || '<p class="muted">Nenhuma atividade recente</p>';
      }

    } catch (error) {
      console.error('❌ Erro ao carregar atividade:', error);
    }
  }

  async loadProducts() {
    try {
      console.log('🛍️ Carregando produtos...');
      
      const productsSnap = await window.db.collection('products')
        .orderBy('createdAt', 'desc')
        .get();

      const productsHTML = productsSnap.docs.map(doc => {
        const product = doc.data();
        return `
          <div class="card" style="margin-bottom: 15px;">
            <div style="display: grid; grid-template-columns: 80px 1fr auto; gap: 15px; align-items: start;">
              <img src="${product.image}" 
                   alt="${product.title}"
                   loading="lazy"
                   style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;"
                   onerror="this.src='https://via.placeholder.com/80'">
              <div>
                <h4 style="margin: 0 0 8px 0;">${product.title}</h4>
                <p class="muted" style="margin: 0 0 8px 0; font-size: 0.9rem;">${product.description || 'Sem descrição'}</p>
                <div class="muted" style="font-size: 0.85rem;">
                  <strong style="color: var(--accent);">${product.price} MT</strong> • 
                  ${this.getCategoryName(product.category)} •
                  ${product.status === 'active' ? '🟢 Ativo' : '🔴 Inativo'}
                </div>
              </div>
              <div class="action-buttons" style="display: flex; gap: 5px;">
                <button class="ghost" 
                        onclick="adminManager.editProduct('${doc.id}')"
                        title="Editar">
                  ✏️
                </button>
                <button class="ghost error" 
                        onclick="adminManager.deleteProduct('${doc.id}')"
                        title="Excluir">
                  🗑️
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('');

      const productsList = document.getElementById('productsList');
      if (productsList) {
        productsList.innerHTML = productsHTML || '<p class="muted">Nenhum produto cadastrado</p>';
      }

      console.log(`✅ ${productsSnap.size} produtos carregados`);

    } catch (error) {
      console.error('❌ Erro ao carregar produtos:', error);
      const productsList = document.getElementById('productsList');
      if (productsList) {
        productsList.innerHTML = '<p class="muted error">Erro ao carregar produtos</p>';
      }
    }
  }

  async loadOrders() {
    try {
      const ordersSnap = await window.db.collection('orders')
        .orderBy('createdAt', 'desc')
        .get();

      const ordersHTML = ordersSnap.docs.map(doc => {
        const order = doc.data();
        return `
          <div class="order-item" style="background: var(--card); padding: 16px; border-radius: 10px; border: 1px solid var(--border); margin-bottom: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
              <div>
                <strong>${order.service}</strong>
                <div class="muted" style="font-size: 0.9rem;">${order.customerName} • ${order.customerEmail || order.customerWhatsApp}</div>
                <div class="muted" style="font-size: 0.85rem;">Pedido #${doc.id.slice(-6)}</div>
              </div>
              <div style="text-align: right;">
                <span class="status-badge status-${order.status || 'pending'}">
                  ${this.getStatusText(order.status)}
                </span>
                <div style="margin-top: 5px;">
                  <strong style="color: var(--accent);">${order.amount || 0} MT</strong>
                </div>
              </div>
            </div>
            <div class="muted" style="margin-bottom: 10px; font-size: 0.9rem;">${order.details || 'Sem detalhes'}</div>
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
              <span class="muted" style="font-size: 0.85rem;">${this.formatDate(order.createdAt)}</span>
              <div style="display: flex; gap: 8px; align-items: center;">
                <select onchange="adminManager.updateOrderStatus('${doc.id}', this.value)" 
                        style="padding: 6px 10px; border-radius: 6px; border: 1px solid var(--border); background: var(--glass); color: inherit; font-size: 0.9rem;">
                  <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>⏳ Pendente</option>
                  <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>⚙️ Processando</option>
                  <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>✅ Concluído</option>
                  <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>❌ Cancelado</option>
                </select>
                <button class="ghost" onclick="adminManager.viewOrderDetails('${doc.id}')" title="Ver detalhes">👁️</button>
              </div>
            </div>
          </div>
        `;
      }).join('');

      const ordersList = document.getElementById('ordersList');
      if (ordersList) {
        ordersList.innerHTML = ordersHTML || '<p class="muted">Nenhum pedido encontrado</p>';
      }

    } catch (error) {
      console.error('❌ Erro ao carregar pedidos:', error);
    }
  }

  async loadUsers() {
    try {
      const usersSnap = await window.db.collection('users')
        .orderBy('createdAt', 'desc')
        .get();

      const usersHTML = usersSnap.docs.map(doc => {
        const user = doc.data();
        return `
          <tr>
            <td>${user.name || 'N/A'}</td>
            <td>${user.email}</td>
            <td>
              <span class="user-role ${user.type === 'admin' ? 'role-admin' : ''}">
                ${user.type === 'admin' ? '👑 Admin' : '👤 User'}
              </span>
            </td>
            <td>
              <span class="status-badge ${user.approved ? 'status-approved' : 'status-pending'}">
                ${user.approved ? '✅ Aprovado' : '⏳ Pendente'}
              </span>
            </td>
            <td>${this.formatDate(user.createdAt)}</td>
            <td>
              <div class="action-buttons" style="display: flex; gap: 5px; justify-content: flex-end;">
                ${user.type === 'admin' && !user.approved ? `
                  <button class="ghost success" onclick="adminManager.approveUser('${doc.id}')" title="Aprovar">✅</button>
                  <button class="ghost error" onclick="adminManager.rejectUser('${doc.id}')" title="Rejeitar">❌</button>
                ` : ''}
                <button class="ghost error" onclick="adminManager.deleteUser('${doc.id}')" title="Excluir">🗑️</button>
              </div>
            </td>
          </tr>
        `;
      }).join('');

      const usersTable = document.getElementById('usersTable');
      if (usersTable) {
        usersTable.innerHTML = usersHTML || '<tr><td colspan="6" style="text-align: center;">Nenhum usuário encontrado</td></tr>';
      }

    } catch (error) {
      console.error('❌ Erro ao carregar usuários:', error);
    }
  }

  async loadApprovals() {
    try {
      const pendingSnap = await window.db.collection('users')
        .where('type', '==', 'admin')
        .where('approved', '==', false)
        .get();

      const approvalsHTML = pendingSnap.docs.map(doc => {
        const user = doc.data();
        return `
          <div class="card" style="margin-bottom: 15px;">
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 20px;">
              <div>
                <h4 style="margin: 0 0 8px 0;">${user.name}</h4>
                <p class="muted" style="margin: 0 0 4px 0; font-size: 0.9rem;">
                  📧 ${user.email}
                  ${user.whatsapp ? ` • 📱 ${user.whatsapp}` : ''}
                </p>
                <small class="muted" style="font-size: 0.85rem;">Registrado em: ${this.formatDate(user.createdAt)}</small>
              </div>
              <div class="action-buttons" style="display: flex; gap: 8px;">
                <button class="btn success" onclick="adminManager.approveUser('${doc.id}')">
                  ✅ Aprovar
                </button>
                <button class="ghost error" onclick="adminManager.rejectUser('${doc.id}')">
                  ❌ Rejeitar
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('');

      const approvalsList = document.getElementById('approvalsList');
      if (approvalsList) {
        approvalsList.innerHTML = approvalsHTML || '<p class="muted">Nenhuma aprovação pendente</p>';
      }

    } catch (error) {
      console.error('❌ Erro ao carregar aprovações:', error);
    }
  }

  setupEventListeners() {
    console.log('🔧 Configurando event listeners...');
    
    const productForm = document.getElementById('productForm');
    if (productForm) {
      productForm.addEventListener('submit', (e) => this.handleAddProduct(e));
      console.log('✅ Formulário de produtos configurado');
    }

    const companySettings = document.getElementById('companySettings');
    if (companySettings) {
      companySettings.addEventListener('submit', (e) => this.saveCompanySettings(e));
    }
  }

  async handleAddProduct(event) {
    event.preventDefault();
    console.log('➕ Adicionando produto...');
    
    const title = document.getElementById('productTitle').value;
    const price = parseInt(document.getElementById('productPrice').value);
    const description = document.getElementById('productDescription').value;
    const category = document.getElementById('productCategory').value;

    if (!title || !price || !category) {
      showError('Preencha todos os campos obrigatórios');
      return;
    }

    const imageUrl = this.getDefaultImage(category);
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;

    try {
      submitBtn.innerHTML = '⏳ Adicionando...';
      submitBtn.disabled = true;

      await window.db.collection('products').add({
        title,
        price,
        description,
        category,
        image: imageUrl,
        status: 'active',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      showSuccess('✅ Produto adicionado com sucesso!');
      
      event.target.reset();
      await Promise.all([
        this.loadProducts(),
        this.loadStats()
      ]);

    } catch (error) {
      console.error('❌ Erro:', error);
      showError('Erro ao adicionar produto: ' + error.message);
    } finally {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }
  }

  getDefaultImage(category) {
    const images = {
      'electronics': 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400',
      'accessories': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
      'home': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
      'fashion': 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400',
      'books': 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400',
      'other': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'
    };
    return images[category] || images.other;
  }

  showAdminTab(tabName) {
    console.log('📑 Mudando para aba:', tabName);
    
    document.querySelectorAll('.tab-panel').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.admin-tab').forEach(tab => tab.classList.remove('active'));

    const tabEl = document.getElementById(tabName + 'Tab');
    const tabBtn = document.querySelector(`.admin-tab[onclick*="${tabName}"]`);
    
    if (tabEl) tabEl.classList.add('active');
    if (tabBtn) tabBtn.classList.add('active');

    this.currentTab = tabName;
  }

  async updateOrderStatus(orderId, newStatus) {
    try {
      await window.db.collection('orders').doc(orderId).update({
        status: newStatus,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      showSuccess(`Status atualizado: ${this.getStatusText(newStatus)}`);
      await this.loadOrders();

    } catch (error) {
      console.error('Erro:', error);
      showError('Erro ao atualizar status');
    }
  }

  async approveUser(userId) {
    if (!confirm('Aprovar este usuário como administrador?')) return;

    try {
      await window.db.collection('users').doc(userId).update({
        approved: true,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      showSuccess('✅ Usuário aprovado!');
      
      await Promise.all([
        this.loadUsers(),
        this.loadApprovals(),
        this.loadStats()
      ]);

    } catch (error) {
      console.error('Erro:', error);
      showError('Erro ao aprovar usuário');
    }
  }

  async rejectUser(userId) {
    if (!confirm('Rejeitar este usuário? Ele será removido.')) return;

    try {
      await window.db.collection('users').doc(userId).delete();
      
      showSuccess('Usuário rejeitado e removido');
      
      await Promise.all([
        this.loadUsers(),
        this.loadApprovals(),
        this.loadStats()
      ]);

    } catch (error) {
      console.error('Erro:', error);
      showError('Erro ao rejeitar usuário');
    }
  }

  deleteProduct(productId) {
    if (!confirm('Excluir este produto?')) return;
    
    window.db.collection('products').doc(productId).update({
      status: 'inactive'
    }).then(() => {
      showSuccess('Produto removido');
      this.loadProducts();
      this.loadStats();
    }).catch(err => showError('Erro ao remover'));
  }

  editProduct(productId) {
    showInfo('Edição de produto em desenvolvimento');
  }

  viewOrderDetails(orderId) {
    showInfo('Visualização de detalhes em desenvolvimento');
  }

  deleteUser(userId) {
    showWarning('Exclusão de usuário em desenvolvimento');
  }

  async saveCompanySettings(e) {
    e.preventDefault();
    showSuccess('Configurações salvas!');
  }

  exportData() {
    showInfo('Exportação em desenvolvimento');
  }

  clearAllData() {
    if (!confirm('⚠️ PERIGO! Apagar TODOS os dados?')) return;
    showWarning('Funcionalidade em desenvolvimento');
  }

  resetSystem() {
    if (!confirm('🔄 Resetar sistema?')) return;
    showWarning('Funcionalidade em desenvolvimento');
  }

  getCategoryName(category) {
    const cats = {
      'electronics': 'Eletrónicos',
      'accessories': 'Acessórios',
      'home': 'Casa',
      'fashion': 'Moda',
      'books': 'Livros',
      'other': 'Outros'
    };
    return cats[category] || category;
  }

  getStatusText(status) {
    const statuses = {
      'pending': 'Pendente',
      'processing': 'Processando',
      'completed': 'Concluído',
      'cancelled': 'Cancelado'
    };
    return statuses[status] || status;
  }

  formatDate(timestamp) {
    if (!timestamp) return 'N/A';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('pt-MZ');
    } catch {
      return 'Data inválida';
    }
  }
}

// Inicializar
let adminManager;

document.addEventListener('DOMContentLoaded', async function() {
  console.log('📄 DOM carregado - inicializando admin...');
  try {
    adminManager = new AdminManager();
    window.adminManager = adminManager;
  } catch (error) {
    console.error('❌ Erro fatal:', error);
    alert('Erro ao carregar painel: ' + error.message);
  }
});

console.log('✅ Admin.js carregado');