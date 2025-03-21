import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authTokenInterceptor } from './features/core/interceptors/auth-token.interceptor';
import { loadingStatusInterceptor } from './features/core/interceptors/loading.interceptor';
import { errorHandlerInterceptor } from './features/core/interceptors/error-handler.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({eventCoalescing: true}),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([loadingStatusInterceptor, authTokenInterceptor, errorHandlerInterceptor])),
  ]
};
