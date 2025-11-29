// migration.js - Script de migração de dados
class DataMigration {
  constructor() {
    this.localData = this.loadLocalData();
    this.init();
  }

  init() {
    this.displayDataPreview();
    this.updateStats();
  }

  loadLocalData() {
    return {
      products: JSON.parse(localStorage.getItem('gm_products') || '[]'),
      orders: JSON.parse(localStorage.getItem('gm_orders') || '[]'),
      users: JSON.parse(localStorage.getItem('gm_users') || '[]')
    };
  }

  displayDataPreview() {
    // Produtos
    const productsPreview = document.getElementById('productsPreview');
    productsPreview.textContent = JSON.stringify(this.localData.products.slice(0, 3), null, 2);
    if (this.localData.products.length > 3) {
      productsPreview.textContent += `\n... e mais ${this.localData.products.length - 3} produtos`;
    }

    // Pedidos
    const ordersPreview = document.getElementById('ordersPreview');
    ordersPreview.textContent = JSON.stringify(this.localData.orders.slice(0, 3), null, 2);
    if (this.localData.orders.length > 3) {
      ordersPreview.textContent += `\n... e mais ${this.localData.orders.length - 3} pedidos`;
    }
  }

  updateStats() {
    document.getElementById('productsCount').textContent = this.localData.products.length;
    document.getElementById('ordersCount').textContent = this.localData.orders.length;
    document.getElementById('usersCount').textContent = this.localData.users.length;
  }

  async migrateProducts() {
    const btn = document.getElementById('migrateProductsBtn');
    const originalText = btn.innerHTML;
    
    try {
      btn.innerHTML = '⏳ Migrando...';
      btn.disabled = true;

      let migratedCount = 0;

      for (const product of this.localData.products) {
        // Gerar ID consistente ou usar timestamp
        const productId = product.id ? product.id.toString() : `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        await db.collection('products').doc(productId).set({
          title: product.title,
          price: product.price,
          image: product.img || product.image,
          category: product.category || 'other',
          description: product.description || '',
          status: 'active',
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
          migrated: true
        });

        migratedCount++;
        this.updateStatus(`✅ Produto ${migratedCount}/${this.localData.products.length} migrado`);
      }

      this.updateStatus(`🎉 Migração completa! ${migratedCount} produtos migrados para o Firestore.`, 'success');
      
      // Atualizar localStorage para marcar como migrado
      localStorage.setItem('gm_products_migrated', 'true');
      
    } catch (error) {
      console.error('Erro na migração de produtos:', error);
      this.updateStatus(`❌ Erro na migração: ${error.message}`, 'error');
    } finally {
      btn.innerHTML = originalText;
      btn.disabled = false;
    }
  }

  async migrateOrders() {
    const btn = document.getElementById('migrateOrdersBtn');
    const originalText = btn.innerHTML;
    
    try {
      btn.innerHTML = '⏳ Migrando...';
      btn.disabled = true;

      let migratedCount = 0;

      for (const order of this.localData.orders) {
        const orderId = order.id ? order.id.toString() : `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Tentar encontrar userId baseado no email/whatsapp
        let userId = 'anonymous';
        if (order.email) {
          const userQuery = await db.collection('users')
            .where('email', '==', order.email)
            .limit(1)
            .get();
          
          if (!userQuery.empty) {
            userId = userQuery.docs[0].id;
          }
        }

        await db.collection('orders').doc(orderId).set({
          userId: userId,
          customerName: order.nome,
          customerEmail: order.email,
          customerWhatsApp: order.whatsapp,
          service: order.servico,
          details: order.detalhes,
          amount: this.estimateServicePrice(order.servico),
          status: order.status || 'pending',
          createdAt: order.created ? new Date(order.created) : firebase.firestore.FieldValue.serverTimestamp(),
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
          migrated: true,
          source: 'localStorage_migration'
        });

        migratedCount++;
        this.updateStatus(`✅ Pedido ${migratedCount}/${this.localData.orders.length} migrado`);
      }

      this.updateStatus(`🎉 Migração completa! ${migratedCount} pedidos migrados para o Firestore.`, 'success');
      
      // Atualizar localStorage para marcar como migrado
      localStorage.setItem('gm_orders_migrated', 'true');
      
    } catch (error) {
      console.error('Erro na migração de pedidos:', error);
      this.updateStatus(`❌ Erro na migração: ${error.message}`, 'error');
    } finally {
      btn.innerHTML = originalText;
      btn.disabled = false;
    }
  }

  estimateServicePrice(serviceName) {
    const prices = {
      'Criação de Imagens com IA': 125,
      'Criação de Currículos': 250,
      'Criação de Sites': 1500,
      'Criação de Sites com IA (rápido)': 1500,
      'Criação de Logos': 725,
      'Assistente Virtual': 300,
      'Suporte Técnico Remoto': 350,
      'Resumos Académicos': 200
    };
    return prices[serviceName] || 0;
  }

  async createAdminUser() {
    const btn = document.getElementById('createAdminBtn');
    const originalText = btn.innerHTML;
    
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;
    const name = document.getElementById('adminName').value;

    if (!email || !password || !name) {
      this.updateStatus('❌ Preencha todos os campos', 'error');
      return;
    }

    try {
      btn.innerHTML = '⏳ Criando...';
      btn.disabled = true;

      // Criar usuário no Authentication
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;

      // Salvar dados no Firestore
      await db.collection('users').doc(user.uid).set({
        name: name,
        email: email,
        type: 'admin',
        approved: true,
        isSuperAdmin: true,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      this.updateStatus(`✅ Admin principal criado com sucesso! 
        Email: ${email}
        Senha: ${password}
        👑 Este usuário tem acesso total ao sistema.`, 'success');

    } catch (error) {
      console.error('Erro ao criar admin:', error);
      this.updateStatus(`❌ Erro ao criar admin: ${error.message}`, 'error');
    } finally {
      btn.innerHTML = originalText;
      btn.disabled = false;
    }
  }

  updateStatus(message, type = 'info') {
    const statusEl = document.getElementById('migrationStatus');
    statusEl.innerHTML = `<div class="toast ${type}">${message}</div>`;
    statusEl.querySelector('.toast').classList.add('show');
    
    // Scroll para a mensagem
    statusEl.scrollIntoView({ behavior: 'smooth' });
  }
}

// Inicializar migração
let dataMigration;

document.addEventListener('DOMContentLoaded', function() {
  dataMigration = new DataMigration();
});

// Funções globais
async function migrateProducts() {
  if (dataMigration) {
    await dataMigration.migrateProducts();
  }
}

async function migrateOrders() {
  if (dataMigration) {
    await dataMigration.migrateOrders();
  }
}

async function createAdminUser() {
  if (dataMigration) {
    await dataMigration.createAdminUser();
  }
}


window.migrateProducts = migrateProducts;
window.migrateOrders = migrateOrders;
window.createAdminUser = createAdminUser;