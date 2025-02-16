import { HttpInterceptorFn } from '@angular/common/http';
import { SKIP_LOADER } from '../../../global.tokens';
import { LoadingService } from '../services/loading.service';
import { inject } from '@angular/core';
import { finalize, timer } from 'rxjs';

export const loadingStatusInterceptor: HttpInterceptorFn = (req, next) => {
  const skipLoader = req.context.get(SKIP_LOADER);
  if (skipLoader) {
    return next(req);
  }
  const loaderService = inject(LoadingService);
  const delay = 1000;

  // Start request immediately
  let spinnerVisible = false;

  // Start a timer that will show the spinner after 'delay' milliseconds.
  const spinnerTimerSubscription = timer(delay).subscribe(() => {
    spinnerVisible = true;
    loaderService.show();
  });

  // Start the HTTP request immediately.
  return next(req).pipe(
    finalize(() => {
      // Cancel the timer if still pending.
      spinnerTimerSubscription.unsubscribe();
      // Hide the spinner if it was shown.
      if (spinnerVisible) {
        loaderService.hide();
      }
    })
  );
}
