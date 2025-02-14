import { HttpHeaders } from "@angular/common/http";
import { AnyObject } from "../../types";


export function headersWithToken(headers?: AnyObject): HttpHeaders {
  const token = localStorage.getItem('jwt-token');
  if (!token) return headers as unknown as HttpHeaders;
  if (headers) {
    (headers as any).Authorization = "Bearer " + token;
  } else {
    headers = {Authorization: "Bearer " + token}
  }
  return headers as unknown as HttpHeaders;
}
