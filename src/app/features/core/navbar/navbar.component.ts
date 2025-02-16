import { Component, computed, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { RegisterComponent } from '../../auth/register/register.component';
import { SidenavComponent } from '../sidenav/sidenav.component';
import { ToastService } from '../services/toast.service';
import { AuthService } from '../../auth/services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, RegisterComponent, SidenavComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {

  signedIn = computed(() => !!this.authService.authToken());
  signInDialog = signal<boolean>(false);
  sideNav = signal<boolean>(false);

  toggleSignInDialog(val: boolean) {
    this.signInDialog.set(val);
  }

  toggleSideNav() {
    this.sideNav.set(!this.sideNav())
  }

  logout() {
    this.authService.authToken.set(null);
    this.toastService.showToast({message: 'Logged out successfully', type: 'info'});
  }

  constructor(private toastService: ToastService, private authService: AuthService) {
  }
}
