import { Component, input, signal } from '@angular/core';
import { BookingPageInfo, OrderReqDetails, OrderResDetails } from '../../types';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { OrderService } from '../../services/order.service';
import { ToastService } from '../../../core/services/toast.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-order-details',
  imports: [
    DatePipe,
    CurrencyPipe
  ],
  templateUrl: './order-details.component.html',
  styleUrl: './order-details.component.scss'
})
export class OrderDetailsComponent {
  showTaxBreakup = signal<boolean>(true); // Initially show tax breakup
  isDonatingToCharity = signal<boolean>(false);
  orderInfo = input.required<{ order: OrderReqDetails, bookingPageInfo: BookingPageInfo }>();

  orderResDetails = signal<OrderResDetails>(null as any);

  ngOnInit(): void {
    // Initialize any data (e.g., fetch order details from a service)
  }

  constructor(private orderService: OrderService, private toastService: ToastService) {
  }


  proceedToPayment() {
    const options = {
      "key": environment.razorpayId,
      "amount": this.orderResDetails().amount,
      "currency": "INR",
      "name": "Punna's Booking", //your business name
      "description": "Booking movie tickets For" + this.orderInfo().bookingPageInfo.event.name,
      "image": "https://example.com/your_logo",
      "order_id": this.orderResDetails().razorOrderId!,
      "handler": (response: any) => {
        this.orderService.markOrderAsSuccess(this.orderResDetails().id, response.razorpay_payment_id).subscribe({
          next: response => {
            if (response.orderStatus == "SUCCEEDED") {
              this.toastService.showToast({
                message: "payment successfully completed",
                type: "success"
              })
              // TODO navigate to order-confirmation/info
            } else {
              this.toastService.showToast({
                message: "payment processing",
                type: "info"
              });
              // TODO navigate to order-status page
            }
          },
          error: error => {
            this.toastService.showToast({message: error.message, type: "error"});
          }
        });
        // alert(response.razorpay_payment_id);
        // alert(response.razorpay_order_id);
        // alert(response.razorpay_signature)
      },
      "prefill": {
        "name": "Pavan Kumar Punna",
        "email": "pavankumar@gmail.com",
        "contact": "9550015773"
      },
      "notes": {
        "info": JSON.stringify(this.orderResDetails().info, null, 2),
      },
      "theme": {
        "color": "#3399cc"
      }
    };
    // @ts-ignore
    const razorPayWindow = new window.Razorpay(options);
    console.log(razorPayWindow);
    razorPayWindow.on('payment.failed', (response: any) => {
      console.log(response);
      this.orderService.markOrderAsFailure(this.orderResDetails().id, response.error.metadata.payment_id).subscribe({
        next: response => {
          this.toastService.showToast({message: "payment failed", type: "error"});
          // TODO navigate to payment failed page
        },
        error: error => {
          this.toastService.showToast({message: error.message, type: "error"});
        }
      });
      // alert(response.error.code);
      // alert(response.error.description);
      // alert(response.error.source);
      // alert(response.error.step);
      // alert(response.error.reason);
      // alert(response.error.metadata.order_id);
      // alert(response.error.metadata.payment_id);
    });
    razorPayWindow.open();
  }

  createOrder() {
    if (!this.orderResDetails()) {
      this.orderService.createOrder(this.orderInfo().order).subscribe({
        next: orderResDetails => {
          this.orderResDetails.set(orderResDetails)
          this.proceedToPayment();
        },
        error: err => {
          this.toastService.showToast({type: "error", message: err.message});
        }
      });
    } else {
      this.proceedToPayment();
    }
  }

  toggleTaxBreakup(event: Event): void {
    event.preventDefault();
    this.showTaxBreakup.set(!this.showTaxBreakup());
  }

  toggleDonation() {
    this.isDonatingToCharity.update(isDonating => {
      return !isDonating;
    })
  }
}
