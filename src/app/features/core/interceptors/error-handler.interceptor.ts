import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { tap } from 'rxjs';
import { inject } from '@angular/core';
import { ToastService } from '../services/toast.service';
import { AuthService } from '../../auth/services/auth.service';

export const errorHandlerInterceptor: HttpInterceptorFn = (req, next) => {


  return next(req).pipe(tap({
    error: (err) => {
      const toast = inject(ToastService);
      const authService = inject(AuthService);
      if (err instanceof HttpErrorResponse) {
        if (err.status == 401) {
          toast.showToast({message: 'Authentication error please try Signing in', type: 'error'});
          authService.validateAuthentication();
        }
      }
    }
  }));
}
