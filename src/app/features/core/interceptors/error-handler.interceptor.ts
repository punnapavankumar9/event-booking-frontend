import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { tap } from 'rxjs';
import { inject } from '@angular/core';
import { ToastService } from '../services/toast.service';
import { AuthService } from '../../auth/services/auth.service';

export const errorHandlerInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);
  const authService = inject(AuthService);
  return next(req).pipe(tap({
    error: (err) => {
      if (err instanceof HttpErrorResponse) {
        if (err.status == 401 || err.status == 403) {
          toast.showToast({message: 'Authentication error please try Signing in', type: 'error'});
          authService.authToken.set(null);
        }
      }
    }
  }));
}
