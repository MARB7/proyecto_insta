import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent, IonInput, IonButton,
  IonSegment, IonSegmentButton, IonLabel,
  IonIcon, IonSpinner
} from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../services/auth';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import {
  cameraOutline, personOutline, atOutline, mailOutline,
  lockClosedOutline, alertCircleOutline, logInOutline, personAddOutline,
  shieldCheckmarkOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonContent, IonInput, IonButton,
    IonSegment, IonSegmentButton, IonLabel,
    IonIcon, IonSpinner,
    FormsModule, CommonModule]
})
export class LoginPage implements OnInit {

    email = ''; password = ''; passwordConfirm = ''; name = ''; username = '';
    mode: string = 'login';
    error = '';
    loading = false;

    constructor(private auth: Auth, private router: Router) {
      addIcons({
        cameraOutline, personOutline, atOutline, mailOutline,
        lockClosedOutline, alertCircleOutline, logInOutline, personAddOutline,
        shieldCheckmarkOutline
      });
    }

    ngOnInit(): void {
      // If already logged in, redirect to feed
      if (this.auth.getToken()) {
        this.router.navigateByUrl('/feed');
      }
    }

    get isRegister(): boolean {
      return this.mode === 'register';
    }

    submit() {
      // Remove focus from active element to avoid aria-hidden warning
      (document.activeElement as HTMLElement)?.blur();

      this.error = '';
      this.loading = true;

      if (this.isRegister) {
        // Validate required fields
        if (!this.name.trim() || !this.username.trim() || !this.email.trim() || !this.password.trim() || !this.passwordConfirm.trim()) {
          this.error = 'Todos los campos son obligatorios';
          this.loading = false;
          return;
        }

        if (this.password !== this.passwordConfirm) {
          this.error = 'Las contraseñas no coinciden';
          this.loading = false;
          return;
        }

        if (this.password.length < 6) {
          this.error = 'La contraseña debe tener al menos 6 caracteres';
          this.loading = false;
          return;
        }

        this.auth.register({
          name: this.name.trim(),
          email: this.email.trim(),
          password: this.password,
          username: this.username.trim()
        }).subscribe({
          next: res => {
            this.auth.setUser(res.user);
            this.auth.setToken(res.token);
            this.loading = false;
            this.router.navigateByUrl('/feed');
          },
          error: err => {
            this.loading = false;
            if (err.error?.message) {
              this.error = err.error.message;
            } else if (err.error?.errors) {
              const firstKey = Object.keys(err.error.errors)[0];
              this.error = err.error.errors[firstKey][0];
            } else {
              this.error = 'No se pudo registrar. Verifica los datos.';
            }
          }
        });
      } else {
        if (!this.email.trim() || !this.password.trim()) {
          this.error = 'Email y contraseña son obligatorios';
          this.loading = false;
          return;
        }

        this.auth.login(this.email.trim(), this.password).subscribe({
          next: res => {
            this.auth.setUser(res.user);
            this.auth.setToken(res.token);
            this.loading = false;
            this.router.navigateByUrl('/feed');
          },
          error: err => {
            this.loading = false;
            if (err.error?.message) {
              this.error = err.error.message;
            } else {
              this.error = 'Credenciales inválidas';
            }
          }
        });
      }
    }

}
