import { InjectionToken } from '@angular/core';
import { AppConfig } from './app-config.interface';
import { environment } from '../../../environments/environment';

export const APP_CONFIG = new InjectionToken<AppConfig>('APP_CONFIG', {
  providedIn: 'root',
  factory: () => environment,
});
