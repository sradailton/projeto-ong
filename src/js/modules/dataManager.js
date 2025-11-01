// Gerenciador de dados da aplicação
import { Helpers } from '../utils/helpers.js';
import { CONSTANTS } from '../utils/constants.js';
import { eventBus } from '../utils/eventBus.js';
import { ApiSimulator } from './apiSimulator.js';

export class DataManager {
  constructor() {
    this.api = new ApiSimulator();
    this.cache = new Map();
    this.subscribers = new Map();
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.preloadEssentialData();
  }

  setupEventListeners() {
    // Escuta eventos de atualização de dados
    eventBus.on('dataUpdateRequest', (data) => {
      this.handleDataUpdate(data);
    });

    // Escuta eventos de limpeza de cache
    eventBus.on('clearCache', () => {
      this.clearCache();
    });
  }

  async preloadEssentialData() {
    // Pré-carrega dados essenciais
    try {
      await this.getProjects();
      await this.getStats();
    } catch (error) {
      console.error('Erro no pré-carregamento de dados:', error);
    }
  }

  // Gerenciamento de Projetos
  async getProjects(filters = {}) {
    const cacheKey = `projects-${JSON.stringify(filters)}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const response = await this.api.request(CONSTANTS.API_ENDPOINTS.PROJECTS, {
        method: 'GET'
      });

      let projects = response.data;

      // Aplica filtros
      if (filters.category) {
        projects = projects.filter(p => p.category === filters.category);
      }

      if (filters.status) {
        projects = projects.filter(p => p.status === filters.status);
      }

      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        projects = projects.filter(p => 
          p.title.toLowerCase().includes(searchTerm) ||
          p.description.toLowerCase().includes(searchTerm)
        );
      }

      // Ordenação
      if (filters.sort) {
        projects = this.sortProjects(projects, filters.sort);
      }

      this.cache.set(cacheKey, projects);
      return projects;

    } catch (error) {
      console.error('Erro ao carregar projetos:', error);
      throw error;
    }
  }

  async getProjectById(id) {
    const cacheKey = `project-${id}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const projects = await this.getProjects();
      const project = projects.find(p => p.id === id);
      
      if (project) {
        this.cache.set(cacheKey, project);
        return project;
      } else {
        throw new Error('Projeto não encontrado');
      }
    } catch (error) {
      console.error('Erro ao carregar projeto:', error);
      throw error;
    }
  }

  async createProject(projectData) {
    try {
      const response = await this.api.request(CONSTANTS.API_ENDPOINTS.PROJECTS, {
        method: 'POST',
        data: projectData
      });

      // Limpa cache relacionado a projetos
      this.clearCacheByPrefix('projects');
      
      // Notifica subscribers
      this.notifySubscribers('projects', 'created', response.data);
      
      eventBus.emit('projectCreated', { project: response.data });
      
      return response.data;

    } catch (error) {
      console.error('Erro ao criar projeto:', error);
      throw error;
    }
  }

  // Gerenciamento de Voluntários
  async getVolunteers(filters = {}) {
    try {
      const response = await this.api.request(CONSTANTS.API_ENDPOINTS.VOLUNTEERS, {
        method: 'GET'
      });

      let volunteers = response.data;

      // Aplica filtros
      if (filters.projectId) {
        // Filtra voluntários por projeto (simulação)
        volunteers = volunteers.filter(v => v.projectId === filters.projectId);
      }

      if (filters.status) {
        volunteers = volunteers.filter(v => v.status === filters.status);
      }

      return volunteers;

    } catch (error) {
      console.error('Erro ao carregar voluntários:', error);
      throw error;
    }
  }

  async registerVolunteer(volunteerData) {
    try {
      const response = await this.api.request(CONSTANTS.API_ENDPOINTS.VOLUNTEERS, {
        method: 'POST',
        data: volunteerData
      });

      eventBus.emit('volunteerRegistered', { volunteer: response.data });
      
      return response.data;

    } catch (error) {
      console.error('Erro ao registrar voluntário:', error);
      throw error;
    }
  }

  // Gerenciamento de Doações
  async getDonations(filters = {}) {
    try {
      const response = await this.api.request(CONSTANTS.API_ENDPOINTS.DONATIONS, {
        method: 'GET'
      });

      let donations = response.data;

      // Aplica filtros
      if (filters.projectId) {
        donations = donations.filter(d => d.projectId === filters.projectId);
      }

      if (filters.dateRange) {
        donations = donations.filter(d => {
          const donationDate = new Date(d.created);
          return donationDate >= filters.dateRange.start &&
                 donationDate <= filters.dateRange.end;
        });
      }

      return donations;

    } catch (error) {
      console.error('Erro ao carregar doações:', error);
      throw error;
    }
  }

  async createDonation(donationData) {
    try {
      const response = await this.api.request(CONSTANTS.API_ENDPOINTS.DONATIONS, {
        method: 'POST',
        data: donationData
      });

      eventBus.emit('donationCreated', { donation: response.data });
      
      return response.data;

    } catch (error) {
      console.error('Erro ao processar doação:', error);
      throw error;
    }
  }

  // Estatísticas
  async getStats() {
    const cacheKey = 'stats';
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      // Calcula estatísticas baseadas nos dados existentes
      const projects = await this.getProjects();
      const volunteers = await this.getVolunteers();
      const donations = await this.getDonations();

      const stats = {
        totalProjects: projects.length,
        activeProjects: projects.filter(p => p.status === 'active').length,
        totalVolunteers: volunteers.length,
        activeVolunteers: volunteers.filter(v => v.status === 'active').length,
        totalDonations: donations.length,
        totalRaised: donations.reduce((sum, d) => sum + d.amount, 0),
        avgDonation: donations.length > 0 ? 
          donations.reduce((sum, d) => sum + d.amount, 0) / donations.length : 0
      };

      this.cache.set(cacheKey, stats);
      return stats;

    } catch (error) {
      console.error('Erro ao calcular estatísticas:', error);
      throw error;
    }
  }

  // Sistema de Subscribe/Notify para atualizações em tempo real
  subscribe(dataType, callback) {
    if (!this.subscribers.has(dataType)) {
      this.subscribers.set(dataType, new Set());
    }
    this.subscribers.get(dataType).add(callback);
  }

  unsubscribe(dataType, callback) {
    if (this.subscribers.has(dataType)) {
      this.subscribers.get(dataType).delete(callback);
    }
  }

  notifySubscribers(dataType, action, data) {
    if (this.subscribers.has(dataType)) {
      this.subscribers.get(dataType).forEach(callback => {
        try {
          callback({ type: dataType, action, data });
        } catch (error) {
          console.error('Erro no subscriber:', error);
        }
      });
    }
  }

  // Utilitários
  sortProjects(projects, sortBy) {
    const sorted = [...projects];
    
    switch (sortBy) {
      case 'newest':
        return sorted.sort((a, b) => new Date(b.created) - new Date(a.created));
      
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.created) - new Date(b.created));
      
      case 'most-funded':
        return sorted.sort((a, b) => (b.raised / b.goal) - (a.raised / a.goal));
      
      case 'least-funded':
        return sorted.sort((a, b) => (a.raised / a.goal) - (b.raised / b.goal));
      
      case 'most-volunteers':
        return sorted.sort((a, b) => b.volunteers - a.volunteers);
      
      default:
        return sorted;
    }
  }

  clearCache() {
    this.cache.clear();
    console.log('Cache limpo');
  }

  clearCacheByPrefix(prefix) {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  async handleDataUpdate({ type, action, data }) {
    try {
      switch (type) {
        case 'projects':
          await this.handleProjectUpdate(action, data);
          break;
        case 'volunteers':
          await this.handleVolunteerUpdate(action, data);
          break;
        case 'donations':
          await this.handleDonationUpdate(action, data);
          break;
      }
    } catch (error) {
      console.error('Erro na atualização de dados:', error);
      throw error;
    }
  }

  async handleProjectUpdate(action, data) {
    // Lógica específica para atualização de projetos
    this.clearCacheByPrefix('projects');
    this.clearCacheByPrefix('stats');
  }

  async handleVolunteerUpdate(action, data) {
    // Lógica específica para atualização de voluntários
    this.clearCacheByPrefix('stats');
  }

  async handleDonationUpdate(action, data) {
    // Lógica específica para atualização de doações
    this.clearCacheByPrefix('stats');
  }
}