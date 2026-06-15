import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService, AppRole } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit {

  rolSeleccionado: AppRole = 'cliente';
  usuario = '';
  password = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/inicio']);
    }
  }

  seleccionarRol(rol: AppRole) {
    this.rolSeleccionado = rol;
    this.usuario = '';
    this.password = '';
  }

  iniciarSesion() {
    if (!this.usuario || !this.password) {
      alert('Por favor ingrese su correo y contraseña.');
      return;
    }

    this.authService.loginApi(this.usuario, this.password, this.rolSeleccionado).subscribe({
      next: (respuesta: any) => {
        this.authService.login(respuesta.id_usuario, respuesta.usuario, respuesta.role as AppRole);
        alert(`Bienvenido ${respuesta.usuario} (${respuesta.role})`);
        this.router.navigate(['/inicio']);
      },
      error: (error: any) => {
        console.error('Error de login:', error);
        const errorMsg = error.error?.mensaje || 'Error de conexión con el servidor.';
        alert(errorMsg);
      }
    });
  }

}