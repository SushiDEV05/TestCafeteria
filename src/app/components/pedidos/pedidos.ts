import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PedidoService } from '../../services/pedido.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pedidos.html',
  styleUrl: './pedidos.css'
})
export class PedidosComponent implements OnInit {
  pedidos: any[] = [];
  editando = false;
  pedidoEditando: any = null;
  estadoSeleccionado = '';
  esCliente = false;
  
  constructor(
    private pedidoService: PedidoService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    const activeRole = this.authService.getActiveRole();
    
    // Los empleados no tienen acceso
    if (activeRole === 'empleado') {
      alert('Acceso denegado. No tienes permisos para ver pedidos.');
      this.router.navigate(['/inicio']);
      return;
    }

    this.esCliente = activeRole === 'cliente';
    this.obtenerPedidos();
  }

  obtenerPedidos() {
    this.pedidoService.obtenerPedidos().subscribe({
      next: (data: any) => {
        if (this.esCliente) {
          // Filtrar solo los pedidos del usuario actual
          const user = this.authService.getCurrentUser();
          this.pedidos = data.filter((p: any) => p.id_usuario === user?.id_usuario);
        } else {
          this.pedidos = data;
        }
      },
      error: (err) => {
        console.error(err);
        alert('Error al obtener pedidos.');
      }
    });
  }

  editarPedido(pedido: any) {
    this.editando = true;
    this.pedidoEditando = pedido;
    this.estadoSeleccionado = pedido.estado;
  }

  guardarEdicion() {
    if (!this.pedidoEditando) return;

    this.pedidoService.editarEstadoPedido(this.pedidoEditando.id_pedido, this.estadoSeleccionado).subscribe({
      next: () => {
        alert('Estado de pedido actualizado');
        this.cancelarEdicion();
        this.obtenerPedidos();
      },
      error: (err) => {
        console.error(err);
        alert('Error al actualizar el estado del pedido');
      }
    });
  }

  eliminarPedido(id: number) {
    if (confirm('¿Estás seguro de que deseas eliminar este pedido?')) {
      this.pedidoService.eliminarPedido(id).subscribe({
        next: () => {
          alert('Pedido eliminado');
          this.obtenerPedidos();
        },
        error: (err) => {
          console.error(err);
          const msg = err.error?.mensaje || 'Error al eliminar el pedido.';
          alert(msg);
        }
      });
    }
  }

  cancelarEdicion() {
    this.editando = false;
    this.pedidoEditando = null;
    this.estadoSeleccionado = '';
  }
}
