import { CommonModule } from '@angular/common';
import { Component, computed, OnInit, output } from '@angular/core';
import { AuthService } from '../../auth/services/auth.service';
import { ClickOutsideDirective } from '../directives/click-outside.directive';

@Component({
  selector: 'app-sidenav',
  imports: [CommonModule, ClickOutsideDirective],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.scss'
})
export class SidenavComponent implements OnInit {

  hideSideNav = output<boolean>();

  ngOnInit(): void {
  }

  authenticated = computed(() => !!this.authService.authToken());

  onHideSideNav() {
    this.hideSideNav.emit(true);
  }

  constructor(private authService: AuthService) {
  }
}
