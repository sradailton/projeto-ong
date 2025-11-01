// Arquivo principal da aplicação - ONG Connect Platform
import { SPA } from './modules/spa.js';
import { FormValidator } from './modules/formValidator.js';
import { DataManager } from './modules/dataManager.js';
import { UIComponents } from './modules/uiComponents.js';
import { eventBus } from './utils/eventBus.js';
import { Helpers } from './utils/helpers.js';

class ONGConnectApp {
  constructor() {
    this.spa = null;
    this.formValidator = null;
    this.dataManager = null;
    this.uiComponents = null;
    this.isInitialized = false;
    
    this.init();
  }

  async init() {
    if (this.isInitialized) return;

    try {
      // Inicializa módulos principais
      this.spa = new SPA();
      this.formValidator = new FormValidator();
      this.dataManager = new DataManager();
      this.uiComponents = new UIComponents();

      // Configura formulários
      this.setupForms();

      // Configura event listeners globais
      this.setupGlobalEventListeners();

      // Inicializa componentes da página atual
      this.initializePage();

      this.isInitialized = true;
      
      console.log('🎉 ONG Connect Platform inicializada com sucesso!');
      
      // Dispara evento de inicialização
      eventBus.emit('appInitialized', { 
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      });

    } catch (error) {
      console.error('❌ Erro na inicialização da aplicação:', error);
      this.showFatalError(error);
    }
  }

  setupForms() {
    // Configura validação para todos os formulários principais
    this.formValidator.setupRegistrationForm();

    // Configura formulário de contato se existir
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
      this.formValidator.setupForm('contactForm', {
        realTime: true,
        onSubmit: async (data) => {
          // Simula envio do formulário de contato
          await new Promise(resolve => setTimeout(resolve, 1500));
          return { success: true, message: 'Mensagem enviada com sucesso!' };
        },
        onSuccess: (data, form) => {
          this.uiComponents.createToast(
            'Mensagem enviada com sucesso! Retornaremos em breve.',
            'success'
          );
          form.reset();
        }
      });
    }

    // Configura formulário de filtro de projetos
    const projectsFilter = document.getElementById('projects-filter');
    if (projectsFilter) {
      projectsFilter.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleProjectsFilter(e);
      });
    }
  }

  setupGlobalEventListeners() {
    // Navegação SPA
    eventBus.on('navigate', (data) => {
      this.handleNavigation(data);
    });

    // Sucesso no cadastro
    eventBus.on('registrationSuccess', (data) => {
      this.handleRegistrationSuccess(data);
    });

    // Erro de validação de formulário
    eventBus.on('formValidationError', (data) => {
      this.handleFormValidationError(data);
    });

    // Sucesso na validação de formulário
    eventBus.on('formValidationSuccess', (data) => {
      this.handleFormValidationSuccess(data);
    });

    // Mudança de página
    eventBus.on('pageChanged', (data) => {
      this.handlePageChange(data);
    });

    // Modal de doação
    eventBus.on('openDonationModal', (data) => {
      this.openDonationModal(data);
    });

    // Atualização de dados
    eventBus.on('dataUpdateRequest', (data) => {
      this.handleDataUpdate(data);
    });

    // Erros globais
    window.addEventListener('error', (event) => {
      this.handleGlobalError(event);
    });

    // Conexão online/offline
    window.addEventListener('online', () => {
      this.handleOnlineStatus();
    });

    window.addEventListener('offline', () => {
      this.handleOfflineStatus();
    });
  }

  initializePage() {
    // Inicializa componentes baseado na página atual
    const currentPage = this.getCurrentPage();
    
    switch (currentPage) {
      case 'home':
        this.initializeHomePage();
        break;
      case 'projects':
        this.initializeProjectsPage();
        break;
      case 'registration':
        this.initializeRegistrationPage();
        break;
    }

    // Inicializa componentes comuns
    this.initializeCommonComponents();
  }

  getCurrentPage() {
    const path = window.location.pathname;
    if (path.includes('projetos.html')) return 'projects';
    if (path.includes('cadastro.html')) return 'registration';
    return 'home';
  }

  initializeHomePage() {
    // Inicializa componentes específicos da home
    this.initializeHeroSection();
    this.initializeStatsCounter();
    this.initializeFeatureCards();
  }

  initializeProjectsPage() {
    // Inicializa componentes da página de projetos
    this.loadAndRenderProjects();
    this.initializeProjectFilters();
    this.initializeProjectSearch();
  }

  initializeRegistrationPage() {
    // Inicializa componentes da página de cadastro
    this.initializeRegistrationForm();
    this.initializeAddressAutoComplete();
  }

  initializeCommonComponents() {
    // Componentes que existem em todas as páginas
    this.initializeNavigation();
    this.initializeModals();
    this.initializeToasts();
  }

  // Handlers de eventos
  handleNavigation(data) {
    console.log('Navegação solicitada:', data);
    // A navegação é tratada pelo módulo SPA
  }

  handleRegistrationSuccess(data) {
    this.uiComponents.createToast(
      'Cadastro realizado com sucesso! Bem-vindo à ONG Connect.',
      'success',
      5000
    );

    // Redireciona ou atualiza a UI
    setTimeout(() => {
      eventBus.emit('navigate', { route: 'home' });
    }, 2000);
  }

  handleFormValidationError(data) {
    console.warn('Erro de validação no formulário:', data.formId, data.errors);
    
    // Rolagem suave para o primeiro erro
    const form = document.getElementById(data.formId);
    if (form) {
      const firstError = form.querySelector('.invalid');
      if (firstError) {
        firstError.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
    }
  }

  handleFormValidationSuccess(data) {
    console.log('Formulário validado com sucesso:', data.formId);
  }

  handlePageChange(data) {
    console.log('Página alterada:', data.from, '→', data.to);
    
    // Reinicializa componentes para a nova página
    this.initializePage();
  }

  async handleProjectsFilter(e) {
    const formData = new FormData(e.target);
    const filters = Object.fromEntries(formData);
    
    try {
      const projects = await this.dataManager.getProjects(filters);
      this.renderProjects(projects);
    } catch (error) {
      this.uiComponents.createToast(
        'Erro ao filtrar projetos. Tente novamente.',
        'error'
      );
    }
  }

  openDonationModal(data) {
    const modal = document.getElementById('donation-modal');
    if (modal) {
      this.uiComponents.openModal(modal);
      
      // Preenche o ID do projeto se fornecido
      if (data.projectId) {
        const projectField = modal.querySelector('[name="projectId"]');
        if (projectField) {
          projectField.value = data.projectId;
        }
      }
    }
  }

  handleDataUpdate(data) {
    console.log('Atualização de dados solicitada:', data);
    // Atualização é tratada pelo DataManager
  }

  handleGlobalError(event) {
    console.error('Erro global:', event.error);
    
    // Mostra erro amigável para o usuário
    this.uiComponents.createToast(
      'Ocorreu um erro inesperado. A página será recarregada.',
      'error'
    );

    // Recarrega a página após um tempo
    setTimeout(() => {
      window.location.reload();
    }, 5000);
  }

  handleOnlineStatus() {
    this.uiComponents.createToast(
      'Conexão restaurada. Sincronizando dados...',
      'success',
      3000
    );
    
    // Sincroniza dados quando online
    eventBus.emit('syncData');
  }

  handleOfflineStatus() {
    this.uiComponents.createToast(
      'Você está offline. Algumas funcionalidades podem não estar disponíveis.',
      'warning',
      5000
    );
  }

  // Métodos de inicialização de componentes
  initializeHeroSection() {
    // Animação do hero section
    const hero = document.querySelector('.hero');
    if (hero) {
      hero.classList.add('animate-fadeIn');
    }
  }

  initializeStatsCounter() {
    // Contadores animados na seção de stats
    const counters = document.querySelectorAll('[data-counter]');
    counters.forEach(counter => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });

      observer.observe(counter);
    });
  }

  animateCounter(element) {
    const target = parseInt(element.getAttribute('data-counter'));
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;

    const updateCounter = () => {
      current += step;
      if (current < target) {
        element.textContent = Math.floor(current).toLocaleString();
        requestAnimationFrame(updateCounter);
      } else {
        element.textContent = target.toLocaleString();
      }
    };

    updateCounter();
  }

  initializeFeatureCards() {
    // Interatividade nos cards de features
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        card.classList.add('hover-lift');
      });
      
      card.addEventListener('mouseleave', () => {
        card.classList.remove('hover-lift');
      });
    });
  }

  async loadAndRenderProjects() {
    const container = document.getElementById('projects-container');
    if (!container) return;

    try {
      // Mostra loading
      const loading = this.uiComponents.showLoading(container, 'Carregando projetos...');

      // Carrega projetos
      const projects = await this.dataManager.getProjects();

      // Renderiza projetos
      this.renderProjects(projects);

      // Esconde loading
      this.uiComponents.hideLoading(loading);

    } catch (error) {
      this.uiComponents.createToast(
        'Erro ao carregar projetos. Tente novamente.',
        'error'
      );
    }
  }

  renderProjects(projects) {
    const container = document.getElementById('projects-container');
    if (!container) return;

    if (projects.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <h3>Nenhum projeto encontrado</h3>
          <p>Tente ajustar os filtros ou verifique novamente mais tarde.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = projects.map(project => `
      <div class="project-card card" data-project-id="${project.id}">
        <div class="project-card__image">
          <img src="${project.image}" alt="${project.title}" loading="lazy">
          <div class="project-card__badges">
            <span class="badge badge-primary">${project.category}</span>
            <span class="badge badge-${project.status === 'active' ? 'success' : 'secondary'}">
              ${project.status === 'active' ? 'Ativo' : 'Inativo'}
            </span>
          </div>
        </div>
        <div class="project-card__content">
          <h3 class="project-card__title">${project.title}</h3>
          <p class="project-card__description">${project.description}</p>
          <div class="project-card__meta">
            <span class="location">📍 ${project.location}</span>
            <span class="volunteers">👥 ${project.volunteers} voluntários</span>
          </div>
          <div class="project-card__progress">
            <div class="progress-bar">
              <div class="progress-fill" 
                   data-progress-value="${(project.raised / project.goal) * 100}">
              </div>
            </div>
            <div class="progress-text">
              ${Helpers.formatCurrency(project.raised)} de ${Helpers.formatCurrency(project.goal)} 
              (${Math.round((project.raised / project.goal) * 100)}%)
            </div>
          </div>
          <div class="project-card__actions">
            <button class="btn btn-primary btn-sm" 
                    data-action="view-project" 
                    data-project-id="${project.id}">
              Ver Detalhes
            </button>
            <button class="btn btn-secondary btn-sm" 
                    data-action="volunteer-project" 
                    data-project-id="${project.id}">
              Quero Ajudar
            </button>
          </div>
        </div>
      </div>
    `).join('');

    // Inicializa componentes dos projetos
    this.uiComponents.initializeAllComponents();
  }

  initializeProjectFilters() {
    // Filtros já são tratados pelo event listener global
  }

  initializeProjectSearch() {
    const searchInput = document.querySelector('[data-project-search]');
    if (searchInput) {
      searchInput.addEventListener('input', Helpers.debounce((e) => {
        this.handleProjectSearch(e.target.value);
      }, 500));
    }
  }

  async handleProjectSearch(searchTerm) {
    try {
      const projects = await this.dataManager.getProjects({ search: searchTerm });
      this.renderProjects(projects);
    } catch (error) {
      console.error('Erro na busca:', error);
    }
  }

  initializeRegistrationForm() {
    // Formulário já é configurado pelo FormValidator
    // Aqui podemos adicionar comportamentos específicos
    
    const tipoCadastroRadios = document.querySelectorAll('input[name="tipoCadastro"]');
    const habilidadesField = document.getElementById('habilidadesField');
    
    if (habilidadesField) {
      tipoCadastroRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
          if (e.target.value === 'voluntario') {
            habilidadesField.style.display = 'block';
          } else {
            habilidadesField.style.display = 'none';
          }
        });
      });
    }
  }

  initializeAddressAutoComplete() {
    const cepInput = document.getElementById('cep');
    if (cepInput) {
      cepInput.addEventListener('blur', async (e) => {
        const cep = e.target.value.replace(/\D/g, '');
        if (cep.length === 8) {
          await this.fetchAddress(cep);
        }
      });
    }
  }

  async fetchAddress(cep) {
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      
      if (!data.erro) {
        document.getElementById('logradouro').value = data.logradouro || '';
        document.getElementById('bairro').value = data.bairro || '';
        document.getElementById('cidade').value = data.localidade || '';
        document.getElementById('estado').value = data.uf || '';
        
        this.uiComponents.createToast('Endereço preenchido automaticamente!', 'success');
      } else {
        this.uiComponents.createToast('CEP não encontrado. Verifique o CEP informado.', 'error');
      }
    } catch (error) {
      this.uiComponents.createToast('Erro ao buscar endereço. Tente novamente.', 'error');
    }
  }

  initializeNavigation() {
    // Navegação é tratada pelo módulo SPA
  }

  initializeModals() {
    // Modais são inicializados pelo UIComponents
  }

  initializeToasts() {
    // Toasts são gerenciados pelo UIComponents
  }

  showFatalError(error) {
    // Mostra erro fatal para o usuário
    const errorContainer = document.getElementById('error-container') || 
                          document.createElement('div');
    
    errorContainer.id = 'error-container';
    errorContainer.className = 'fatal-error';
    errorContainer.innerHTML = `
      <div class="error-content">
        <h2>😕 Ocorreu um erro</h2>
        <p>A aplicação encontrou um problema e não pôde ser carregada.</p>
        <button onclick="window.location.reload()" class="btn btn-primary">
          Tentar Novamente
        </button>
        <details>
          <summary>Detalhes do erro</summary>
          <pre>${error.stack || error.message}</pre>
        </details>
      </div>
    `;

    document.body.innerHTML = '';
    document.body.appendChild(errorContainer);
  }
}

// Inicializa a aplicação quando o DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.ONGConnectApp = new ONGConnectApp();
  });
} else {
  window.ONGConnectApp = new ONGConnectApp();
}

// Exporta para uso global (desenvolvimento)
if (process.env.NODE_ENV === 'development') {
  window.Helpers = Helpers;
  window.eventBus = eventBus;
}