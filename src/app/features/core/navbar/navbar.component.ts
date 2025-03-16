import { Component, computed, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { SidenavComponent } from '../sidenav/sidenav.component';
import { TitleCasePipe } from '@angular/common';
import { RegisterComponent } from '../../auth/register/register.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    SidenavComponent,
    TitleCasePipe,
    RegisterComponent
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  signInDialog = signal(false);
  sideNav = signal(false);
  showCityDropdown = signal(false);

  cities = ['Hyderabad', 'Nalgonda'];
  selectedCity = computed(() => this.authService.selectedCity());

  constructor(private authService: AuthService) {
    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
      if (this.showCityDropdown()) {
        this.showCityDropdown.set(false);
      }
    });
  }

  signedIn = computed(() => this.authService.isAuthenticated());

  toggleSignInDialog(show: boolean) {
    this.signInDialog.set(show);
  }

  toggleSideNav() {
    this.sideNav.update(value => !value);
  }

  toggleCityDropdown(event: Event) {
    event.stopPropagation();
    this.showCityDropdown.update(value => !value);
  }

  selectCity(city: string, event: Event) {
    event.stopPropagation();
    this.authService.selectedCity.set(city.toLowerCase());
    this.showCityDropdown.set(false);
  }

  logout() {
    this.authService.logout();
  }
}
