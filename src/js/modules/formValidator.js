// Sistema avançado de validação de formulários
import { Helpers } from '../utils/helpers.js';
import { CONSTANTS } from '../utils/constants.js';
import { eventBus } from '../utils/eventBus.js';

export class FormValidator {
  constructor() {
    this.forms = new Map();
    this.validators = new Map();
    this.initDefaultValidators();
  }

  initDefaultValidators() {
    // Validação de campo obrigatório
    this.registerValidator('required', (value, element) => {
      if (!value || value.toString().trim() === '') {
        return CONSTANTS.MESSAGES.FORM.REQUIRED;
      }
      return null;
    });

    // Validação de email
    this.registerValidator('email', (value, element) => {
      if (value && !Helpers.isValidEmail(value)) {
        return CONSTANTS.MESSAGES.FORM.INVALID_EMAIL;
      }
      return null;
    });

    // Validação de telefone
    this.registerValidator('phone', (value, element) => {
      if (value && !Helpers.isValidPhone(value)) {
        return CONSTANTS.MESSAGES.FORM.INVALID_PHONE;
      }
      return null;
    });

    // Validação de CPF
    this.registerValidator('cpf', (value, element) => {
      if (value && !Helpers.isValidCPF(value)) {
        return CONSTANTS.MESSAGES.FORM.INVALID_CPF;
      }
      return null;
    });

    // Validação de CEP
    this.registerValidator('cep', (value, element) => {
      if (value && !Helpers.isValidCEP(value)) {
        return CONSTANTS.MESSAGES.FORM.INVALID_CEP;
      }
      return null;
    });

    // Validação de idade mínima
    this.registerValidator('minAge', (value, element) => {
      if (value) {
        const age = Helpers.calculateAge(value);
        if (age < CONSTANTS.VALIDATION.MIN_AGE) {
          return CONSTANTS.MESSAGES.FORM.MIN_AGE;
        }
      }
      return null;
    });

    // Validação de confirmação de senha
    this.registerValidator('confirmPassword', (value, element) => {
      const passwordField = element.closest('form').querySelector('[name="password"]');
      if (passwordField && value !== passwordField.value) {
        return 'As senhas não coincidem.';
      }
      return null;
    });
  }

  registerValidator(name, validatorFn) {
    this.validators.set(name, validatorFn);
  }

  validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) {
      console.error(`Formulário não encontrado: ${formId}`);
      return { isValid: false, errors: {} };
    }

    const errors = {};
    let isValid = true;

    // Valida todos os campos
    const fields = form.querySelectorAll('[data-validation]');
    fields.forEach(field => {
      const fieldErrors = this.validateField(field);
      if (fieldErrors.length > 0) {
        errors[field.name] = fieldErrors;
        isValid = false;
      }
    });

    return { isValid, errors };
  }

  validateField(field) {
    const validations = field.getAttribute('data-validation').split(' ');
    const value = field.value.trim();
    const errors = [];

    validations.forEach(validation => {
      const validator = this.validators.get(validation);
      if (validator) {
        const error = validator(value, field);
        if (error) {
          errors.push(error);
        }
      }
    });

    // Atualiza estado visual do campo
    this.updateFieldState(field, errors);

    return errors;
  }

  updateFieldState(field, errors) {
    // Remove estados anteriores
    field.classList.remove('valid', 'invalid');
    
    // Remove mensagens de erro existentes
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
      existingError.remove();
    }

    if (field.value.trim() === '') {
      return; // Campo vazio, sem estado específico
    }

    if (errors.length > 0) {
      // Campo inválido
      field.classList.add('invalid');
      
      // Adiciona mensagem de erro
      const errorElement = Helpers.createElement('div', ['field-error'], {
        'role': 'alert',
        'aria-live': 'polite'
      });
      
      errorElement.innerHTML = errors.map(error => 
        `<span class="error-message">${error}</span>`
      ).join('');
      
      field.parentNode.appendChild(errorElement);

    } else {
      // Campo válido
      field.classList.add('valid');
    }
  }

  setupForm(formId, options = {}) {
    const form = document.getElementById(formId);
    if (!form) return;

    const config = {
      realTime: options.realTime !== false,
      onSubmit: options.onSubmit,
      onSuccess: options.onSuccess,
      onError: options.onError,
      ...options
    };

    this.forms.set(formId, config);

    // Validação em tempo real
    if (config.realTime) {
      const fields = form.querySelectorAll('[data-validation]');
      fields.forEach(field => {
        field.addEventListener('blur', () => {
          this.validateField(field);
        });

        field.addEventListener('input', Helpers.debounce(() => {
          if (field.value.trim() !== '') {
            this.validateField(field);
          }
        }, 500));
      });
    }

    // Validação no submit
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleFormSubmit(formId, e);
    });

    console.log(`Formulário ${formId} configurado com sucesso`);
  }

  async handleFormSubmit(formId, event) {
    const form = event.target;
    const config = this.forms.get(formId);
    
    if (!config) return;

    // Mostra estado de carregamento
    this.setFormState(form, CONSTANTS.STATES.LOADING);

    // Valida o formulário
    const { isValid, errors } = this.validateForm(formId);

    if (!isValid) {
      this.setFormState(form, CONSTANTS.STATES.ERROR);
      
      // Mostra erros
      this.showFormErrors(form, errors);
      
      if (config.onError) {
        config.onError(errors);
      }
      
      eventBus.emit('formValidationError', { formId, errors });
      return;
    }

    try {
      // Prepara dados do formulário
      const formData = new FormData(form);
      const data = Object.fromEntries(formData);
      
      // Executa callback de submit
      if (config.onSubmit) {
        await config.onSubmit(data, form);
      }

      // Sucesso
      this.setFormState(form, CONSTANTS.STATES.SUCCESS);
      
      if (config.onSuccess) {
        config.onSuccess(data, form);
      }
      
      eventBus.emit('formValidationSuccess', { formId, data });
      
      // Mostra mensagem de sucesso
      this.showSuccessMessage(form);

    } catch (error) {
      // Erro
      this.setFormState(form, CONSTANTS.STATES.ERROR);
      this.showErrorMessage(form, error.message);
      
      if (config.onError) {
        config.onError({ submit: [error.message] });
      }
      
      eventBus.emit('formValidationError', { 
        formId, 
        errors: { submit: [error.message] } 
      });
    }
  }

  setFormState(form, state) {
    form.classList.remove('form-loading', 'form-success', 'form-error');
    
    switch (state) {
      case CONSTANTS.STATES.LOADING:
        form.classList.add('form-loading');
        break;
      case CONSTANTS.STATES.SUCCESS:
        form.classList.add('form-success');
        break;
      case CONSTANTS.STATES.ERROR:
        form.classList.add('form-error');
        break;
    }

    // Atualiza estado dos botões
    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.disabled = state === CONSTANTS.STATES.LOADING;
      
      if (state === CONSTANTS.STATES.LOADING) {
        submitButton.classList.add('btn-loading');
      } else {
        submitButton.classList.remove('btn-loading');
      }
    }
  }

  showFormErrors(form, errors) {
    // Remove mensagens de erro existentes
    const existingErrors = form.querySelectorAll('.form-global-error');
    existingErrors.forEach(error => error.remove());

    // Cria container de erros globais
    const errorContainer = Helpers.createElement('div', ['alert', 'alert-error', 'form-global-error']);
    
    const errorList = Object.values(errors).flat();
    if (errorList.length > 0) {
      errorContainer.innerHTML = `
        <div class="alert-icon">✕</div>
        <div class="alert-content">
          <strong>Erro no formulário:</strong>
          <ul>
            ${errorList.map(error => `<li>${error}</li>`).join('')}
          </ul>
        </div>
        <button class="alert-dismiss" onclick="this.parentElement.remove()">×</button>
      `;
      
      form.prepend(errorContainer);
    }

    // Rola até o primeiro erro
    const firstErrorField = form.querySelector('.invalid');
    if (firstErrorField) {
      firstErrorField.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
      firstErrorField.focus();
    }
  }

  showSuccessMessage(form) {
    const successContainer = Helpers.createElement('div', ['alert', 'alert-success', 'form-global-success']);
    successContainer.innerHTML = `
      <div class="alert-icon">✓</div>
      <div class="alert-content">
        <strong>Sucesso!</strong>
        ${CONSTANTS.MESSAGES.FORM.SUCCESS}
      </div>
      <button class="alert-dismiss" onclick="this.parentElement.remove()">×</button>
    `;
    
    form.prepend(successContainer);

    // Remove a mensagem após 5 segundos
    setTimeout(() => {
      successContainer.remove();
    }, 5000);
  }

  showErrorMessage(form, message) {
    const errorContainer = Helpers.createElement('div', ['alert', 'alert-error', 'form-global-error']);
    errorContainer.innerHTML = `
      <div class="alert-icon">✕</div>
      <div class="alert-content">
        <strong>Erro:</strong>
        ${message}
      </div>
      <button class="alert-dismiss" onclick="this.parentElement.remove()">×</button>
    `;
    
    form.prepend(errorContainer);
  }

  // Validação específica para o formulário de cadastro
  setupRegistrationForm() {
    this.setupForm('registrationForm', {
      realTime: true,
      onSubmit: async (data) => {
        // Simula envio para API
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Salva nos dados locais
        const api = new (await import('./apiSimulator.js')).ApiSimulator();
        const result = await api.request('api/users', {
          method: 'POST',
          data: data
        });
        
        return result;
      },
      onSuccess: (data, form) => {
        console.log('Cadastro realizado com sucesso:', data);
        form.reset();
        
        // Redireciona ou mostra confirmação
        eventBus.emit('registrationSuccess', { userData: data });
      },
      onError: (errors) => {
        console.error('Erros no cadastro:', errors);
      }
    });
  }

  // Método para validar campos específicos
  validateFieldByName(formId, fieldName) {
    const form = document.getElementById(formId);
    if (!form) return [];

    const field = form.querySelector(`[name="${fieldName}"]`);
    if (!field) return [];

    return this.validateField(field);
  }

  // Verifica se o formulário é válido
  isFormValid(formId) {
    const { isValid } = this.validateForm(formId);
    return isValid;
  }

  // Reseta o estado do formulário
  resetForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return;

    form.reset();
    
    // Remove estados visuais
    const fields = form.querySelectorAll('[data-validation]');
    fields.forEach(field => {
      field.classList.remove('valid', 'invalid');
      
      const errorElement = field.parentNode.querySelector('.field-error');
      if (errorElement) {
        errorElement.remove();
      }
    });

    // Remove mensagens globais
    const globalMessages = form.querySelectorAll('.form-global-error, .form-global-success');
    globalMessages.forEach(message => message.remove());

    form.classList.remove('form-loading', 'form-success', 'form-error');
  }
}