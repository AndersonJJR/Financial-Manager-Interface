import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');
const envPath = resolve(rootDir, '.env');
const envFallbackPath = resolve(rootDir, '.env.example');

function parseEnvFile(filePath) {
  if (!existsSync(filePath)) {
    return {};
  }
  const content = readFileSync(filePath, 'utf-8');
  const result = {};
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) {
      continue;
    }
    const separatorIndex = line.indexOf('=');
    if (separatorIndex === -1) {
      continue;
    }
    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, '');
    result[key] = value;
  }
  return result;
}

const envVars = {
  ...parseEnvFile(envFallbackPath),
  ...parseEnvFile(envPath),
};

const apiBaseUrl = envVars.API_BASE_URL || '/api/v1';
const backendTargetUrl = envVars.BACKEND_TARGET_URL || 'http://localhost:8080';
const jwtStorageKey = envVars.JWT_STORAGE_KEY || 'fm_obsidian_jwt_token';
const userStorageKey = envVars.USER_STORAGE_KEY || 'fm_obsidian_user_profile';
const jwtIssuer = envVars.JWT_ISSUER || 'financial-manager-api';
const httpTimeoutMs = Number(envVars.HTTP_TIMEOUT_MS || 15000);
const defaultLocale = envVars.DEFAULT_LOCALE || 'pt-BR';
const defaultCurrency = envVars.DEFAULT_CURRENCY || 'BRL';

const envTsPath = resolve(rootDir, 'src/environments/environment.ts');
mkdirSync(dirname(envTsPath), { recursive: true });

const environmentContent = `import { AppConfig } from '../app/core/config/app-config.interface';

export const environment: AppConfig = {
  production: false,
  apiBaseUrl: '${apiBaseUrl}',
  backendTargetUrl: '${backendTargetUrl}',
  jwtStorageKey: '${jwtStorageKey}',
  userStorageKey: '${userStorageKey}',
  jwtIssuer: '${jwtIssuer}',
  httpTimeoutMs: ${httpTimeoutMs},
  defaultLocale: '${defaultLocale}',
  defaultCurrency: '${defaultCurrency}',
};
`;

writeFileSync(envTsPath, environmentContent, 'utf-8');

const proxyConfigPath = resolve(rootDir, 'proxy.conf.json');
const proxyConfigContent = JSON.stringify(
  {
    '/api': {
      target: backendTargetUrl,
      secure: false,
      changeOrigin: true,
      logLevel: 'warn',
    },
  },
  null,
  2
);
writeFileSync(proxyConfigPath, proxyConfigContent + '\n', 'utf-8');
