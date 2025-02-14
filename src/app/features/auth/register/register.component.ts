import { Component, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { UserRegistrationDetails } from '../types';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastService } from '../../core/services/toast.service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {

  dialog = output<boolean>({alias: "closeDialog"});
  signInTab = signal<boolean>(true);
  errorMessage = signal<string | null>(null);


  loginForm = new FormGroup({
    'username': new FormControl('', [Validators.required, Validators.minLength(4), Validators.maxLength(35)]),
    'password': new FormControl('', [Validators.required, Validators.minLength(8)])
  });

  registerFrom = new FormGroup({
    'username': new FormControl('', [Validators.required, Validators.minLength(4), Validators.maxLength(35)]),
    'email': new FormControl('', [Validators.required, Validators.minLength(4), Validators.maxLength(35), Validators.email]),
    'password': new FormControl('', [Validators.required, Validators.minLength(8)])
  })

  constructor(private authService: AuthService, private toastService: ToastService) {
  }


  closeDialog() {
    this.dialog.emit(false);
  }

  toggelSignInTab(val: boolean) {
    this.errorMessage.set(null);
    this.signInTab.set(val);
  }

  showSuccessMessage(message: string) {
    this.toastService.showToast({message: message, type: 'success'})
  }


  onRegister() {
    const {username, password, email} = this.registerFrom.value;
    this.authService.register({username: username!, password: password!, email: email!}).subscribe({
      next: (registrationDetails: UserRegistrationDetails) => {
        this.showSuccessMessage("Registered User " + username + " Please Login");
        this.toggelSignInTab(true);
      },
      error: (err: HttpErrorResponse) => {
        this.errorMessage.set(err.error.message ?? err.message);
      }
    })
  }

  onSignin() {
    const {username, password} = this.loginForm.value;
    this.authService.login({username: username!, password: password!}).subscribe({
      next: () => {
        this.closeDialog();
      },
      error: (err: HttpErrorResponse) => {
        console.error(err);
        this.errorMessage.set(err.error.message ?? err.message);
      }
    })
  }
}
