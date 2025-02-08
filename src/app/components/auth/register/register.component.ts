import { Component, output, signal } from '@angular/core';

@Component({
  selector: 'app-register',
  imports: [],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {

  dialog = output<boolean>({ alias: "closeDialog" });
  signInTab = signal<boolean>(true);

  closeDialog() {
    this.dialog.emit(false);
  }

  toggelSignInTab(val: boolean) {
    this.signInTab.set(val);
  }

}
