import { Component, OnInit } from '@angular/core';
import { ToastService } from '../services/toast.service';
import { Toast } from '../types';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-toast',
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss'
})
export class ToastComponent implements OnInit {
  toasts: Toast[] = [];

  constructor(private toastService: ToastService) {
  }

  ngOnInit(): void {
    this.toastService.toast$.subscribe((toast: Toast) => {
      // Push the new toast into the array
      this.toasts.push(toast);
      // Auto-dismiss the toast after a delay (default to 3000ms)
      setTimeout(() => this.removeToast(toast), toast.delay || 3000);
    });
  }

  removeToast(toast: Toast) {
    this.toasts = this.toasts.filter(t => t !== toast);
  }

  getToastClass(toast: Toast) {
    switch (toast.type) {
      case 'success':
        return 'bg-success text-white';
      case 'error':
        return 'bg-danger text-white';
      case 'info':
        return 'bg-info text-white';
      case 'warning':
        return 'bg-warning text-dark';
      default:
        return '';
    }
  }

}
