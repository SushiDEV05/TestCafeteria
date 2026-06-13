import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ClienteService } from '../../services/cliente.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './clientes.html',
  styleUrl: './clientes.css'
})
export class ClientesComponent implements OnInit {
  clientes: any[] = [];
  editando = false;
  clienteEditandoId = 0;
  
  nuevoCliente = {
    nombre: '',
    telefono: '',
    correo: '',
    direccion: ''
  };

  constructor(
    private clienteService: ClienteService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    const activeRole = this.authService.getActiveRole();
    if (activeRole === 'empleado') {
      alert('Acceso denegado. No tienes permisos para administrar clientes.');
      this.router.navigate(['/inicio']);
      return;
    }
    
    this.obtenerClientes();
  }

  obtenerClientes() {
    this.clienteService.obtenerClientes().subscribe((data: any) => {
      this.clientes = data;
    });
  }

  agregarCliente() {
    if (!this.nuevoCliente.nombre) {
      alert('El nombre es obligatorio.');
      return;
    }

    if (this.editando) {
      this.clienteService.editarCliente(this.clienteEditandoId, this.nuevoCliente).subscribe({
        next: () => {
          alert('Cliente actualizado');
          this.cancelarEdicion();
          this.obtenerClientes();
        },
        error: (err) => {
          console.error(err);
          alert('Error al actualizar el cliente');
        }
      });
    } else {
      this.clienteService.agregarCliente(this.nuevoCliente).subscribe({
        next: () => {
          alert('Cliente agregado');
          this.obtenerClientes();
          this.limpiarFormulario();
        },
        error: (err) => {
          console.error(err);
          alert('Error al agregar el cliente');
        }
      });
    }
  }

  editarCliente(cliente: any) {
    this.editando = true;
    this.clienteEditandoId = cliente.id_cliente;
    this.nuevoCliente = {
      nombre: cliente.nombre,
      telefono: cliente.telefono || '',
      correo: cliente.correo || '',
      direccion: cliente.direccion || ''
    };
  }

  eliminarCliente(id: number) {
    if (confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
      this.clienteService.eliminarCliente(id).subscribe({
        next: () => {
          alert('Cliente eliminado');
          this.obtenerClientes();
        },
        error: (err) => {
          console.error(err);
          const msg = err.error?.mensaje || 'Error al eliminar el cliente.';
          alert(msg);
        }
      });
    }
  }

  cancelarEdicion() {
    this.editando = false;
    this.clienteEditandoId = 0;
    this.limpiarFormulario();
  }

  limpiarFormulario() {
    this.nuevoCliente = {
      nombre: '',
      telefono: '',
      correo: '',
      direccion: ''
    };
  }
}
