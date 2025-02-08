import { Component, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';


@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {

  dialog = output<boolean>({ alias: "closeDialog" });
  signInTab = signal<boolean>(true);

  loginForm = new FormGroup({
    'username': new FormControl('', [Validators.required, Validators.minLength(4), Validators.maxLength(35)]),
    'password': new FormControl('', [Validators.required, Validators.minLength(8)])
  });

  registerFrom = new FormGroup({
    'username': new FormControl('', [Validators.required, Validators.minLength(4), Validators.maxLength(35)]),
    'firstname': new FormControl('', [Validators.required, Validators.minLength(4), Validators.maxLength(35)]),
    'lastname': new FormControl('', [Validators.required, Validators.minLength(4), Validators.maxLength(35)]),
    'password': new FormControl('', [Validators.required, Validators.minLength(8)])
  })

  closeDialog() {
    this.dialog.emit(false);
  }

  toggelSignInTab(val: boolean) {
    this.signInTab.set(val);
  }

  onRegister() {
    console.log(this.registerFrom.value);
  }


  onSignin() {
    console.log(this.loginForm.value);
  }

}
