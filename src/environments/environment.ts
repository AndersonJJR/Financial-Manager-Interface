import { AppConfig } from '../app/core/config/app-config.interface';

export const environment: AppConfig = {
  production: false,
  apiBaseUrl: '/api/v1',
  backendTargetUrl: 'http://localhost:8080',
  jwtStorageKey: 'fm_obsidian_jwt_token',
  userStorageKey: 'fm_obsidian_user_profile',
  jwtIssuer: 'financial-manager-api',
  httpTimeoutMs: 15000,
  defaultLocale: 'pt-BR',
  defaultCurrency: 'BRL',
};
