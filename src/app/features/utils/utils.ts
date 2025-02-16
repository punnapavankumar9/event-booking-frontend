import { HttpHeaders } from "@angular/common/http";
import { AnyObject } from "../../types";
import { AuthService } from '../auth/services/auth.service';


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
