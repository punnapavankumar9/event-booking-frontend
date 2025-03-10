import { Component, input, OnChanges, SimpleChanges } from '@angular/core';
import { NgIf } from '@angular/common';
// @ts-ignore
import * as QRCode from 'qrcode';

@Component({
  selector: 'app-qr-code',
  template: `
    <div class="qr-container">
      <div class="qr-image" *ngIf="qrDataUrl">
        <img [src]="qrDataUrl" alt="QR Code"/>
      </div>
      <div class="qr-loading" *ngIf="!qrDataUrl">
        <div class="spinner"></div>
      </div>
    </div>
  `,
  imports: [
    NgIf
  ],
  styles: [`
    .qr-container {
      width: 200px;
      height: 200px;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: white;
      padding: 0.75rem;
      border-radius: 0.5rem;
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    }

    .qr-image img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    .qr-loading {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      height: 100%;
    }

    .spinner {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 2px solid rgba(236, 72, 153, 0.1);
      border-top-color: #ec4899;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  `]
})
export class QrCodeComponent implements OnChanges {
  qrData = input.required<string>();
  qrDataUrl: string | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['qrData'] && this.qrData()) {
      this.generateQrCode(this.qrData());
    }
  }

  private async generateQrCode(data: string) {
    try {
      this.qrDataUrl = await QRCode.toDataURL(data);
    } catch (err) {
      console.error('QR Code generation failed', err);
    }
  }

}
