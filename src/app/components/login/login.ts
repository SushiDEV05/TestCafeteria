import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  usuario = '';
  password = '';

  constructor(private router: Router) {}

  iniciarSesion() {

    if (
      this.usuario === 'admin' &&
      this.password === '1234'
    ) {

      alert('Bienvenido administrador');

      this.router.navigate(['/inicio']);

    } else {

      alert('Usuario o contraseña incorrectos');

    }

  }

}