// cart.js - Sistema de carrinho de compras (CORRIGIDO)
console.log('🛒 Carregando sistema de carrinho...');

class CartManager {
  constructor() {
    this.cart = [];
    this.init();
  }

  init() {
    this.loadCart();
    this.updateUI();
    
    // Verificar se está no contexto correto
    console.log('✅ CartManager inicializado', window.location.pathname);
  }

  loadCart() {
    try {
      const saved = localStorage.getItem('gm_cart');
      this.cart = saved ? JSON.parse(saved) : [];
      console.log('✅ Carrinho carregado:', this.cart.length, 'itens');
    } catch (error) {
      console.error('❌ Erro ao carregar carrinho:', error);
      this.cart = [];
    }
  }

  saveCart() {
    try {
      localStorage.setItem('gm_cart', JSON.stringify(this.cart));
    } catch (error) {
      console.error('❌ Erro ao salvar carrinho:', error);
    }
  }

  addItem(title, price, productId = null) {
    // Verificar se item já existe
    const existingIndex = this.cart.findIndex(item => item.title === title);
    
    if (existingIndex >= 0) {
      // Incrementar quantidade
      this.cart[existingIndex].quantity++;
      showSuccess(`Quantidade atualizada: ${title}`);
    } else {
      // Adicionar novo item
      this.cart.push({
        id: productId || 'item-' + Date.now(),
        title: title,
        price: price,
        quantity: 1,
        addedAt: new Date().toISOString()
      });
      showSuccess(`✅ ${title} adicionado ao carrinho!`);
    }

    this.saveCart();
    this.updateUI();
    
    return true;
  }

  removeItem(index) {
    if (index >= 0 && index < this.cart.length) {
      const item = this.cart[index];
      this.cart.splice(index, 1);
      this.saveCart();
      this.updateUI();
      showInfo(`${item.title} removido do carrinho`);
    }
  }

  updateQuantity(index, quantity) {
    if (index >= 0 && index < this.cart.length) {
      if (quantity <= 0) {
        this.removeItem(index);
      } else {
        this.cart[index].quantity = quantity;
        this.saveCart();
        this.updateUI();
      }
    }
  }

  clearCart() {
    if (this.cart.length === 0) {
      showWarning('Carrinho já está vazio');
      return;
    }

    if (confirm('🗑️ Limpar todo o carrinho?')) {
      this.cart = [];
      this.saveCart();
      this.updateUI();
      showSuccess('Carrinho limpo!');
    }
  }

  getTotal() {
    return this.cart.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  }

  getItemCount() {
    return this.cart.reduce((count, item) => count + item.quantity, 0);
  }

  updateUI() {
    // Atualizar contador
    const countElements = document.querySelectorAll('#cartCount, .cart-badge');
    countElements.forEach(el => {
      const count = this.getItemCount();
      el.textContent = count;
      if (el.classList.contains('cart-badge')) {
        el.setAttribute('data-count', count);
      }
    });

    // Atualizar total
    const totalElements = document.querySelectorAll('#cartTotal');
    totalElements.forEach(el => {
      el.textContent = this.getTotal() + ' MT';
    });

    // Atualizar visualização do carrinho se existir
    this.renderCart();
  }

  renderCart() {
    const cartContainer = document.getElementById('cartItemsList');
    if (!cartContainer) return;

    if (this.cart.length === 0) {
      cartContainer.innerHTML = `
        <div style="text-align: center; padding: 40px;">
          <div style="font-size: 48px; margin-bottom: 16px;">🛒</div>
          <h3>Carrinho vazio</h3>
          <p class="muted">Adicione produtos para começar</p>
        </div>
      `;
      return;
    }

    const cartHTML = this.cart.map((item, index) => `
      <div class="cart-item" style="background: var(--card); padding: 16px; border-radius: 10px; border: 1px solid var(--border); margin-bottom: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: start; gap: 12px;">
          <div style="flex: 1;">
            <strong>${item.title}</strong>
            <div class="muted" style="margin-top: 4px;">
              ${item.price} MT × ${item.quantity} = <strong>${item.price * item.quantity} MT</strong>
            </div>
          </div>
          <div style="display: flex; gap: 8px; align-items: center;">
            <button class="ghost" onclick="cartManager.updateQuantity(${index}, ${item.quantity - 1})" 
                    style="padding: 4px 8px; font-size: 1.2rem;">-</button>
            <span style="min-width: 30px; text-align: center;">${item.quantity}</span>
            <button class="ghost" onclick="cartManager.updateQuantity(${index}, ${item.quantity + 1})" 
                    style="padding: 4px 8px; font-size: 1.2rem;">+</button>
            <button class="ghost error" onclick="cartManager.removeItem(${index})" 
                    style="padding: 4px 8px;">🗑️</button>
          </div>
        </div>
      </div>
    `).join('');

    cartContainer.innerHTML = `
      ${cartHTML}
      <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--border);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <strong style="font-size: 1.2rem;">Total:</strong>
          <strong style="font-size: 1.4rem; color: var(--accent);">${this.getTotal()} MT</strong>
        </div>
        <div style="display: flex; gap: 10px;">
          <button class="btn" onclick="cartManager.proceedToCheckout()" style="flex: 1;">
            ✅ Finalizar Compra
          </button>
          <button class="ghost error" onclick="cartManager.clearCart()">
            🗑️ Limpar
          </button>
        </div>
      </div>
    `;
  }

  async proceedToCheckout() {
    if (this.cart.length === 0) {
      showWarning('Carrinho vazio!');
      return;
    }

    // Verificar se usuário está logado
    if (!window.authManager || !window.authManager.isLoggedIn()) {
      showInfo('Por favor, faça login para continuar');
      
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 2000);
      return;
    }

    // Criar pedido no Firestore
    try {
      const orderData = {
        userId: window.authManager.currentUser.uid,
        customerName: window.authManager.userData.name,
        customerEmail: window.authManager.userData.email,
        customerWhatsApp: window.authManager.userData.whatsapp || '',
        items: this.cart,
        totalAmount: this.getTotal(),
        itemCount: this.getItemCount(),
        status: 'pending',
        type: 'marketplace',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      };

      const orderRef = await window.db.collection('orders').add(orderData);
      
      console.log('✅ Pedido criado:', orderRef.id);
      
      // Limpar carrinho
      this.cart = [];
      this.saveCart();
      this.updateUI();

      showSuccess('✅ Pedido realizado com sucesso!');
      
      // Redirecionar para dashboard
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 2000);

    } catch (error) {
      console.error('❌ Erro ao criar pedido:', error);
      showError('Erro ao finalizar compra. Tente novamente.');
    }
  }

  // Modal do carrinho
  showCartModal() {
    // Criar modal se não existir
    let modal = document.getElementById('cartModal');
    
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'cartModal';
      modal.className = 'modal-back';
      modal.innerHTML = `
        <div class="modal" style="max-width: 600px;">
          <div class="modal-header">
            <h3>🛒 Meu Carrinho</h3>
            <button class="ghost" onclick="cartManager.hideCartModal()">✕ Fechar</button>
          </div>
          <div id="cartItemsList" style="max-height: 400px; overflow-y: auto;">
            <!-- Items serão renderizados aqui -->
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }

    this.renderCart();
    modal.style.display = 'flex';
  }

  hideCartModal() {
    const modal = document.getElementById('cartModal');
    if (modal) {
      modal.style.display = 'none';
    }
  }
}

// Inicializar cart manager
const cartManager = new CartManager();

// Função global para adicionar ao carrinho
function addToCart(title, price, productId) {
  if (cartManager) {
    return cartManager.addItem(title, price, productId);
  } else {
    console.error('CartManager não disponível');
    return false;
  }
}

// Função global para mostrar carrinho
function showCart() {
  if (cartManager) {
    cartManager.showCartModal();
  } else {
    console.error('CartManager não disponível');
  }
}

// Função global para checkout
function checkout() {
  if (cartManager) {
    cartManager.proceedToCheckout();
  } else {
    console.error('CartManager não disponível');
  }
}

// Event listener para botão de pedidos
document.addEventListener('DOMContentLoaded', function() {
  const orderBtn = document.getElementById('orderBtn');
  if (orderBtn) {
    orderBtn.addEventListener('click', () => {
      showCart();
    });
  }
});

// Exportar para window
window.cartManager = cartManager;
window.addToCart = addToCart;
window.showCart = showCart;
window.checkout = checkout;

console.log('✅ Sistema de carrinho carregado');