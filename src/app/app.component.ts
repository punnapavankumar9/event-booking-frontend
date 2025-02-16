import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from "./features/core/navbar/navbar.component";
import { ToastComponent } from "./features/core/toast/toast.component";
import { LoaderComponent } from './features/core/loader/loader.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [NavbarComponent, RouterOutlet, ToastComponent, LoaderComponent],
})
export class AppComponent {

}
