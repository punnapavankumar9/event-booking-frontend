import { HttpInterceptorFn } from '@angular/common/http';

export const authTokenInterceptor: HttpInterceptorFn = (req, next) => {

  const token: string | null = localStorage.getItem("jwt-token");
  if (token) {
    const clonedReq = req.clone({setHeaders: {Authorization: `Bearer ${token}`}});
    return next(clonedReq);
  }
  return next(req);
};
