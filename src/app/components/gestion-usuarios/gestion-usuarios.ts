import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-gestion-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-usuarios.html',
  styleUrl: './gestion-usuarios.css'
})
export class GestionUsuarios implements OnInit {

  private api = '/api/auth';

  usuarios: any[] = [];
  rolActivo: string | null = null;
  editando = false;
  usuarioEditandoId = 0;

  nuevoUsuario = {
    nombre: '',
    correo: '',
    contrasena: '',
    rol: 'empleado'
  };

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient
  ) { }

  ngOnInit() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    this.rolActivo = this.authService.getActiveRole();

    if (this.rolActivo === 'empleado') {
      alert('Acceso denegado. No tienes permisos para gestionar usuarios.');
      this.router.navigate(['/inicio']);
      return;
    }

    this.obtenerUsuarios();
  }

  get rolesDisponibles(): string[] {
    if (this.rolActivo === 'super') {
      return ['administrador', 'empleado'];
    }
    return ['empleado'];
  }

  get titulo(): string {
    if (this.rolActivo === 'super') return 'Gestión de Administradores y Empleados';
    return 'Gestión de Empleados';
  }

  obtenerUsuarios() {
    this.http.get<any[]>(`${this.api}/usuarios?rolSolicitante=${this.rolActivo}`)
      .subscribe({
        next: (data) => { this.usuarios = data; },
        error: (err) => {
          console.error('Error al obtener usuarios:', err);
          alert(err.error?.mensaje || 'Error al cargar usuarios.');
        }
      });
  }

  guardarUsuario() {
    if (!this.nuevoUsuario.nombre || !this.nuevoUsuario.correo || !this.nuevoUsuario.contrasena) {
      alert('Por favor completa todos los campos.');
      return;
    }

    const payload = { ...this.nuevoUsuario, rolSolicitante: this.rolActivo };

    if (this.editando) {
      this.http.put(`${this.api}/usuarios/${this.usuarioEditandoId}`, payload)
        .subscribe({
          next: () => {
            alert('Usuario actualizado correctamente.');
            this.cancelarEdicion();
            this.obtenerUsuarios();
          },
          error: (err) => alert(err.error?.mensaje || 'Error al actualizar usuario.')
        });
    } else {
      this.http.post(`${this.api}/usuarios`, payload)
        .subscribe({
          next: () => {
            alert('Usuario creado correctamente.');
            this.limpiarFormulario();
            this.obtenerUsuarios();
          },
          error: (err) => alert(err.error?.mensaje || 'Error al crear usuario.')
        });
    }
  }

  editarUsuario(user: any) {
    this.editando = true;
    this.usuarioEditandoId = user.id_usuario;
    this.nuevoUsuario = {
      nombre: user.nombre,
      correo: user.correo,
      contrasena: '',
      rol: user.rol
    };
  }

  eliminarUsuario(id: number) {
    if (!confirm('¿Estás seguro de que deseas eliminar este usuario?')) return;

    this.http.delete(`${this.api}/usuarios/${id}?rolSolicitante=${this.rolActivo}`)
      .subscribe({
        next: () => {
          alert('Usuario eliminado.');
          this.obtenerUsuarios();
        },
        error: (err) => alert(err.error?.mensaje || 'Error al eliminar usuario.')
      });
  }

  cancelarEdicion() {
    this.editando = false;
    this.usuarioEditandoId = 0;
    this.limpiarFormulario();
  }

  limpiarFormulario() {
    this.nuevoUsuario = {
      nombre: '',
      correo: '',
      contrasena: '',
      rol: this.rolesDisponibles[0]
    };
  }
}
