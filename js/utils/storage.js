// utils/storage.js
console.log('💾 Carregando storage utils...');

const storageUtils = {
  // Get item
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Erro ao ler storage:', error);
      return defaultValue;
    }
  },

  // Set item
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Erro ao salvar storage:', error);
      return false;
    }
  },

  // Remove item
  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Erro ao remover storage:', error);
      return false;
    }
  },

  // Clear all
  clear() {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Erro ao limpar storage:', error);
      return false;
    }
  }
};

window.storageUtils = storageUtils;
console.log('✅ Storage utils carregados');