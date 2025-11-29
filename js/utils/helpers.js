// utils/helpers.js
console.log('🛠️ Carregando helpers...');

// Formatar data
function formatDate(date) {
  if (!date) return 'N/A';
  try {
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('pt-MZ');
  } catch {
    return 'Data inválida';
  }
}

// Formatar moeda
function formatCurrency(value) {
  return value.toLocaleString('pt-MZ') + ' MT';
}

// Validar email
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Validar telefone MZ
function isValidMZPhone(phone) {
  return /^\+258[0-9]{9}$/.test(phone);
}

// Escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Truncar texto
function truncate(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// Debounce
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// Exportar
window.helpers = {
  formatDate,
  formatCurrency,
  isValidEmail,
  isValidMZPhone,
  escapeHtml,
  truncate,
  debounce
};

console.log('✅ Helpers carregados');