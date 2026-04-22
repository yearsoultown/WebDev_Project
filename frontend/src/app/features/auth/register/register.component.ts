import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  payload = {
    username: '',
    email: '',
    password: '',
    password_confirm: '',
  };

  loading = false;
  serverError = '';
  fieldErrors: Record<string, string> = {};

  onSubmit(form: NgForm): void {
    if (form.invalid || this.payload.password !== this.payload.password_confirm) {
      return;
    }

    this.loading = true;
    this.serverError = '';
    this.fieldErrors = {};

    this.authService.register(this.payload).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.loading = false;

        if (err.error?.username) {
          this.fieldErrors['username'] = err.error.username[0];
        }

        if (err.error?.email) {
          this.fieldErrors['email'] = err.error.email[0];
        }

        if (err.error?.detail) {
          this.serverError = err.error.detail;
        }

        if (err.error?.password_confirm) {
          this.serverError = err.error.password_confirm[0];
        }

        if (!this.serverError && !Object.keys(this.fieldErrors).length) {
          this.serverError = 'Registration failed';
        }
      },
    });
  }
}