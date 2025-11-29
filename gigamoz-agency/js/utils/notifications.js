// js/utils/notifications.js - Sistema completo de notificações
console.log('🔔 Carregando sistema de notificações...');

class NotificationManager {
  constructor() {
    this.container = null;
    this.notifications = new Map();
    this.init();
  }
  
  init() {
    this.createContainer();
  }
  
  createContainer() {
    this.container = document.getElementById('toastContainer');
    
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'toastContainer';
      this.container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-width: 400px;
      `;
      document.body.appendChild(this.container);
    }
  }
  
  show(message, type = 'info', duration = 5000) {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    
    const toast = document.createElement('div');
    toast.id = id;
    toast.className = `toast ${type}`;
    toast.style.cssText = `
      background: var(--card);
      padding: 12px 16px;
      border-radius: 8px;
      border: 1px solid var(--border);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      transform: translateX(100%);
      opacity: 0;
      transition: all 0.3s ease;
      max-width: 400px;
    `;
    
    // Adicionar borda colorida baseada no tipo
    const borderColors = {
      'success': '#10b981',
      'error': '#ef4444', 
      'warning': '#f59e0b',
      'info': '#06b6d4'
    };
    
    toast.style.borderLeft = `4px solid ${borderColors[type] || borderColors.info}`;
    
    toast.innerHTML = `
      <span style="flex: 1;">${message}</span>
      <button class="toast-close" onclick="notificationManager.remove('${id}')" 
              style="background: none; border: none; color: var(--muted); cursor: pointer; font-size: 18px; padding: 0; margin: 0;">
        ×
      </button>
    `;
    
    this.container.appendChild(toast);
    this.notifications.set(id, toast);
    
    // Animação de entrada
    setTimeout(() => {
      toast.style.transform = 'translateX(0)';
      toast.style.opacity = '1';
    }, 100);
    
    // Auto-remover se duration for definida
    if (duration > 0) {
      const timeout = setTimeout(() => {
        this.remove(id);
      }, duration);
      
      // Guardar timeout para poder cancelar se necessário
      toast._timeout = timeout;
    }
    
    return id;
  }
  
  remove(id) {
    const toast = this.notifications.get(id);
    if (toast) {
      // Limpar timeout se existir
      if (toast._timeout) {
        clearTimeout(toast._timeout);
      }
      
      // Animação de saída
      toast.style.transform = 'translateX(100%)';
      toast.style.opacity = '0';
      
      // Remover do DOM após animação
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
        this.notifications.delete(id);
      }, 300);
    }
  }
  
  success(message, duration = 5000) {
    return this.show(message, 'success', duration);
  }
  
  error(message, duration = 5000) {
    return this.show(message, 'error', duration);
  }
  
  warning(message, duration = 5000) {
    return this.show(message, 'warning', duration);
  }
  
  info(message, duration = 5000) {
    return this.show(message, 'info', duration);
  }
  
  clearAll() {
    this.notifications.forEach((toast, id) => {
      this.remove(id);
    });
  }
}

// Inicializar notification manager
const notificationManager = new NotificationManager();

// Função global showToast
function showToast(message, type = 'info', duration = 5000) {
  return notificationManager.show(message, type, duration);
}

// Funções de conveniência
function showSuccess(message, duration = 5000) {
  return notificationManager.success(message, duration);
}

function showError(message, duration = 5000) {
  return notificationManager.error(message, duration);
}

function showWarning(message, duration = 5000) {
  return notificationManager.warning(message, duration);
}

function showInfo(message, duration = 5000) {
  return notificationManager.info(message, duration);
}

// Exportar para uso global
window.notificationManager = notificationManager;
window.showToast = showToast;
window.showSuccess = showSuccess;
window.showError = showError;
window.showWarning = showWarning;
window.showInfo = showInfo;

console.log('✅ Sistema de notificações carregado');