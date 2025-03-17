import { CommonModule } from '@angular/common';
import { Component, computed, OnInit, output } from '@angular/core';
import { AuthService } from '../../auth/services/auth.service';
import { ClickOutsideDirective } from '../directives/click-outside.directive';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-sidenav',
  imports: [CommonModule, ClickOutsideDirective, RouterLink],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.scss'
})
export class SidenavComponent implements OnInit {

  hideSideNav = output<boolean>();

  ngOnInit(): void {
  }

  authenticated = computed(() => !!this.authService.authToken());
  
  isAdmin = computed(() => {
    const userDetails = this.authService.userDetails();
    return userDetails?.authorities?.includes('ROLE_ADMIN') ?? false;
  });

  onHideSideNav() {
    this.hideSideNav.emit(true);
  }

  signOut() {
    this.authService.logout();
    this.onHideSideNav();
  }

  constructor(private authService: AuthService) {
  }
}
