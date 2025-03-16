import { Component, OnInit, signal } from '@angular/core';
import { OrderResDetails, OrderStatus } from '../../types';
import { OrderService } from '../../services/order.service';
import { Router, RouterLink } from '@angular/router';
import { DatePipe, NgClass } from '@angular/common';

@Component({
  selector: 'app-orders-list',
  standalone: true,
  imports: [NgClass, DatePipe, RouterLink],
  templateUrl: './orders-list.component.html',
  styleUrl: './orders-list.component.scss'
})
export class OrdersListComponent implements OnInit {
  orders = signal<OrderResDetails[]>([]);


  constructor(
    private orderService: OrderService,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadOrders();
  }

  private loadOrders() {
    this.orderService.getOrders().subscribe({
      next: (orders) => {
        this.orders.set(orders);
      }
    });
  }

  getStatusClass(status: OrderStatus): string {
    switch (status) {
      case "SUCCEEDED":
        return 'status-success';
      case "FAILED":
      case "CANCELLED":
        return 'status-failed';
      case "PENDING":
        return 'status-pending';
      default:
        return 'status-created';
    }
  }
} 