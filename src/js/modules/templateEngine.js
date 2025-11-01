// Motor de templates para SPA
import { Helpers } from '../utils/helpers.js';

export class TemplateEngine {
  constructor() {
    this.templates = new Map();
    this.cache = new Map();
  }

  // Registra um template
  register(name, templateFn) {
    this.templates.set(name, templateFn);
  }

  // Renderiza um template
  render(name, data = {}) {
    const templateFn = this.templates.get(name);
    if (!templateFn) {
      throw new Error(`Template não encontrado: ${name}`);
    }

    // Verifica cache
    const cacheKey = `${name}-${JSON.stringify(data)}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const html = templateFn(data);
    this.cache.set(cacheKey, html);
    
    return html;
  }

  // Limpa o cache
  clearCache() {
    this.cache.clear();
  }

  // Renderiza no elemento DOM
  renderTo(element, name, data = {}) {
    if (typeof element === 'string') {
      element = document.querySelector(element);
    }

    if (!element) {
      throw new Error('Elemento não encontrado');
    }

    const html = this.render(name, data);
    element.innerHTML = html;
    
    // Dispara evento de renderização
    this.triggerRenderEvent(element, name);
  }

  // Dispara eventos personalizados
  triggerRenderEvent(element, templateName) {
    const event = new CustomEvent('templateRendered', {
      detail: {
        template: templateName,
        element: element
      },
      bubbles: true
    });
    element.dispatchEvent(event);
  }

  // Templates pré-definidos
  initDefaultTemplates() {
    // Template de card de projeto
    this.register('project-card', (data) => `
      <div class="project-card card" data-project-id="${data.id}">
        <div class="project-card__image">
          <img src="${data.image}" alt="${data.title}" loading="lazy">
          <div class="project-card__badges">
            <span class="badge badge-primary">${data.category}</span>
            <span class="badge badge-${data.status === 'active' ? 'success' : 'secondary'}">${data.status === 'active' ? 'Ativo' : 'Inativo'}</span>
          </div>
        </div>
        <div class="project-card__content">
          <h3 class="project-card__title">${data.title}</h3>
          <p class="project-card__description">${data.description}</p>
          <div class="project-card__meta">
            <span class="location">📍 ${data.location}</span>
            <span class="volunteers">👥 ${data.volunteers} voluntários</span>
          </div>
          <div class="project-card__progress">
            <div class="progress-bar">
              <div class="progress-fill" data-width="${(data.raised / data.goal) * 100}%"></div>
            </div>
            <div class="progress-text">
              ${Helpers.formatCurrency(data.raised)} de ${Helpers.formatCurrency(data.goal)} (${Math.round((data.raised / data.goal) * 100)}%)
            </div>
          </div>
          <div class="project-card__actions">
            <button class="btn btn-primary btn-sm" data-action="view-project" data-project-id="${data.id}">
              Ver Detalhes
            </button>
            <button class="btn btn-secondary btn-sm" data-action="volunteer-project" data-project-id="${data.id}">
              Quero Ajudar
            </button>
          </div>
        </div>
      </div>
    `);

    // Template de lista de projetos
    this.register('projects-list', (data) => `
      <div class="projects-grid">
        ${data.projects.map(project => this.render('project-card', project)).join('')}
      </div>
      ${data.projects.length === 0 ? `
        <div class="empty-state">
          <h3>Nenhum projeto encontrado</h3>
          <p>Tente ajustar os filtros ou verifique novamente mais tarde.</p>
        </div>
      ` : ''}
    `);

    // Template de alerta
    this.register('alert', (data) => `
      <div class="alert alert-${data.type}">
        <div class="alert-icon">${this.getAlertIcon(data.type)}</div>
        <div class="alert-content">
          ${data.title ? `<strong>${data.title}</strong>` : ''}
          ${data.message}
        </div>
        <button class="alert-dismiss" onclick="this.parentElement.remove()">×</button>
      </div>
    `);
  }

  getAlertIcon(type) {
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };
    return icons[type] || 'ℹ';
  }
}