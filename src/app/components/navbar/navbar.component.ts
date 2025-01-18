import { Component, signal } from '@angular/core';
import { SearchComponent } from '../search/search.component';

@Component({
  selector: 'navbar',
  imports: [SearchComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  isSearchActive = signal<boolean>(true);

  activateSearch() {
    this.isSearchActive.set(true);
  }
}
