console.log('📄 Carregando gerador de proforma...');

const proformaGenerator = {
  generateProforma(data) {
    const proforma = `
===========================================
      PROFORMA - GIGAMOZ AGENCY
===========================================

Data: ${new Date().toLocaleDateString('pt-MZ')}
Pedido: #${data.orderId || 'TEMP'}

-------------------------------------------
DADOS DO CLIENTE
-------------------------------------------
Nome: ${data.nome}
WhatsApp: ${data.whatsapp}
Email: ${data.email || 'N/A'}

-------------------------------------------
SERVIÇO SOLICITADO
-------------------------------------------
${data.servico}

Detalhes:
${data.detalhes}

-------------------------------------------
PAGAMENTO
-------------------------------------------
M-Pesa: 847206883
eMola: 867104040

-------------------------------------------
Após o pagamento, envie o comprovativo
via WhatsApp: +258847206883
-------------------------------------------

GigaMoz Agency
Email: edsontondondo8@gmail.com
WhatsApp: +258 84 720 6883

===========================================
    `;

    return proforma;
  },

  downloadProforma(content) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `proforma_gigamoz_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};

window.proformaGenerator = proformaGenerator;
console.log('✅ Gerador de proforma carregado');