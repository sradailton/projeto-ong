// Simulador de API para dados locais
import { Helpers } from '../utils/helpers.js';
import { CONSTANTS } from '../utils/constants.js';

export class ApiSimulator {
  constructor() {
    this.delay = 1000; // Simula delay de rede
    this.initStorage();
  }

  initStorage() {
    // Inicializa dados padrão se não existirem
    if (!Helpers.getStorage(CONSTANTS.STORAGE_KEYS.PROJECTS)) {
      const defaultProjects = [
        {
          id: Helpers.generateId(),
          title: 'Educação para Todos',
          description: 'Projeto que oferece aulas de reforço escolar para crianças em situação de vulnerabilidade social.',
          category: 'educacao',
          location: 'São Paulo, SP',
          status: 'active',
          volunteers: 50,
          goal: 50000,
          raised: 32500,
          image: 'assets/images/hero-home.jpg',
          created: new Date().toISOString()
        },
        {
          id: Helpers.generateId(),
          title: 'Reflorestamento Urbano',
          description: 'Iniciativa de plantio de árvores nativas em áreas urbanas para melhorar a qualidade do ar.',
          category: 'meio-ambiente',
          location: 'Belo Horizonte, MG',
          status: 'active',
          volunteers: 30,
          goal: 30000,
          raised: 12600,
          image: 'assets/images/hero-home.jpg',
          created: new Date().toISOString()
        }
      ];
      Helpers.setStorage(CONSTANTS.STORAGE_KEYS.PROJECTS, defaultProjects);
    }

    if (!Helpers.getStorage(CONSTANTS.STORAGE_KEYS.VOLUNTEERS)) {
      Helpers.setStorage(CONSTANTS.STORAGE_KEYS.VOLUNTEERS, []);
    }

    if (!Helpers.getStorage(CONSTANTS.STORAGE_KEYS.DONATIONS)) {
      Helpers.setStorage(CONSTANTS.STORAGE_KEYS.DONATIONS, []);
    }
  }

  // Simula requisição HTTP
  async request(endpoint, options = {}) {
    await new Promise(resolve => setTimeout(resolve, this.delay));

    try {
      const { method = 'GET', data } = options;
      
      switch (endpoint) {
        case CONSTANTS.API_ENDPOINTS.PROJECTS:
          return this.handleProjects(method, data);
        
        case CONSTANTS.API_ENDPOINTS.VOLUNTEERS:
          return this.handleVolunteers(method, data);
        
        case CONSTANTS.API_ENDPOINTS.DONATIONS:
          return this.handleDonations(method, data);
        
        case CONSTANTS.API_ENDPOINTS.USERS:
          return this.handleUsers(method, data);
        
        default:
          throw new Error(`Endpoint não encontrado: ${endpoint}`);
      }
    } catch (error) {
      throw new Error(`Erro na requisição: ${error.message}`);
    }
  }

  // Manipulação de Projetos
  async handleProjects(method, data) {
    const projects = Helpers.getStorage(CONSTANTS.STORAGE_KEYS.PROJECTS) || [];

    switch (method) {
      case 'GET':
        return { success: true, data: projects };
      
      case 'POST':
        const newProject = {
          id: Helpers.generateId(),
          ...data,
          created: new Date().toISOString(),
          status: 'active',
          volunteers: 0,
          raised: 0
        };
        projects.push(newProject);
        Helpers.setStorage(CONSTANTS.STORAGE_KEYS.PROJECTS, projects);
        return { success: true, data: newProject };
      
      case 'PUT':
        const index = projects.findIndex(p => p.id === data.id);
        if (index === -1) {
          throw new Error('Projeto não encontrado');
        }
        projects[index] = { ...projects[index], ...data };
        Helpers.setStorage(CONSTANTS.STORAGE_KEYS.PROJECTS, projects);
        return { success: true, data: projects[index] };
      
      default:
        throw new Error(`Método não suportado: ${method}`);
    }
  }

  // Manipulação de Voluntários
  async handleVolunteers(method, data) {
    const volunteers = Helpers.getStorage(CONSTANTS.STORAGE_KEYS.VOLUNTEERS) || [];

    switch (method) {
      case 'GET':
        return { success: true, data: volunteers };
      
      case 'POST':
        const newVolunteer = {
          id: Helpers.generateId(),
          ...data,
          created: new Date().toISOString(),
          status: 'active'
        };
        volunteers.push(newVolunteer);
        Helpers.setStorage(CONSTANTS.STORAGE_KEYS.VOLUNTEERS, volunteers);
        return { success: true, data: newVolunteer };
      
      default:
        throw new Error(`Método não suportado: ${method}`);
    }
  }

  // Manipulação de Doações
  async handleDonations(method, data) {
    const donations = Helpers.getStorage(CONSTANTS.STORAGE_KEYS.DONATIONS) || [];

    switch (method) {
      case 'GET':
        return { success: true, data: donations };
      
      case 'POST':
        const newDonation = {
          id: Helpers.generateId(),
          ...data,
          created: new Date().toISOString(),
          status: 'completed'
        };
        donations.push(newDonation);
        Helpers.setStorage(CONSTANTS.STORAGE_KEYS.DONATIONS, donations);

        // Atualiza valor arrecadado no projeto
        if (data.projectId) {
          const projects = Helpers.getStorage(CONSTANTS.STORAGE_KEYS.PROJECTS) || [];
          const projectIndex = projects.findIndex(p => p.id === data.projectId);
          if (projectIndex !== -1) {
            projects[projectIndex].raised += data.amount;
            Helpers.setStorage(CONSTANTS.STORAGE_KEYS.PROJECTS, projects);
          }
        }

        return { success: true, data: newDonation };
      
      default:
        throw new Error(`Método não suportado: ${method}`);
    }
  }

  // Manipulação de Usuários
  async handleUsers(method, data) {
    const users = Helpers.getStorage(CONSTANTS.STORAGE_KEYS.USER_DATA) || [];

    switch (method) {
      case 'POST': // Registro ou Login
        const user = {
          id: Helpers.generateId(),
          ...data,
          created: new Date().toISOString()
        };
        users.push(user);
        Helpers.setStorage(CONSTANTS.STORAGE_KEYS.USER_DATA, users);
        return { success: true, data: user };
      
      case 'GET': // Buscar usuário
        const foundUser = users.find(u => u.email === data.email);
        if (!foundUser) {
          throw new Error('Usuário não encontrado');
        }
        return { success: true, data: foundUser };
      
      default:
        throw new Error(`Método não suportado: ${method}`);
    }
  }
}