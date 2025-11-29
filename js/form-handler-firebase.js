// form-handler-firebase.js - Handler de formulários com Firebase
console.log('📝 Carregando handler de formulários...');

class FormHandlerFirebase {
  constructor() {
    this.form = null;
    this.init();
  }

  async init() {
    await window.waitForFirebase();
    this.setupForm();
  }

  setupForm() {
    this.form = document.getElementById('orderForm');
    
    if (!this.form) {
      console.log('⚠️ Formulário de pedido não encontrado nesta página');
      return;
    }

    console.log('✅ Formulário de pedido encontrado');
    
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    
    // Validação em tempo real do WhatsApp
    const whatsappInput = this.form.querySelector('input[name="whatsapp"]');
    if (whatsappInput) {
      whatsappInput.addEventListener('blur', (e) => this.validateWhatsApp(e.target));
    }
  }

  async handleSubmit(event) {
    event.preventDefault();
    console.log('📤 Enviando formulário...');

    const form = event.target;
    const submitBtn = form.querySelector('#submitBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const spinner = submitBtn.querySelector('.spinner');

    // Validar WhatsApp
    const whatsappInput = form.querySelector('input[name="whatsapp"]');
    if (!this.validateWhatsApp(whatsappInput)) {
      showError('Formato de WhatsApp inválido. Use: +258841234567');
      return;
    }

    // Coletar dados do formulário
    const formData = new FormData(form);
    const data = {
      customerName: formData.get('nome'),
      customerEmail: formData.get('email') || '',
      customerWhatsApp: formData.get('whatsapp'),
      service: formData.get('servico'),
      details: formData.get('detalhes'),
      amount: this.estimateServicePrice(formData.get('servico')),
      status: 'pending',
      type: 'service',
      source: 'website_form'
    };

    // Adicionar userId se logado
    if (window.authManager && window.authManager.currentUser) {
      data.userId = window.authManager.currentUser.uid;
    } else {
      data.userId = 'anonymous';
    }

    // UI Loading
    btnText.textContent = 'Processando...';
    if (spinner) spinner.style.display = 'inline-block';
    submitBtn.disabled = true;

    try {
      // Salvar no Firestore
      console.log('💾 Salvando pedido no Firestore...');
      
      const orderRef = await window.db.collection('orders').add({
        ...data,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      console.log('✅ Pedido salvo com ID:', orderRef.id);

      // Gerar proforma (se disponível)
      setTimeout(() => {
        this.generateProforma(data, orderRef.id);
      }, 500);

      // Enviar email de confirmação (opcional)
      if (data.customerEmail) {
        this.sendConfirmationEmail(data, orderRef.id);
      }

      // Limpar formulário
      form.reset();

      // Mensagem de sucesso
      showSuccess('✅ Pedido enviado com sucesso! Você receberá um email de confirmação.');

      // Abrir WhatsApp (opcional)
      setTimeout(() => {
        if (confirm('💬 Deseja abrir WhatsApp para falar conosco?')) {
          this.openWhatsAppConfirmation(data);
        }
      }, 2000);

    } catch (error) {
      console.error('❌ Erro ao processar pedido:', error);
      showError('Erro ao enviar pedido. Por favor, tente novamente.');
    } finally {
      // Restaurar botão
      setTimeout(() => {
        btnText.textContent = '📄 Enviar Pedido & Gerar Proforma';
        if (spinner) spinner.style.display = 'none';
        submitBtn.disabled = false;
      }, 2000);
    }
  }

  validateWhatsApp(input) {
    if (!input) return false;
    
    const value = input.value;
    const phoneRegex = /^\+258[0-9]{9}$/;
    const isValid = phoneRegex.test(value);

    if (!isValid && value) {
      input.style.borderColor = '#ef4444';
      return false;
    } else {
      input.style.borderColor = '';
      return true;
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

  generateProforma(data, orderId) {
    try {
      if (!window.proformaGenerator) {
        console.warn('⚠️ Gerador de proforma não disponível');
        return;
      }

      console.log('📄 Gerando proforma...');

      const proforma = window.proformaGenerator.generateProforma({
        nome: data.customerName,
        whatsapp: data.customerWhatsApp,
        email: data.customerEmail,
        servico: data.service,
        detalhes: data.details,
        orderId: orderId
      });

      window.proformaGenerator.downloadProforma(proforma);
      
      showSuccess('📄 Proforma gerada e baixada!');

    } catch (error) {
      console.error('❌ Erro ao gerar proforma:', error);
      showWarning('Pedido salvo, mas erro ao gerar proforma');
    }
  }

  async sendConfirmationEmail(data, orderId) {
    // Esta funcionalidade requer configuração de backend
    // Por enquanto, apenas log
    console.log('📧 Email de confirmação seria enviado para:', data.customerEmail);
    
    // Implementação futura: usar Firebase Cloud Functions ou serviço de email
  }

  openWhatsAppConfirmation(data) {
    const phone = '258847206883';
    const message = encodeURIComponent(
      `Olá! Fiz um pedido de "${data.service}" através do website.\n\n` +
      `Nome: ${data.customerName}\n` +
      `WhatsApp: ${data.customerWhatsApp}\n` +
      `Detalhes: ${data.details}\n\n` +
      `Aguardo confirmação!`
    );
    
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  }

  // Função auxiliar para formatar dados
  formatFormData(data) {
    return {
      ...data,
      createdAt: new Date().toISOString(),
      formattedDate: new Date().toLocaleDateString('pt-MZ'),
      formattedTime: new Date().toLocaleTimeString('pt-MZ')
    };
  }
}

// Inicializar form handler
let formHandlerFB;

document.addEventListener('DOMContentLoaded', async function() {
  formHandlerFB = new FormHandlerFirebase();
});

// Funções globais
function pagarMpesa() {
  const phone = '258847206883';
  const message = encodeURIComponent('Olá! Quero fazer um pagamento M-Pesa.');
  window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
}

// Exportar para window
window.formHandlerFB = formHandlerFB;
window.pagarMpesa = pagarMpesa;

console.log('✅ Handler de formulários carregado');