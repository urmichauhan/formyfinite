import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AlertMessages, Constants } from 'src/app/app.constant';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { NgxSpinnerService } from "ngx-spinner";

@Component({
  selector: 'app-auth-user',
  templateUrl: './auth-user.component.html',
  styleUrls: ['./auth-user.component.css']
})
export class AuthUserComponent {

  loginForm: FormGroup;
  registerForm: FormGroup;
  isLoginFormVisible = true;
  showPassword: boolean = false;

  constructor(private authService: AuthService, private router: Router,
    public toastr: ToastrService, public spinner: NgxSpinnerService
  ) { }

  ngOnInit() {
    this.initLoginForm();
    this.initRegisterForm();
  }

  private initLoginForm() {
    this.loginForm = new FormGroup({
      username: new FormControl('', [Validators.required, Validators.maxLength(20), Validators.minLength(4), Validators.pattern(Constants.Validation_single_Space_letters_only)]),
      password: new FormControl('', [Validators.required, Validators.pattern(Constants.VALIDATION_PASSWORD)])
    });
  }

  private initRegisterForm() {
    this.registerForm = new FormGroup({
      username: new FormControl('', [Validators.required, Validators.maxLength(20), Validators.minLength(4), Validators.pattern(Constants.Validation_single_Space_letters_only)]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(16), Validators.pattern(Constants.VALIDATION_PASSWORD)]),
      confirmPassword: new FormControl('', [Validators.required, Validators.minLength(8), Validators.maxLength(16), Validators.pattern(Constants.VALIDATION_PASSWORD)],)
    }, { validators: this.passwordsMatch });
  }

  private passwordsMatch(formGroup: FormGroup) {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordsMismatch: true };
  }

  toggleForm() {
    this.isLoginFormVisible = !this.isLoginFormVisible;
  }

  onSubmitLogin() {
    if (this.loginForm.valid) {
      // this.spinner.show();
      // this.authService.login(this.loginForm.value).subscribe({
      //   next: (response) => {
      //     this.spinner.hide();
      //     if (response.response.ErrorCode == 200) {
      //       this.toastr.success(response.ErrorMessage);
            this.toastr.success("Login successful !");
            this.router.navigate(['formyfinite/form-builder']);
          // } else {
      //       this.toastr.error(response.ErrorMessage);
      //     }
      //   },
      //   error: (err) => {
      //     this.spinner.hide();
      //     this.toastr.error(AlertMessages.SOMETHING_WRONG);
      //   }
      // });
    } else {
      this.spinner.hide();
      this.toastr.error('Please correct the errors in the form.');
    }
  }

  onSubmitRegister() {
    this.spinner.show();
    if (this.registerForm.valid) {
      this.authService.register(this.registerForm.value).subscribe({
        next: (response) => {
          this.spinner.hide();
          console.log("response", response);
          if (response.response.ErrorCode == 200) {
            this.toastr.success(response.ErrorMessage);
            this.router.navigate(['formyfinite/form-builder']);
          } else {
            this.toastr.error(response.ErrorMessage);
          }
        },
        error: (err) => {
          this.spinner.hide();
          this.toastr.error(AlertMessages.SOMETHING_WRONG);
        }
      });
    } else {
      this.spinner.hide();
      this.toastr.error('Please correct the errors in the form.');
    }
  }

  showError(control: string, form: string) {
    const formGroup = form === 'loginForm' ? this.loginForm : this.registerForm;
    const controlErrors = formGroup.get(control)?.errors;
    const touched = formGroup.get(control)?.touched;

    if (touched && controlErrors) {
      if (controlErrors['required']) {
        return 'This field is required';
      }
      if (controlErrors['maxlength']) {
        return `Maximum length ${controlErrors['maxlength'].requiredLength} exceeded`;
      }
      if (controlErrors['minlength']) {
        return `Minimum length ${controlErrors['minlength'].requiredLength} not met`;
      }
      if (controlErrors['pattern']) {
        return 'Invalid format';
      }
      if (controlErrors['passwordsMismatch']) {
        return 'Passwords do not match';
      }
    }
    return '';
  }
}
