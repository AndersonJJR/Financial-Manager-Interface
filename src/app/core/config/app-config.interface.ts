export interface AppConfig {
  readonly production: boolean;
  readonly apiBaseUrl: string;
  readonly backendTargetUrl: string;
  readonly jwtStorageKey: string;
  readonly userStorageKey: string;
  readonly jwtIssuer: string;
  readonly httpTimeoutMs: number;
  readonly defaultLocale: string;
  readonly defaultCurrency: string;
}
