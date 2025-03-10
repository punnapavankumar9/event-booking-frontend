import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { OrderReqDetails, OrderResDetails } from '../types';


@Injectable({providedIn: 'root'})
export class OrderService {

  ordersUrl = environment.orders;

  constructor(private http: HttpClient) {
  }

  public createOrder(order: OrderReqDetails) {
    return this.http.post<OrderResDetails>(this.ordersUrl, order);
  }

  public cancelOrder(orderId: string) {
    return this.http.get<OrderResDetails>(this.ordersUrl + "/cancel-order/" + orderId);
  }

  public markOrderAsSuccess(orderId: string, paymentId: string) {
    return this.http.get<OrderResDetails>(this.ordersUrl + "/payment-success/" + orderId + "?paymentId=" + paymentId);
  }

  public markOrderAsFailure(orderId: string, paymentId: string) {
    return this.http.get<OrderResDetails>(this.ordersUrl + "/payment-failed/" + orderId + "?paymentId=" + paymentId);
  }

  public getOrderResDetails(orderId: string) {
    return this.http.get<OrderResDetails>(this.ordersUrl + "/" + orderId);
  }
}
