import { Directive, ElementRef, Renderer2, signal } from '@angular/core';

@Directive({
  selector: '[appImageLoader]',
  standalone: true,
})
export class ImageLoaderDirective {
  isLoading = signal(true);
  private spinnerTimeoutId: any;
  private loaderElement: HTMLElement | null = null;
  delay = 500;

  constructor(private el: ElementRef, private renderer: Renderer2) {
  }

  ngOnInit() {
    const image = this.el.nativeElement as HTMLImageElement;
    const parent = this.renderer.parentNode(image);

    if (!parent) return;

    this.renderer.setStyle(parent, 'position', 'relative');

    // Start a timer to display the loader after the delay
    this.spinnerTimeoutId = setTimeout(() => {
      // Create loader element
      this.loaderElement = this.renderer.createElement('div');
      this.renderer.addClass(this.loaderElement, 'image-loader-spinner');
      this.renderer.appendChild(parent, this.loaderElement);
    }, this.delay);

    // When the image loads or errors, clear the timeout and remove the loader if present
    image.onload = () => this.clearLoader(parent);
    image.onerror = () => this.clearLoader(parent);
  }

  ngOnDestroy() {
    // Clear the timeout if directive is destroyed
    if (this.spinnerTimeoutId) {
      clearTimeout(this.spinnerTimeoutId);
    }
  }

  private clearLoader(parent: any) {
    if (this.spinnerTimeoutId) {
      clearTimeout(this.spinnerTimeoutId);
      this.spinnerTimeoutId = null;
    }
    if (this.loaderElement) {
      this.renderer.removeChild(parent, this.loaderElement);
      this.loaderElement = null;
    }
  }
}
