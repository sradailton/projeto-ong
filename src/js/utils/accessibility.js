// Módulo de acessibilidade
export class AccessibilityManager {
    constructor() {
        this.isHighContrast = false;
        this.fontSize = 100; // percent
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupPreferences();
        this.announcePageLoad();
    }

    setupEventListeners() {
        // Toggle alto contraste
        const contrastToggle = document.getElementById('high-contrast-toggle');
        if (contrastToggle) {
            contrastToggle.addEventListener('click', () => this.toggleHighContrast());
        }

        // Controles de tamanho de fonte
        const fontSizeIncrease = document.getElementById('font-size-increase');
        const fontSizeDecrease = document.getElementById('font-size-decrease');
        const fontSizeReset = document.getElementById('font-size-reset');

        if (fontSizeIncrease) {
            fontSizeIncrease.addEventListener('click', () => this.changeFontSize(10));
        }
        if (fontSizeDecrease) {
            fontSizeDecrease.addEventListener('click', () => this.changeFontSize(-10));
        }
        if (fontSizeReset) {
            fontSizeReset.addEventListener('click', () => this.resetFontSize());
        }

        // Navegação por teclado
        document.addEventListener('keydown', (e) => this.handleKeyboardNavigation(e));
    }

    setupPreferences() {
        // Respeita preferências do sistema
        this.setupReducedMotion();
        this.setupColorScheme();
        this.loadUserPreferences();
    }

    setupReducedMotion() {
        const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        
        if (reducedMotionQuery.matches) {
            document.documentElement.classList.add('reduced-motion');
        }

        reducedMotionQuery.addEventListener('change', (e) => {
            if (e.matches) {
                document.documentElement.classList.add('reduced-motion');
            } else {
                document.documentElement.classList.remove('reduced-motion');
            }
        });
    }

    setupColorScheme() {
        const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        const updateTheme = (e) => {
            if (e.matches) {
                document.documentElement.setAttribute('data-theme', 'dark');
            } else {
                document.documentElement.setAttribute('data-theme', 'light');
            }
        };

        updateTheme(darkModeQuery);
        darkModeQuery.addEventListener('change', updateTheme);
    }

    loadUserPreferences() {
        // Carrega preferências do localStorage
        const highContrast = localStorage.getItem('highContrast') === 'true';
        const savedFontSize = localStorage.getItem('fontSize');

        if (highContrast) {
            this.enableHighContrast();
        }

        if (savedFontSize) {
            this.fontSize = parseInt(savedFontSize);
            this.applyFontSize();
        }
    }

    toggleHighContrast() {
        this.isHighContrast = !this.isHighContrast;
        
        if (this.isHighContrast) {
            this.enableHighContrast();
        } else {
            this.disableHighContrast();
        }

        // Atualiza localStorage
        localStorage.setItem('highContrast', this.isHighContrast.toString());

        // Anuncia mudança para leitores de tela
        this.announce(this.isHighContrast ? 
            'Modo alto contraste ativado' : 
            'Modo alto contraste desativado'
        );
    }

    enableHighContrast() {
        document.documentElement.classList.add('high-contrast');
        const toggle = document.getElementById('high-contrast-toggle');
        if (toggle) {
            toggle.setAttribute('aria-pressed', 'true');
            toggle.textContent = 'Alto Contraste ✓';
        }
        this.isHighContrast = true;
    }

    disableHighContrast() {
        document.documentElement.classList.remove('high-contrast');
        const toggle = document.getElementById('high-contrast-toggle');
        if (toggle) {
            toggle.setAttribute('aria-pressed', 'false');
            toggle.textContent = 'Alto Contraste';
        }
        this.isHighContrast = false;
    }

    changeFontSize(delta) {
        this.fontSize = Math.max(80, Math.min(150, this.fontSize + delta));
        this.applyFontSize();
        localStorage.setItem('fontSize', this.fontSize.toString());
        
        this.announce(`Tamanho da fonte ajustado para ${this.fontSize}%`);
    }

    resetFontSize() {
        this.fontSize = 100;
        this.applyFontSize();
        localStorage.removeItem('fontSize');
        this.announce('Tamanho da fonte redefinido');
    }

    applyFontSize() {
        document.documentElement.style.fontSize = `${this.fontSize}%`;
    }

    handleKeyboardNavigation(e) {
        // Skip links
        if (e.key === 'Tab') {
            this.handleFirstTab(e);
        }

        // Navegação em dropdowns
        if (e.key === 'Enter' || e.key === ' ') {
            this.handleDropdownKeyboard(e);
        }

        // Fechar modais com ESC
        if (e.key === 'Escape') {
            this.closeOpenModals();
        }
    }

    handleFirstTab(e) {
        if (e.key === 'Tab') {
            document.body.classList.add('user-is-tabbing');
            window.removeEventListener('keydown', this.handleFirstTab);
        }
    }

    handleDropdownKeyboard(e) {
        const target = e.target;
        if (target.classList.contains('dropdown-toggle')) {
            e.preventDefault();
            target.click();
        }
    }

    closeOpenModals() {
        const openModals = document.querySelectorAll('.modal.active');
        openModals.forEach(modal => {
            const closeButton = modal.querySelector('[data-modal-close]');
            if (closeButton) {
                closeButton.click();
            }
        });
    }

    announce(message, priority = 'polite') {
        const announcer = document.getElementById('a11y-announcer') || this.createAnnouncer();
        announcer.setAttribute('aria-live', priority);
        announcer.textContent = message;
        
        // Limpa após anunciar
        setTimeout(() => {
            announcer.textContent = '';
        }, 1000);
    }

    createAnnouncer() {
        const announcer = document.createElement('div');
        announcer.id = 'a11y-announcer';
        announcer.setAttribute('aria-live', 'polite');
        announcer.setAttribute('aria-atomic', 'true');
        announcer.className = 'sr-only';
        document.body.appendChild(announcer);
        return announcer;
    }

    announcePageLoad() {
        // Anuncia que a página carregou para leitores de tela
        setTimeout(() => {
            const pageTitle = document.title || 'Página sem título';
            this.announce(`${pageTitle} carregada`);
        }, 100);
    }

    // Validação de acessibilidade em tempo real
    validateAccessibility() {
        const issues = [];

        // Verifica alt texts
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            if (!img.hasAttribute('alt') && !img.hasAttribute('aria-hidden')) {
                issues.push(`Imagem sem texto alternativo: ${img.src}`);
            }
        });

        // Verifica labels de formulários
        const formInputs = document.querySelectorAll('input, select, textarea');
        formInputs.forEach(input => {
            if (!input.hasAttribute('aria-label') && !input.hasAttribute('aria-labelledby') && !input.closest('label')) {
                issues.push(`Campo de formulário sem label: ${input.name || input.type}`);
            }
        });

        // Verifica contraste (simulação)
        this.checkColorContrast();

        return issues;
    }

    checkColorContrast() {
        // Implementação simplificada de verificação de contraste
        const textElements = document.querySelectorAll('p, span, h1, h2, h3, h4, h5, h6');
        textElements.forEach(el => {
            const style = window.getComputedStyle(el);
            const color = style.color;
            const bgColor = style.backgroundColor;
            
            // Aqui você implementaria a lógica real de cálculo de contraste
            // Por simplicidade, apenas registramos
            console.log('Verificando contraste para:', el.textContent?.substring(0, 30));
        });
    }
}

// Inicializa o gerenciador de acessibilidade
export const a11y = new AccessibilityManager();