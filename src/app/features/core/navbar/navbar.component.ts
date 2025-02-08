import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { RegisterComponent } from '../../auth/register/register.component';
@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, RegisterComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  signedIn = signal<boolean>(false);
  signInDialog = signal<boolean>(false);

  toggleSignInDialog(val: boolean) {
    this.signInDialog.set(val);
  }
}
