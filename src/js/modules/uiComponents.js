// Componentes de UI interativos
import { Helpers } from '../utils/helpers.js';
import { eventBus } from '../utils/eventBus.js';

export class UIComponents {
  constructor() {
    this.components = new Map();
    this.init();
  }

  init() {
    this.registerComponents();
    this.setupGlobalEventListeners();
  }

  registerComponents() {
    // Modal Component
    this.components.set('modal', {
      init: this.initModal.bind(this),
      selector: '[data-modal]'
    });

    // Tab Component
    this.components.set('tabs', {
      init: this.initTabs.bind(this),
      selector: '[data-tabs]'
    });

    // Accordion Component
    this.components.set('accordion', {
      init: this.initAccordion.bind(this),
      selector: '[data-accordion]'
    });

    // Carousel Component
    this.components.set('carousel', {
      init: this.initCarousel.bind(this),
      selector: '[data-carousel]'
    });

    // Filter Component
    this.components.set('filter', {
      init: this.initFilter.bind(this),
      selector: '[data-filter]'
    });

    // Progress Component
    this.components.set('progress', {
      init: this.initProgress.bind(this),
      selector: '[data-progress]'
    });
  }

  setupGlobalEventListeners() {
    // Inicializa componentes quando o DOM é atualizado
    eventBus.on('contentRendered', () => {
      this.initializeAllComponents();
    });

    // Inicializa componentes na carga inicial
    document.addEventListener('DOMContentLoaded', () => {
      this.initializeAllComponents();
    });
  }

  initializeAllComponents() {
    this.components.forEach((component, name) => {
      const elements = document.querySelectorAll(component.selector);
      elements.forEach(element => {
        if (!element.hasAttribute('data-initialized')) {
          component.init(element);
          element.setAttribute('data-initialized', 'true');
        }
      });
    });
  }

  // Modal Component
  initModal(modalElement) {
    const modalId = modalElement.getAttribute('data-modal');
    const triggers = document.querySelectorAll(`[data-modal-trigger="${modalId}"]`);
    const closeButtons = modalElement.querySelectorAll('[data-modal-close]');

    // Abrir modal
    triggers.forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        this.openModal(modalElement);
      });
    });

    // Fechar modal
    closeButtons.forEach(button => {
      button.addEventListener('click', () => {
        this.closeModal(modalElement);
      });
    });

    // Fechar ao clicar no backdrop
    modalElement.addEventListener('click', (e) => {
      if (e.target === modalElement) {
        this.closeModal(modalElement);
      }
    });

    // Fechar com ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modalElement.classList.contains('active')) {
        this.closeModal(modalElement);
      }
    });
  }

  openModal(modalElement) {
    modalElement.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Foco no primeiro elemento interativo
    const focusElement = modalElement.querySelector('input, button, [tabindex]');
    if (focusElement) {
      focusElement.focus();
    }

    eventBus.emit('modalOpened', { modal: modalElement });
  }

  closeModal(modalElement) {
    modalElement.classList.remove('active');
    document.body.style.overflow = '';
    
    eventBus.emit('modalClosed', { modal: modalElement });
  }

  // Tab Component
  initTabs(tabsContainer) {
    const tabButtons = tabsContainer.querySelectorAll('[data-tab]');
    const tabPanes = tabsContainer.querySelectorAll('[data-tab-pane]');

    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        const tabId = button.getAttribute('data-tab');
        
        // Atualiza botões ativos
        tabButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // Atualiza painéis ativos
        tabPanes.forEach(pane => {
          pane.classList.remove('active');
          if (pane.getAttribute('data-tab-pane') === tabId) {
            pane.classList.add('active');
          }
        });

        eventBus.emit('tabChanged', { 
          tabsContainer, 
          tabId 
        });
      });
    });
  }

  // Accordion Component
  initAccordion(accordionContainer) {
    const items = accordionContainer.querySelectorAll('[data-accordion-item]');

    items.forEach(item => {
      const trigger = item.querySelector('[data-accordion-trigger]');
      const content = item.querySelector('[data-accordion-content]');

      if (trigger && content) {
        trigger.addEventListener('click', () => {
          const isOpen = item.classList.contains('active');
          
          // Fecha todos os itens se for accordion exclusivo
          if (accordionContainer.hasAttribute('data-accordion-single')) {
            items.forEach(otherItem => {
              if (otherItem !== item) {
                otherItem.classList.remove('active');
              }
            });
          }
          
          // Alterna estado atual
          item.classList.toggle('active');
          
          // Anima a altura do conteúdo
          if (item.classList.contains('active')) {
            content.style.maxHeight = content.scrollHeight + 'px';
          } else {
            content.style.maxHeight = '0';
          }

          eventBus.emit('accordionToggled', { 
            accordion: accordionContainer, 
            item, 
            isOpen: !isOpen 
          });
        });

        // Inicializa estado fechado
        content.style.maxHeight = '0';
      }
    });
  }

  // Carousel Component
  initCarousel(carouselElement) {
    const track = carouselElement.querySelector('[data-carousel-track]');
    const items = carouselElement.querySelectorAll('[data-carousel-item]');
    const prevButton = carouselElement.querySelector('[data-carousel-prev]');
    const nextButton = carouselElement.querySelector('[data-carousel-next]');
    const dots = carouselElement.querySelectorAll('[data-carousel-dot]');

    if (!track || items.length === 0) return;

    let currentIndex = 0;
    const itemWidth = items[0].getBoundingClientRect().width;

    const updateCarousel = () => {
      track.style.transform = `translateX(-${currentIndex * itemWidth}px)`;
      
      // Atualiza dots
      dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentIndex);
      });

      // Atualiza estado dos botões
      if (prevButton) {
        prevButton.disabled = currentIndex === 0;
      }
      if (nextButton) {
        nextButton.disabled = currentIndex === items.length - 1;
      }

      eventBus.emit('carouselChanged', { 
        carousel: carouselElement, 
        currentIndex 
      });
    };

    // Navegação
    if (prevButton) {
      prevButton.addEventListener('click', () => {
        if (currentIndex > 0) {
          currentIndex--;
          updateCarousel();
        }
      });
    }

    if (nextButton) {
      nextButton.addEventListener('click', () => {
        if (currentIndex < items.length - 1) {
          currentIndex++;
          updateCarousel();
        }
      });
    }

    // Navegação por dots
    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        currentIndex = index;
        updateCarousel();
      });
    });

    // Inicializa
    updateCarousel();
  }

  // Filter Component
  initFilter(filterElement) {
    const filterInput = filterElement.querySelector('[data-filter-input]');
    const filterItems = filterElement.querySelectorAll('[data-filter-item]');
    const noResults = filterElement.querySelector('[data-filter-no-results]');

    if (!filterInput) return;

    const performFilter = Helpers.debounce((searchTerm) => {
      let visibleCount = 0;
      const term = searchTerm.toLowerCase().trim();

      filterItems.forEach(item => {
        const text = item.getAttribute('data-filter-text') || 
                     item.textContent.toLowerCase();
        
        const isVisible = text.includes(term);
        item.style.display = isVisible ? '' : 'none';
        
        if (isVisible) visibleCount++;
      });

      // Mostra/oculta mensagem de nenhum resultado
      if (noResults) {
        noResults.style.display = visibleCount === 0 ? '' : 'none';
      }

      eventBus.emit('filterPerformed', { 
        filter: filterElement, 
        searchTerm, 
        visibleCount 
      });
    }, 300);

    filterInput.addEventListener('input', (e) => {
      performFilter(e.target.value);
    });
  }

  // Progress Component
  initProgress(progressElement) {
    const fill = progressElement.querySelector('[data-progress-fill]');
    const value = progressElement.getAttribute('data-progress-value');
    
    if (fill && value) {
      // Anima a barra de progresso
      setTimeout(() => {
        fill.style.width = value + '%';
      }, 100);

      // Atualiza texto se existir
      const textElement = progressElement.querySelector('[data-progress-text]');
      if (textElement) {
        textElement.textContent = value + '%';
      }
    }
  }

  // Métodos utilitários para criar componentes dinamicamente
  createToast(message, type = 'info', duration = 5000) {
    const toast = Helpers.createElement('div', ['toast', `toast-${type}`]);
    toast.innerHTML = `
      <div class="alert-icon">${this.getToastIcon(type)}</div>
      <div class="alert-content">${message}</div>
      <button class="alert-dismiss">×</button>
    `;

    document.body.appendChild(toast);

    // Remove após a duração
    const removeToast = () => {
      toast.style.animation = 'slideOutRight 0.3s ease-out forwards';
      setTimeout(() => {
        if (toast.parentElement) {
          toast.remove();
        }
      }, 300);
    };

    // Botão de fechar
    const closeButton = toast.querySelector('.alert-dismiss');
    closeButton.addEventListener('click', removeToast);

    // Remove automático
    if (duration > 0) {
      setTimeout(removeToast, duration);
    }

    return toast;
  }

  getToastIcon(type) {
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };
    return icons[type] || 'ℹ';
  }

  // Loading spinner
  showLoading(container, message = 'Carregando...') {
    const loadingElement = Helpers.createElement('div', ['loading-spinner']);
    loadingElement.innerHTML = `
      <div class="spinner"></div>
      <p>${message}</p>
    `;

    if (typeof container === 'string') {
      container = document.querySelector(container);
    }

    if (container) {
      container.appendChild(loadingElement);
    }

    return loadingElement;
  }

  hideLoading(loadingElement) {
    if (loadingElement && loadingElement.parentElement) {
      loadingElement.remove();
    }
  }
}