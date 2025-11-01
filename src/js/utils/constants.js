// Constantes da aplicação
export const CONSTANTS = {
  // LocalStorage Keys
  STORAGE_KEYS: {
    USER_DATA: 'ong_connect_user_data',
    PROJECTS: 'ong_connect_projects',
    VOLUNTEERS: 'ong_connect_volunteers',
    DONATIONS: 'ong_connect_donations'
  },

  // API Endpoints (simulados)
  API_ENDPOINTS: {
    PROJECTS: '/api/projects',
    VOLUNTEERS: '/api/volunteers',
    DONATIONS: '/api/donations',
    USERS: '/api/users'
  },

  // Validação
  VALIDATION: {
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE_REGEX: /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
    CPF_REGEX: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
    CEP_REGEX: /^\d{5}-\d{3}$/,
    MIN_AGE: 16,
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif']
  },

  // Estados da aplicação
  STATES: {
    LOADING: 'loading',
    SUCCESS: 'success',
    ERROR: 'error',
    IDLE: 'idle'
  },

  // Mensagens
  MESSAGES: {
    FORM: {
      REQUIRED: 'Este campo é obrigatório.',
      INVALID_EMAIL: 'Por favor, insira um e-mail válido.',
      INVALID_PHONE: 'Telefone inválido. Use o formato (11) 99999-9999.',
      INVALID_CPF: 'CPF inválido. Use o formato 999.999.999-99.',
      INVALID_CEP: 'CEP inválido. Use o formato 99999-999.',
      MIN_AGE: `É necessário ter pelo menos ${this.VALIDATION.MIN_AGE} anos.`,
      SUCCESS: 'Formulário enviado com sucesso!',
      ERROR: 'Erro ao enviar formulário. Tente novamente.'
    },
    AUTH: {
      LOGIN_SUCCESS: 'Login realizado com sucesso!',
      LOGOUT_SUCCESS: 'Logout realizado com sucesso!',
      UNAUTHORIZED: 'Você precisa estar logado para acessar esta página.'
    }
  }
};