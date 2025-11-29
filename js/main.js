// main.js - Script principal de inicialização (CORRIGIDO)
console.log('🚀 Iniciando aplicação GigaMoz...');

// Verificar se todos os serviços estão disponíveis
async function checkServices() {
  const checks = {
    firebase: !!window.firebase,
    auth: !!window.auth,
    db: !!window.db,
    authManager: !!window.authManager,
    notificationManager: !!window.notificationManager,
    cartManager: !!window.cartManager,
    productManagerFB: !!window.productManagerFB
  };

  console.log('📊 Status dos serviços:', checks);

  const allReady = Object.values(checks).every(v => v);
  
  if (allReady) {
    console.log('✅ Todos os serviços prontos!');
  } else {
    console.warn('⚠️ Alguns serviços não estão disponíveis:', checks);
  }

  return allReady;
}

// Inicialização quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', async function() {
  console.log('📄 DOM carregado');

  // Aguardar serviços estarem prontos
  await checkServices();

  // Configurar animações de scroll
  setupScrollAnimations();

  // Mobile menu
  setupMobileMenu();

  // Verificar se estamos na página inicial e configurar carrinho
  if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
    setupCartFunctionality();
  }

  console.log('✅ Aplicação inicializada');
});

function setupScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  document.querySelectorAll('.fade-up').forEach(el => {
    observer.observe(el);
  });
}

function setupMobileMenu() {
  const btn = document.getElementById('mobileMenuBtn');
  const nav = document.querySelector('.nav-hide');

  if (btn && nav) {
    btn.addEventListener('click', () => {
      btn.classList.toggle('active');
      nav.classList.toggle('active');
    });

    // Fechar ao clicar em link
    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        btn.classList.remove('active');
        nav.classList.remove('active');
      });
    });
  }
}

function setupCartFunctionality() {
  // Garantir que as funções do carrinho estejam disponíveis
  if (!window.addToCart) {
    window.addToCart = function(title, price, productId) {
      console.warn('addToCart fallback usado:', title, price);
      showSuccess(`${title} adicionado ao carrinho!`);
    };
  }

  if (!window.showCart) {
    window.showCart = function() {
      showInfo('Funcionalidade do carrinho em desenvolvimento');
    };
  }

  if (!window.checkout) {
    window.checkout = function() {
      showInfo('Funcionalidade de checkout em desenvolvimento');
    };
  }
}

console.log('✅ Main.js carregado');