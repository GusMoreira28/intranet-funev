// config/api.ts
interface ApiConfig {
  fastapi: string;
  strapi: string;
}

const getApiConfig = (): ApiConfig => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (isDevelopment) {
    // URLs para desenvolvimento local
    return {
      fastapi: process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://127.0.0.1:8000',
      strapi: process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337',
    };
  } else {
    // URLs para produção (PM2)
    return {
      fastapi: process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://172.16.0.23:8000',
      strapi: process.env.NEXT_PUBLIC_STRAPI_URL || 'http://172.16.0.23:1337',
    };
  }
};

export const API_CONFIG = getApiConfig();

// Funções helper para construir URLs
export const buildFastApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.fastapi}${endpoint}`;
};

export const buildStrapiUrl = (endpoint: string): string => {
  return `${API_CONFIG.strapi}/api${endpoint}`;
};