import { Component, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { UserRegistrationDetails } from '../types';
import { MatSnackBar } from '@angular/material/snack-bar'


@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule],
  providers: [MatSnackBar],
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
  constructor(private authService: AuthService, private snackBar: MatSnackBar) {

  }


  closeDialog() {
    this.dialog.emit(false);
  }

  toggelSignInTab(val: boolean) {
    this.signInTab.set(val);
  }

  showErrorMessage(err: Error) {
    this.snackBar.open(err.message, "close")
  }


  onRegister() {
    const { username, password, firstname, lastname } = this.registerFrom.value;
    this.authService.register({ username: username!, password: password!, firstname: firstname!, lastname: lastname! }).subscribe({
      next: (registrationDetails: UserRegistrationDetails) => {
        console.log("registration sucessfull");
        console.log(registrationDetails);
      },
      error: (err: Error) => {
        this.showErrorMessage(err);
      }
    })

  }

  onSignin() {
    const { username, password } = this.loginForm.value;
    this.authService.login({ username: username!, password: password! }).subscribe({
      next: () => {
        this.closeDialog();
      },
      error: (err: Error) => {
        this.showErrorMessage(err)
      }
    })
  }
}
