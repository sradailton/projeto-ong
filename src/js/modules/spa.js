// Sistema de Single Page Application
import { TemplateEngine } from './templateEngine.js';
import { eventBus } from '../utils/eventBus.js';
import { Helpers } from '../utils/helpers.js';

export class SPA {
  constructor() {
    this.templateEngine = new TemplateEngine();
    this.currentPage = '';
    this.isInitialized = false;
    this.routes = new Map();
    
    this.init();
  }

  init() {
    if (this.isInitialized) return;
    
    this.templateEngine.initDefaultTemplates();
    this.setupRoutes();
    this.setupNavigation();
    this.setupEventListeners();
    
    this.isInitialized = true;
    console.log('SPA inicializada');
  }

  setupRoutes() {
    // Define as rotas da aplicação
    this.routes.set('home', {
      template: 'home-page',
      title: 'ONG Connect - Página Inicial',
      handler: this.handleHomePage.bind(this)
    });

    this.routes.set('projects', {
      template: 'projects-page',
      title: 'ONG Connect - Projetos',
      handler: this.handleProjectsPage.bind(this)
    });

    this.routes.set('registration', {
      template: 'registration-page',
      title: 'ONG Connect - Cadastro',
      handler: this.handleRegistrationPage.bind(this)
    });

    this.routes.set('project-detail', {
      template: 'project-detail-page',
      title: 'ONG Connect - Detalhes do Projeto',
      handler: this.handleProjectDetail.bind(this)
    });
  }

  setupNavigation() {
    // Intercepta clicks em links
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[data-route]');
      if (link) {
        e.preventDefault();
        const route = link.getAttribute('data-route');
        this.navigate(route);
      }
    });

    // Manipula o botão voltar do navegador
    window.addEventListener('popstate', (e) => {
      this.handlePopState(e);
    });
  }

  setupEventListeners() {
    // Escuta eventos de navegação
    eventBus.on('navigate', (data) => {
      this.navigate(data.route, data.data);
    });

    // Escuta eventos de renderização
    eventBus.on('contentRendered', (data) => {
      this.initializePageComponents(data.page);
    });
  }

  async navigate(route, data = {}) {
    if (this.currentPage === route) return;

    const routeConfig = this.routes.get(route);
    if (!routeConfig) {
      console.error(`Rota não encontrada: ${route}`);
      return;
    }

    try {
      // Mostra loading
      this.showLoading();

      // Atualiza histórico
      window.history.pushState({ route, data }, '', this.getRouteUrl(route));

      // Renderiza a página
      await this.renderPage(route, data);

      // Atualiza estado atual
      this.currentPage = route;

      // Dispara evento
      eventBus.emit('pageChanged', { 
        from: this.currentPage, 
        to: route, 
        data 
      });

    } catch (error) {
      console.error('Erro na navegação:', error);
      this.showError('Erro ao carregar a página');
    } finally {
      this.hideLoading();
    }
  }

  async renderPage(route, data) {
    const routeConfig = this.routes.get(route);
    const mainContent = document.getElementById('main-content');
    
    if (!mainContent) {
      throw new Error('Elemento main-content não encontrado');
    }

    // Atualiza título da página
    document.title = routeConfig.title;

    // Executa o handler da rota para carregar dados
    const pageData = await routeConfig.handler(data);
    
    // Renderiza o template
    this.templateEngine.renderTo(mainContent, routeConfig.template, pageData);

    // Dispara evento de conteúdo renderizado
    eventBus.emit('contentRendered', { 
      page: route, 
      data: pageData 
    });
  }

  handlePopState(e) {
    if (e.state && e.state.route) {
      this.navigate(e.state.route, e.state.data);
    }
  }

  getRouteUrl(route) {
    const routeUrls = {
      'home': '/',
      'projects': '/projetos.html',
      'registration': '/cadastro.html',
      'project-detail': '/projeto/'
    };
    return routeUrls[route] || '/';
  }

  // Handlers de página
  async handleHomePage() {
    // Simula carregamento de dados para a home
    return {
      featuredProjects: [],
      stats: {
        organizations: 820000,
        annualMovement: 15000000000,
        employees: 3000000,
        digitalPresence: 30
      }
    };
  }

  async handleProjectsPage() {
    // Carrega projetos do storage ou API
    const projects = Helpers.getStorage('ong_connect_projects') || [];
    return { projects };
  }

  async handleRegistrationPage() {
    // Dados iniciais para o formulário
    return {
      formData: {},
      states: this.getBrazilianStates()
    };
  }

  async handleProjectDetail(data) {
    // Carrega detalhes do projeto específico
    const projects = Helpers.getStorage('ong_connect_projects') || [];
    const project = projects.find(p => p.id === data.projectId);
    
    if (!project) {
      throw new Error('Projeto não encontrado');
    }

    return { project };
  }

  getBrazilianStates() {
    return [
      'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
      'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 
      'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
    ];
  }

  showLoading() {
    // Implementação do loading
    const loadingElement = document.getElementById('loading-spinner');
    if (loadingElement) {
      loadingElement.classList.remove('hidden');
    }
  }

  hideLoading() {
    const loadingElement = document.getElementById('loading-spinner');
    if (loadingElement) {
      loadingElement.classList.add('hidden');
    }
  }

  showError(message) {
    // Mostra erro para o usuário
    const alert = this.templateEngine.render('alert', {
      type: 'error',
      message: message
    });
    
    const container = document.getElementById('alerts-container');
    if (container) {
      container.innerHTML = alert;
    }
  }

  initializePageComponents(page) {
    // Inicializa componentes específicos da página
    switch (page) {
      case 'projects':
        this.initializeProjectFilters();
        break;
      case 'registration':
        this.initializeFormValidation();
        break;
      case 'project-detail':
        this.initializeProjectActions();
        break;
    }
  }

  initializeProjectFilters() {
    // Inicializa filtros de projetos
    const filterForm = document.getElementById('projects-filter');
    if (filterForm) {
      filterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleProjectFilter(e);
      });
    }
  }

  initializeFormValidation() {
    // A validação de formulários é tratada pelo FormValidator
    console.log('Form validation initialized for registration page');
  }

  initializeProjectActions() {
    // Inicializa ações dos projetos (voluntariar, doar, etc.)
    const projectActions = document.querySelectorAll('[data-action]');
    projectActions.forEach(button => {
      button.addEventListener('click', (e) => {
        this.handleProjectAction(e);
      });
    });
  }

  handleProjectFilter(e) {
    // Implementação dos filtros de projetos
    const formData = new FormData(e.target);
    const filters = Object.fromEntries(formData);
    
    eventBus.emit('projectsFiltered', { filters });
  }

  handleProjectAction(e) {
    const action = e.target.getAttribute('data-action');
    const projectId = e.target.getAttribute('data-project-id');

    switch (action) {
      case 'view-project':
        this.navigate('project-detail', { projectId });
        break;
      case 'volunteer-project':
        this.handleVolunteerAction(projectId);
        break;
      case 'donate-project':
        this.handleDonateAction(projectId);
        break;
    }
  }

  handleVolunteerAction(projectId) {
    // Redireciona para cadastro com o projeto pré-selecionado
    this.navigate('registration', { projectId, role: 'volunteer' });
  }

  handleDonateAction(projectId) {
    // Abre modal de doação
    eventBus.emit('openDonationModal', { projectId });
  }
}