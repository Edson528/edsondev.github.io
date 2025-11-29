// products-firebase.js - Sistema completo de produtos com Firebase (CORRIGIDO)
console.log('🛍️ Carregando sistema de produtos...');

class ProductManagerFirebase {
  constructor() {
    this.products = [];
    this.loading = false;
    this.init();
  }

  async init() {
    await window.waitForFirebase();
    await this.loadProducts();
    
    // Escutar mudanças em tempo real
    this.setupRealtimeListener();
  }

  setupRealtimeListener() {
    window.db.collection('products')
      .where('status', '==', 'active')
      .onSnapshot((snapshot) => {
        console.log('🔄 Produtos atualizados em tempo real');
        
        this.products = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        this.renderMarketplace();
        this.renderCarousel();
      }, (error) => {
        console.error('❌ Erro no listener de produtos:', error);
      });
  }

  async loadProducts() {
    if (this.loading) return;
    
    try {
      this.loading = true;
      console.log('📦 Carregando produtos do Firestore...');
      
      const productsSnapshot = await window.db.collection('products')
        .where('status', '==', 'active')
        .orderBy('createdAt', 'desc')
        .get();

      this.products = productsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log(`✅ ${this.products.length} produtos carregados`);
      
      this.renderMarketplace();
      this.renderCarousel();

      return this.products;

    } catch (error) {
      console.error('❌ Erro ao carregar produtos:', error);
      
      // Se falhar, usar produtos demo
      this.products = this.getDemoProducts();
      this.renderMarketplace();
      this.renderCarousel();
      
      showWarning('⚠️ Usando produtos demonstrativos');
      
      return this.products;
      
    } finally {
      this.loading = false;
    }
  }

  getDemoProducts() {
    return [
      {
        id: 'demo-1',
        title: 'Headphones Premium X',
        price: 1850,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop',
        category: 'electronics',
        description: 'Headphones de alta qualidade com cancelamento de ruído e som surround 7.1'
      },
      {
        id: 'demo-2',
        title: 'Powerbank 10000mAh',
        price: 950,
        image: 'https://images.unsplash.com/photo-1609592760973-8c7b9b0f0e0e?w=400&h=300&fit=crop',
        category: 'electronics',
        description: 'Powerbank portátil ultra-rápido com 2 portas USB e carregamento wireless'
      },
      {
        id: 'demo-3',
        title: 'Smart Watch Pro',
        price: 2200,
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop',
        category: 'electronics',
        description: 'Relógio inteligente com monitor cardíaco, GPS e resistência à água'
      },
      {
        id: 'demo-4',
        title: 'Mochila Executiva',
        price: 1200,
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop',
        category: 'accessories',
        description: 'Mochila profissional com compartimento para laptop e carregador USB integrado'
      }
    ];
  }

  renderMarketplace() {
    const grid = document.getElementById('marketGrid');
    if (!grid) return;

    if (this.products.length === 0) {
      grid.innerHTML = `
        <div class="card" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
          <div style="font-size: 48px; margin-bottom: 16px;">🛒</div>
          <h3>Nenhum produto disponível</h3>
          <p class="muted">Novos produtos serão adicionados em breve!</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = this.products.map(product => `
      <div class="card fade-up" data-product-id="${product.id}">
        <img src="${product.image}" 
             alt="${this.escapeHtml(product.title)}" 
             loading="lazy"
             style="width:100%; height:180px; object-fit:cover; border-radius:10px; margin-bottom:12px;"
             onerror="this.src='https://via.placeholder.com/400x300?text=Produto'">
        <h3>${this.escapeHtml(product.title)}</h3>
        <p class="muted" style="flex-grow: 1;">${this.escapeHtml(product.description || 'Produto de qualidade')}</p>
        <div style="margin-top: auto; padding-top: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <strong style="font-size: 1.2rem; color: var(--accent);">${product.price} MT</strong>
            <span class="muted" style="font-size: 0.85rem;">${this.getCategoryName(product.category)}</span>
          </div>
          <button class="btn add-to-cart-btn" 
                  data-title="${this.escapeHtml(product.title)}" 
                  data-price="${product.price}"
                  data-id="${product.id}"
                  style="width: 100%;">
            🛒 Comprar Agora
          </button>
        </div>
      </div>
    `).join('');

    // Adicionar event listeners aos botões
    this.setupAddToCartButtons();

    // Animação de entrada
    setTimeout(() => {
      grid.querySelectorAll('.fade-up').forEach((el, i) => {
        setTimeout(() => el.classList.add('show'), i * 100);
      });
    }, 100);
  }

  renderCarousel() {
    const track = document.getElementById('carouselTrack');
    if (!track) return;

    const carouselProducts = this.products.slice(0, 6);
    
    if (carouselProducts.length === 0) {
      track.innerHTML = `
        <div class="product">
          <div style="text-align: center; padding: 20px;">
            <div style="font-size: 48px; margin-bottom: 16px;">📱</div>
            <p class="muted">Produtos em breve</p>
          </div>
        </div>
      `;
      return;
    }

    track.innerHTML = carouselProducts.map(product => `
      <div class="product" data-product-id="${product.id}">
        <img src="${product.image}" 
             alt="${this.escapeHtml(product.title)}"
             loading="lazy"
             style="width:100%; height:140px; object-fit:cover; border-radius:8px; margin-bottom: 8px;"
             onerror="this.src='https://via.placeholder.com/400x300?text=Produto'">
        <strong style="display: block; margin-bottom: 4px; font-size: 0.95rem;">
          ${this.truncateText(product.title, 30)}
        </strong>
        <div class="muted" style="font-size: 1.1rem; font-weight: 600; color: var(--accent); margin-bottom: 8px;">
          ${product.price} MT
        </div>
        <button class="ghost add-to-cart-btn" 
                data-title="${this.escapeHtml(product.title)}" 
                data-price="${product.price}"
                data-id="${product.id}"
                style="width: 100%; margin-top: auto;">
          🛒 Comprar
        </button>
      </div>
    `).join('');

    // Adicionar event listeners aos botões do carrossel
    this.setupAddToCartButtons();
  }

  setupAddToCartButtons() {
    // Adicionar event listeners a todos os botões de compra
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
      button.addEventListener('click', (e) => {
        const title = e.target.getAttribute('data-title');
        const price = parseInt(e.target.getAttribute('data-price'));
        const id = e.target.getAttribute('data-id');
        
        this.addToCart(title, price, id);
      });
    });
  }

  addToCart(title, price, productId) {
    console.log('🛒 Adicionando ao carrinho:', { title, price, productId });
    
    // Verificar se cartManager existe
    if (window.cartManager && typeof window.cartManager.addItem === 'function') {
      window.cartManager.addItem(title, price, productId);
    } else if (window.addToCart && typeof window.addToCart === 'function') {
      // Usar função global se disponível
      window.addToCart(title, price, productId);
    } else {
      // Fallback básico
      console.warn('CartManager não disponível, usando fallback');
      showSuccess(`${title} adicionado ao carrinho! (${price} MT)`);
      
      // Atualizar contador do carrinho manualmente
      this.updateCartBadge();
    }
  }

  updateCartBadge() {
    const cartBadge = document.querySelector('.cart-badge');
    if (cartBadge) {
      const currentCount = parseInt(cartBadge.getAttribute('data-count') || '0');
      cartBadge.setAttribute('data-count', currentCount + 1);
      cartBadge.textContent = currentCount + 1;
    }
  }

  getCategoryName(category) {
    const categories = {
      'electronics': 'Eletrónicos',
      'accessories': 'Acessórios',
      'home': 'Casa & Decoração',
      'fashion': 'Moda',
      'books': 'Livros & Educação',
      'other': 'Outros'
    };
    return categories[category] || 'Geral';
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  // Método para admin adicionar produto
  async addProduct(productData) {
    try {
      console.log('➕ Adicionando novo produto:', productData);

      const docRef = await window.db.collection('products').add({
        ...productData,
        status: 'active',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      console.log('✅ Produto adicionado com ID:', docRef.id);
      
      showSuccess('✅ Produto adicionado com sucesso!');
      
      // Recarregar produtos
      await this.loadProducts();
      
      return { success: true, id: docRef.id };

    } catch (error) {
      console.error('❌ Erro ao adicionar produto:', error);
      showError('Erro ao adicionar produto: ' + error.message);
      return { success: false, error: error.message };
    }
  }

  // Método para admin atualizar produto
  async updateProduct(productId, productData) {
    try {
      await window.db.collection('products').doc(productId).update({
        ...productData,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      console.log('✅ Produto atualizado');
      showSuccess('✅ Produto atualizado com sucesso!');
      
      await this.loadProducts();
      
      return { success: true };

    } catch (error) {
      console.error('❌ Erro ao atualizar produto:', error);
      showError('Erro ao atualizar produto');
      return { success: false, error: error.message };
    }
  }

  // Método para admin deletar produto
  async deleteProduct(productId) {
    try {
      await window.db.collection('products').doc(productId).update({
        status: 'inactive',
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      console.log('✅ Produto removido');
      showSuccess('✅ Produto removido com sucesso!');
      
      await this.loadProducts();
      
      return { success: true };

    } catch (error) {
      console.error('❌ Erro ao remover produto:', error);
      showError('Erro ao remover produto');
      return { success: false, error: error.message };
    }
  }
}

// Inicializar product manager
let productManagerFB;

document.addEventListener('DOMContentLoaded', async function() {
  console.log('🚀 Inicializando ProductManager...');
  productManagerFB = new ProductManagerFirebase();
});

// Funções globais
function loadProducts() {
  if (productManagerFB) {
    return productManagerFB.loadProducts();
  }
}

function reloadProducts() {
  if (productManagerFB) {
    return productManagerFB.loadProducts();
  }
}

// Exportar para window
window.productManagerFB = productManagerFB;
window.loadProducts = loadProducts;
window.reloadProducts = reloadProducts;

console.log('✅ Sistema de produtos carregado');