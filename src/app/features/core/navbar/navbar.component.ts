import { Component, OnInit, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { RegisterComponent } from '../../auth/register/register.component';
import { SidenavComponent } from '../sidenav/sidenav.component';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, RegisterComponent, SidenavComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {

  signedIn = signal<boolean>(false);
  signInDialog = signal<boolean>(false);
  sideNav = signal<boolean>(false);

  toggleSignInDialog(val: boolean) {
    this.signInDialog.set(val);
    this.refreshLoginStatus();
  }

  toggleSideNav() {
    this.sideNav.set(!this.sideNav())
  }

  logout() {
    localStorage.removeItem('jwt-token');
    this.refreshLoginStatus();
  }

  ngOnInit(): void {
    this.refreshLoginStatus();
  }

  constructor(private toastService: ToastService) {

  }

  refreshLoginStatus() {
    const token = localStorage.getItem('jwt-token');
    if (token && /.*[.].*[.]*/.test(token) && !this.signedIn()) {
      this.signedIn.set(true);
      this.toastService.showToast({message: "Logged Successfully", type: 'success'});
    } else if (this.signedIn()) {
      this.signedIn.set(false);
      this.toastService.showToast({message: 'Logged out successfully', type: 'info'});
      localStorage.removeItem('jwt-token')
    }
  }
}
