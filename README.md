GigaMoz Agency - Sistema Completo
https://img.shields.io/badge/GigaMoz-Agency-brightgreen
https://img.shields.io/badge/Firebase-9.6.10-orange
https://img.shields.io/badge/Status-Production-ready-success

Sistema completo de agência digital com marketplace integrado, painel administrativo e sistema de pedidos.

🚀 Funcionalidades Principais
🛍️ Loja Virtual & Marketplace
Catálogo de produtos com categorias

Carrinho de compras

Sistema de pedidos integrado

Pagamentos M-Pesa e eMola

🎨 Serviços Digitais
Criação de imagens com IA

Desenvolvimento de sites

Criação de currículos

Design de logos

Suporte técnico remoto

Assistente virtual

👑 Painel Administrativo
Gestão de usuários e permissões

Controle de pedidos e status

Gestão de produtos

Estatísticas e relatórios

Sistema de aprovação de admins

🔐 Sistema de Autenticação
Registro e login seguro

Contas de usuário e administrador

Aprovação manual de admins

Recuperação de senha

📋 Pré-requisitos
Navegador moderno (Chrome, Firefox, Safari, Edge)

Conexão com internet

Conta Firebase (já configurada)

🛠️ Tecnologias Utilizadas
Frontend: HTML5, CSS3, JavaScript (ES6+)

Backend: Firebase (Auth, Firestore, Storage)

UI/UX: Design system customizado

Icons: Emojis nativos

Fonts: Google Fonts (Poppins)

📁 Estrutura do Projeto
text
gigamoz-agency/
├── index.html              # Página principal
├── login.html              # Sistema de autenticação
├── dashboard.html          # Área do usuário
├── admin.html             # Painel administrativo
├── migrate-data.html      # Migração de dados
├── css/
│   └── style.css          # Estilos principais
├── js/
│   ├── firebase-config.js # Configuração Firebase
│   ├── auth.js           # Sistema de autenticação
│   ├── dashboard.js      # Funcionalidades do usuário
│   ├── admin.js         # Painel administrativo
│   ├── cart.js          # Sistema de carrinho
│   ├── products-firebase.js # Gestão de produtos
│   ├── form-handler-firebase.js # Processamento de formulários
│   ├── proforma.js      # Gerador de proformas
│   ├── carousel.js      # Carrossel de produtos
│   ├── main.js         # Script principal
│   └── utils/
│       ├── notifications.js # Sistema de notificações
│       ├── helpers.js      # Funções auxiliares
│       └── storage.js      # Gerenciamento de localStorage
🔧 Configuração e Instalação
1. Configuração do Firebase
O projeto já vem com Firebase configurado. Para usar seu próprio projeto:

Acesse Firebase Console

Crie um novo projeto

Ative Authentication (Email/Password)

Crie Firestore Database

Ative Storage (opcional)

Substitua as credenciais em js/firebase-config.js

2. Estrutura de Dados do Firestore
Coleção: users
javascript
{
  name: "Nome do Usuário",
  email: "email@exemplo.com",
  whatsapp: "+258841234567",
  type: "user" | "admin",
  approved: boolean,
  createdAt: timestamp,
  updatedAt: timestamp
}
Coleção: products
javascript
{
  title: "Nome do Produto",
  price: number,
  description: "Descrição",
  category: "electronics" | "accessories" | "home" | "fashion" | "books" | "other",
  image: "URL da imagem",
  status: "active" | "inactive",
  createdAt: timestamp,
  updatedAt: timestamp
}
Coleção: orders
javascript
{
  userId: "user_id",
  customerName: "Nome do Cliente",
  customerEmail: "email@cliente.com",
  customerWhatsApp: "+258841234567",
  service: "Nome do Serviço",
  details: "Detalhes do pedido",
  amount: number,
  status: "pending" | "processing" | "completed" | "cancelled",
  type: "service" | "marketplace",
  items: array, // Para pedidos marketplace
  createdAt: timestamp,
  updatedAt: timestamp
}
3. Índices do Firestore
Para otimizar as consultas, crie estes índices compostos:

Para orders:
Campo: userId (Ascending)

Campo: createdAt (Descending)

Para products:
Campo: status (Ascending)

Campo: createdAt (Descending)

Para users:
Campo: type (Ascending)

Campo: approved (Ascending)

🚀 Como Usar
Para Clientes
Acesse a Loja: Abra index.html

Navegue pelos Serviços: Veja serviços e produtos

Faça Pedidos: Use o formulário de contato ou carrinho

Crie sua Conta: Registre-se para acompanhar pedidos

Para Administradores
Acesse o Painel: Vá para admin.html

Gerencie Conteúdo: Adicione produtos, gerencie pedidos

Aprove Usuários: Controle acesso de administradores

Monitore Estatísticas: Acompanhe métricas do negócio

Para Desenvolvedores
Estrutura Modular: Cada funcionalidade em arquivo separado

Event Listeners: Sistema de eventos para interações

Error Handling: Tratamento robusto de erros

Responsive Design: Layout adaptável para todos dispositivos

🎨 Personalização
Cores e Temas
Modifique as variáveis CSS em css/style.css:

css
:root {
  --accent: #7c3aed;
  --accent-2: #06b6d4;
  --card: #1e293b;
  /* ... outras variáveis */
}
Adicionar Novos Serviços
Em index.html, adicione novos serviços na seção correspondente.

Modificar Categorias de Produtos
Atualize o array de categorias em js/products-firebase.js.

🔒 Segurança
Autenticação via Firebase Auth

Regras de segurança no Firestore

Validação de dados no frontend e backend

Proteção contra XSS e injection

📊 Monitoramento
O sistema inclui:

Console logging para debug

Sistema de notificações toast

Tratamento de erros amigável

Analytics básico via Firebase

🐛 Solução de Problemas
Erros Comuns
"Index is building": Aguarde 5-15 minutos para índices do Firestore

"Auth not available": Verifique configuração do Firebase

"User not found": Sistema sugere registro automático

"Network error": Verifique conexão com internet

Debug
Ative o modo debug adicionando:

javascript
localStorage.setItem('debug', 'true');
📈 Próximas Funcionalidades
Sistema de notificações push

Integração com WhatsApp Business API

Relatórios avançados

Sistema de cupons e descontos

Multi-idioma (Português/Inglês)

App mobile (PWA)

🤝 Contribuição
Para contribuir com o projeto:

Fork o repositório

Crie uma branch para sua feature

Commit suas mudanças

Push para a branch

Abra um Pull Request

📄 Licença
Este projeto é licenciado sob a MIT License - veja o arquivo LICENSE para detalhes.

👥 Autores
Edson Bernardo - Desenvolvimento inicial

Equipe GigaMoz - Manutenção e melhorias

📞 Suporte
WhatsApp: +258 84 720 6883

Email: edsontondondo8@gmail.com

Site: GigaMoz Agency
