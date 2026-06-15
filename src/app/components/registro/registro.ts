import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './registro.html',
  styleUrl: './registro.css'
})
export class RegistroComponent implements OnInit {
  nombre = '';
  correo = '';
  telefono = '';
  contrasena = '';
  confirmarContrasena = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/inicio']);
    }
  }

  registrar() {
    if (!this.nombre || !this.correo || !this.telefono || !this.contrasena || !this.confirmarContrasena) {
      alert('Por favor complete todos los campos.');
      return;
    }

    if (this.contrasena !== this.confirmarContrasena) {
      alert('Las contraseñas no coinciden.');
      return;
    }

    this.authService.registrarCliente({
      nombre: this.nombre,
      correo: this.correo,
      telefono: this.telefono,
      contrasena: this.contrasena
    }).subscribe({
      next: (respuesta: any) => {
        alert(respuesta.mensaje);
        this.router.navigate(['/login']);
      },
      error: (error: any) => {
        console.error('Error al registrar:', error);
        const errorMsg = error.error?.mensaje || 'Error al crear la cuenta.';
        alert(errorMsg);
      }
    });
  }
}
