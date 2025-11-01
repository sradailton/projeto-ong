# 🎗️ ONG Connect Platform

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/seu-usuario/ong-connect-platform/blob/main/LICENSE)
[![WCAG 2.1 AA](https://img.shields.io/badge/accessibility-WCAG%202.1%20AA-success)](https://www.w3.org/TR/WCAG21/)
[![GitHub last commit](https://img.shields.io/github/last-commit/seu-usuario/ong-connect-platform)](https://github.com/seu-usuario/ong-connect-platform/commits/main)
[![Website](https://img.shields.io/website?url=https%3A%2F%2Fseu-usuario.github.io%2Fong-connect-platform)](https://seu-usuario.github.io/ong-connect-platform)

> **Uma plataforma web completa e acessível para conectar Organizações Não Governamentais, voluntários e doadores, promovendo impacto social através da tecnologia.**

## 🌟 Destaques

- ♿ **Totalmente Acessível** - Conformidade WCAG 2.1 Nível AA
- 📱 **Design Responsivo** - Mobile-first e cross-device
- 🚀 **Performance Otimizada** - Carregamento ultrarrápido
- 🎨 **Sistema de Design** - Consistente e escalável
- 🔧 **JavaScript Modular** - Código limpo e maintainable
- 🌐 **SPA Avançada** - Navegação fluida entre páginas
- 🛡️ **Validação Robusta** - Formulários com feedback em tempo real

## 📊 Contexto e Impacto

O terceiro setor brasileiro representa uma força econômica e social significativa:
- **820 mil+** organizações da sociedade civil
- **R$ 15 bilhões** movimentados anualmente  
- **3 milhões** de pessoas empregadas
- Apenas **30%** possuem presença digital adequada

Esta plataforma foi desenvolvida para suprir essa lacuna digital, oferecendo uma solução completa e acessível para organizações sociais.

## 🛠️ Tecnologias

### Frontend
- **HTML5** - Estrutura semântica e acessível
- **CSS3** - Variáveis CSS, Grid, Flexbox, Animations
- **JavaScript ES6+** - Modules, Classes, Async/Await

### Build & Deploy
- **Webpack 5** - Module bundling e otimização
- **GitHub Actions** - CI/CD automatizado
- **GitHub Pages** - Deploy contínuo

### Qualidade
- **Lighthouse** - Performance e acessibilidade
- **Pa11y** - Testes automatizados de acessibilidade
- **HTML Validate** - Validação de markup

## 🚀 Começando

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- Git

### Instalação Rápida

```bash
# Clone o repositório
git clone https://github.com/sradailton/projeto-ong.git

# Entre no diretório
cd projeto-ong

# Instale as dependências
npm install

# Execute em modo desenvolvimento
npm run dev

# 📁 Estrutura do Projeto
ong-connect-platform/
├── src/ # Código fonte
│ ├── index.html # Página inicial
│ ├── projetos.html # Catálogo de projetos
│ ├── cadastro.html # Formulários de cadastro
│ ├── styles/ # Sistema de design
│ │ ├── base/ # Variáveis, reset, tipografia
│ │ ├── components/ # Botões, formulários, cards
│ │ ├── layout/ # Grid, header, footer
│ │ └── utils/ # Helpers e animações
│ ├── js/ # JavaScript modular
│ │ ├── app.js # Aplicação principal
│ │ ├── modules/ # Módulos especializados
│ │ └── utils/ # Utilitários e helpers
│ └── assets/ # Recursos estáticos
│ ├── images/ # Imagens otimizadas
│ └── icons/ # Ícones SVG
├── dist/ # Build de produção (gerado)
├── scripts/ # Scripts de automação
├── .github/ # GitHub Actions
└── docs/ # Documentação técnica


## ♿ Acessibilidade
**Conformidade WCAG 2.1 Nível AA**

### 👁️ Perceptível
- Textos com contraste mínimo de 4.5:1
- Alternativas textuais para conteúdo não-textual
- Adaptável a diferentes formas de apresentação

### 🕹️ Operável
- Navegação completa por teclado
- Tempo suficiente para interagir
- Não utilizar conteúdo que cause crises

### 💡 Compreensível
- Textos legíveis e compreensíveis
- Funcionamento previsível
- Assistência na entrada de dados

### 🛡️ Robusto
- Compatível com tecnologias assistivas
- Atributos ARIA semânticos
- Suporte a leitores de tela

### Recursos de Acessibilidade Implementados
- Navegação por teclado
- Skip links para conteúdo principal
- Modo alto contraste
- Controles de tamanho de fonte
- Suporte a redução de movimento
- Anúncios para leitores de tela
- Validação de formulários acessível

## 🎨 Sistema de Design

### Cores
```css
:root {
  --primary-500: #2196f3;    /* Azul principal */
  --secondary-500: #4caf50;  /* Verde de confirmação */
  --accent-500: #ff9800;     /* Laranja de ação */
  --neutral-50: #fafafa;     /* Fundo claro */
  --neutral-900: #212121;    /* Texto escuro */
}
Tipografia
css
:root {
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */ 
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px */
  --text-3xl: 1.875rem;  /* 30px */
  --text-4xl: 2.25rem;   /* 36px */
  --text-5xl: 3rem;      /* 48px */
}

📈 Performance
Otimizações Implementadas
⚡ Carregamento Rápido
Lazy loading de imagens

Minificação de CSS, JS e HTML

Compressão de assets

Cache eficiente

📦 Bundle Otimizado
Code splitting automático

Tree shaking

Chunk optimization

Asset hashing

🎯 Métricas de Performance
First Contentful Paint: < 1.5s

Largest Contentful Paint: < 2.5s

Cumulative Layout Shift: < 0.1

First Input Delay: < 100ms

🤝 Contribuindo
Processo de Contribuição
Fork o projeto

Crie uma branch para sua feature (git checkout -b feature/AmazingFeature)

Commit suas mudanças (git commit -m 'feat: Add amazing feature')

Push para a branch (git push origin feature/AmazingFeature)

Abra um Pull Request

Convenção de Commits
Usamos Conventional Commits:

bash
feat: Adiciona novo sistema de filtros
fix: Corrige validação de CPF no formulário
docs: Atualiza documentação de acessibilidade
style: Ajusta espaçamento dos cards
refactor: Reestrutura módulo de validação
test: Adiciona testes de acessibilidade
chore: Atualiza dependências
Desenvolvimento
bash
# 1. Clone e instalação
git clone https://github.com/sradailton/projeto-ong.git
cd projeto-ong
npm install

# 2. Desenvolvimento com hot reload
npm run dev

# 3. Verificação de qualidade
npm run validate:html
npm run validate:accessibility

# 4. Build de produção
npm run build
📄 Licença
Distribuído sob licença MIT. Veja LICENSE para mais informações.

👥 Equipe
Seu Nome - Desenvolvedor Front-end - seu.email@example.com

🙏 Agradecimentos
IBGE - Pelos dados sobre o terceiro setor brasileiro

W3C - Pelas diretrizes de acessibilidade WCAG

Comunidade Open Source - Pelas ferramentas e bibliotecas

📞 Contato
Seu sradailton

Link do Projeto: https://github.com/sradailton/projeto-ong

Demo Online: https://sradailton.github.io/projeto- ong

<div align="center"> Desenvolvido com ❤️ para promover o impacto social através da tecnologia
⬆ Voltar ao topo

</div> ```
