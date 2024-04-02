import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Route, Router } from '@angular/router';

@Component({
  selector: 'app-auth-user',
  templateUrl: './auth-user.component.html',
  styleUrls: ['./auth-user.component.css']
})
export class AuthUserComponent {

  loginForm: FormGroup;
  registerForm: FormGroup;
  isLoginFormVisible = true;

  constructor(private router:Router){

  }

  ngOnInit() {
    this.initLoginForm();
    this.initRegisterForm();
  }

  private initLoginForm() {
    this.loginForm = new FormGroup({
      username: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required)
    });
  }

  private initRegisterForm() {
    this.registerForm = new FormGroup({
      username: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      confirmPassword: new FormControl('', Validators.required)
    });
  }

  toggleForm() {
    this.isLoginFormVisible = !this.isLoginFormVisible;
  }

  onSubmitLogin() {
    // Add logic for handling login using this.loginForm.value
    this.router.navigate(['/form-builder']);
  }

  onSubmitRegister() {
    // Add logic for handling registration using this.registerForm.value
  }
}
