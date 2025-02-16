import { Injectable, signal } from '@angular/core';

@Injectable({providedIn: 'root'})
export class LoadingService {

  private activeRequests = 0;
  private loadingSignal = signal(false);

  get isLoading() {
    return this.loadingSignal.asReadonly();
  }

  show() {
    this.activeRequests++;
    this.updateLoadingStatus();
  }

  hide() {
    if (this.activeRequests > 0) {
      this.activeRequests--;
    }
    this.updateLoadingStatus();
  }

  private updateLoadingStatus() {
    this.loadingSignal.set(this.activeRequests > 0);
  }
}
