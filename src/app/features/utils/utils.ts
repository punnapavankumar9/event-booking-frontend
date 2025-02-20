import { HttpContext, HttpHeaders } from "@angular/common/http";
import { AnyObject } from "../../types";
import { AuthService } from '../auth/services/auth.service';
import { AbstractControl } from '@angular/forms';
import { SKIP_LOADER } from '../../global.tokens';


export function headersWithToken(authService: AuthService, headers?: AnyObject): HttpHeaders {
  const token = authService.authToken();
  if (!token) return headers as unknown as HttpHeaders;
  if (headers) {
    (headers as any).Authorization = "Bearer " + token;
  } else {
    headers = {Authorization: "Bearer " + token}
  }
  return headers as unknown as HttpHeaders;
}


export function hasError(control: AbstractControl, errorType: string | undefined = undefined): boolean {
  if (!errorType) {
    return ((control && Object.keys(control.errors ?? {}).length > 0) && (control.touched || control.dirty));
  }
  return (control && control.hasError(errorType) && (control.touched || control.dirty));
}

export function getSkipLoaderHttpContext(httpContext?: HttpContext) {
  if (httpContext) {
    httpContext.set(SKIP_LOADER, true);
  } else {
    httpContext = new HttpContext();
    httpContext.set(SKIP_LOADER, true);
  }
  return httpContext;
}
