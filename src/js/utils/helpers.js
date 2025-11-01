// Funções auxiliares
import { CONSTANTS } from './constants.js';

export class Helpers {
  // Debounce para otimizar eventos
  static debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        timeout = null;
        if (!immediate) func(...args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func(...args);
    };
  }

  // Formatação de dados
  static formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  static formatDate(date) {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
  }

  static formatCPF(cpf) {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  static formatPhone(phone) {
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }

  static formatCEP(cep) {
    return cep.replace(/(\d{5})(\d{3})/, '$1-$2');
  }

  // Validações
  static isValidEmail(email) {
    return CONSTANTS.VALIDATION.EMAIL_REGEX.test(email);
  }

  static isValidCPF(cpf) {
    const cleaned = cpf.replace(/\D/g, '');
    if (cleaned.length !== 11) return false;
    
    // Validação simples de CPF
    if (/^(\d)\1+$/.test(cleaned)) return false;
    
    return CONSTANTS.VALIDATION.CPF_REGEX.test(cpf);
  }

  static isValidPhone(phone) {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length === 11 && CONSTANTS.VALIDATION.PHONE_REGEX.test(phone);
  }

  static isValidCEP(cep) {
    const cleaned = cep.replace(/\D/g, '');
    return cleaned.length === 8 && CONSTANTS.VALIDATION.CEP_REGEX.test(cep);
  }

  static calculateAge(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }

  // Manipulação de dados
  static deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  static generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // LocalStorage
  static getStorage(key) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Erro ao ler do localStorage:', error);
      return null;
    }
  }

  static setStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Erro ao salvar no localStorage:', error);
      return false;
    }
  }

  static removeStorage(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Erro ao remover do localStorage:', error);
      return false;
    }
  }

  // DOM Helpers
  static createElement(tag, classes = [], attributes = {}) {
    const element = document.createElement(tag);
    if (classes.length) {
      element.classList.add(...classes);
    }
    Object.keys(attributes).forEach(key => {
      element.setAttribute(key, attributes[key]);
    });
    return element;
  }

  static showElement(element) {
    element.style.display = '';
    element.classList.remove('hidden');
  }

  static hideElement(element) {
    element.style.display = 'none';
    element.classList.add('hidden');
  }
}