import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit {

  rolSeleccionado: 'administrador' | 'empleado' | 'super' = 'administrador';
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

  seleccionarRol(rol: 'administrador' | 'empleado' | 'super') {
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
        this.authService.login(respuesta.id_usuario, respuesta.usuario, respuesta.role as 'administrador' | 'empleado' | 'super');
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