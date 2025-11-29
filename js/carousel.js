// carousel.js - Sistema de carrossel de produtos
console.log('🎠 Carregando sistema de carrossel...');

class CarouselManager {
  constructor() {
    this.track = null;
    this.prevBtn = null;
    this.nextBtn = null;
    this.scrollPosition = 0;
    this.autoScrollInterval = null;
    this.init();
  }

  init() {
    // Aguardar DOM estar pronto
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  setup() {
    this.track = document.getElementById('carouselTrack');
    this.prevBtn = document.getElementById('prev');
    this.nextBtn = document.getElementById('next');

    if (!this.track) {
      console.log('⚠️ Carrossel não encontrado nesta página');
      return;
    }

    console.log('✅ Carrossel encontrado, configurando...');
    
    this.setupButtons();
    this.setupTouchSupport();
    this.startAutoScroll();
    
    // Adicionar indicadores de navegação
    this.addScrollIndicators();
  }

  setupButtons() {
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => this.scrollPrev());
    }

    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => this.scrollNext());
    }
  }

  setupTouchSupport() {
    if (!this.track) return;

    let startX = 0;
    let currentX = 0;
    let isDragging = false;

    this.track.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      isDragging = true;
      this.stopAutoScroll();
    });

    this.track.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      currentX = e.touches[0].clientX;
    });

    this.track.addEventListener('touchend', () => {
      if (!isDragging) return;
      
      const diff = startX - currentX;
      
      if (Math.abs(diff) > 50) { // Mínimo de 50px para considerar swipe
        if (diff > 0) {
          this.scrollNext();
        } else {
          this.scrollPrev();
        }
      }
      
      isDragging = false;
      this.startAutoScroll();
    });

    // Suporte para mouse drag
    let isMouseDragging = false;
    let startMouseX = 0;

    this.track.addEventListener('mousedown', (e) => {
      startMouseX = e.clientX;
      isMouseDragging = true;
      this.track.style.cursor = 'grabbing';
      this.stopAutoScroll();
    });

    document.addEventListener('mousemove', (e) => {
      if (!isMouseDragging) return;
      currentX = e.clientX;
    });

    document.addEventListener('mouseup', () => {
      if (!isMouseDragging) return;
      
      const diff = startMouseX - currentX;
      
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          this.scrollNext();
        } else {
          this.scrollPrev();
        }
      }
      
      isMouseDragging = false;
      if (this.track) {
        this.track.style.cursor = 'grab';
      }
      this.startAutoScroll();
    });

    // Cursor grab
    this.track.style.cursor = 'grab';
  }

  scrollNext() {
    if (!this.track) return;

    const productWidth = this.track.firstElementChild?.offsetWidth || 220;
    const gap = 12; // Gap entre produtos
    const scrollAmount = productWidth + gap;

    this.track.scrollBy({
      left: scrollAmount,
      behavior: 'smooth'
    });

    this.updateButtons();
  }

  scrollPrev() {
    if (!this.track) return;

    const productWidth = this.track.firstElementChild?.offsetWidth || 220;
    const gap = 12;
    const scrollAmount = productWidth + gap;

    this.track.scrollBy({
      left: -scrollAmount,
      behavior: 'smooth'
    });

    this.updateButtons();
  }

  updateButtons() {
    if (!this.track || !this.prevBtn || !this.nextBtn) return;

    const isAtStart = this.track.scrollLeft <= 0;
    const isAtEnd = this.track.scrollLeft >= (this.track.scrollWidth - this.track.clientWidth - 10);

    // Desabilitar botões nas extremidades
    if (this.prevBtn) {
      this.prevBtn.disabled = isAtStart;
      this.prevBtn.style.opacity = isAtStart ? '0.3' : '1';
    }

    if (this.nextBtn) {
      this.nextBtn.disabled = isAtEnd;
      this.nextBtn.style.opacity = isAtEnd ? '0.3' : '1';
    }
  }

  addScrollIndicators() {
    if (!this.track) return;

    this.track.addEventListener('scroll', () => {
      this.updateButtons();
    });

    // Atualizar inicialmente
    setTimeout(() => this.updateButtons(), 500);
  }

  startAutoScroll() {
    // Auto-scroll a cada 5 segundos
    this.stopAutoScroll();
    
    this.autoScrollInterval = setInterval(() => {
      if (!this.track) return;

      const isAtEnd = this.track.scrollLeft >= (this.track.scrollWidth - this.track.clientWidth - 10);
      
      if (isAtEnd) {
        // Voltar ao início
        this.track.scrollTo({
          left: 0,
          behavior: 'smooth'
        });
      } else {
        this.scrollNext();
      }
    }, 5000);
  }

  stopAutoScroll() {
    if (this.autoScrollInterval) {
      clearInterval(this.autoScrollInterval);
      this.autoScrollInterval = null;
    }
  }

  // Parar auto-scroll quando usuário interagir
  pauseOnHover() {
    if (!this.track) return;

    this.track.addEventListener('mouseenter', () => {
      this.stopAutoScroll();
    });

    this.track.addEventListener('mouseleave', () => {
      this.startAutoScroll();
    });
  }

  destroy() {
    this.stopAutoScroll();
    
    if (this.track) {
      this.track.style.cursor = '';
    }
  }
}

// Inicializar carrossel
const carouselManager = new CarouselManager();

// Pausar auto-scroll ao passar mouse
carouselManager.pauseOnHover();

// Exportar para window
window.carouselManager = carouselManager;

console.log('✅ Sistema de carrossel carregado');