import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../services/carrito.service';
import { VentaService } from '../../services/venta.service';
import { PedidoService } from '../../services/pedido.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './carrito.html',
  styleUrl: './carrito.css',
})
export class Carrito implements OnInit {
  carrito: any[] = [];
  total = 0;

  mostrarFormulario = false;
  mostrarBoleta = false;
  esCliente = false;

  cliente = {
    nombre: '',
    telefono: '',
    correo: '',
    direccion: '',
  };

  // Datos guardados de la boleta una vez confirmada la compra
  boletaData: {
    cliente: { nombre: string; telefono: string; correo: string; direccion: string };
    items: any[];
    total: number;
    fechaHora: string;
  } | null = null;

  // Campos para búsqueda y selección de cliente (para roles super, administrador, empleado)
  clientes: any[] = [];
  clientesFiltrados: any[] = [];
  busquedaCliente = '';
  clienteSeleccionadoId: any = null;

  constructor(
    private cartService: CartService,
    private ventaService: VentaService,
    private pedidoService: PedidoService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.esCliente = this.authService.getActiveRole() === 'cliente';
    this.obtenerCarrito();
    if (!this.esCliente) {
      this.cargarClientesUsuarios();
    }
  }

  obtenerCarrito() {
    this.carrito = this.cartService.obtenerCarrito();
    this.total = this.cartService.obtenerTotal();
  }

  cargarClientesUsuarios() {
    this.authService.obtenerClientesUsuarios().subscribe({
      next: (data: any) => {
        this.clientes = data;
        this.clientesFiltrados = data;
      },
      error: (err) => {
        console.error('Error al cargar clientes usuarios', err);
      }
    });
  }

  filtrarClientes() {
    if (!this.busquedaCliente) {
      this.clientesFiltrados = this.clientes;
    } else {
      const term = this.busquedaCliente.toLowerCase();
      this.clientesFiltrados = this.clientes.filter(c =>
        c.nombre.toLowerCase().includes(term)
      );
    }
  }

  onClienteSeleccionadoChange() {
    if (this.clienteSeleccionadoId && this.clienteSeleccionadoId !== 'null' && this.clienteSeleccionadoId !== null) {
      const c = this.clientes.find(x => x.id_usuario === Number(this.clienteSeleccionadoId));
      if (c) {
        this.cliente.nombre = c.nombre;
        this.cliente.telefono = c.telefono || '';
        this.cliente.correo = c.correo || '';
        this.cliente.direccion = 'Recojo en local';
      }
    } else {
      this.cliente = { nombre: '', telefono: '', correo: '', direccion: '' };
      this.clienteSeleccionadoId = null;
    }
  }

  eliminar(index: number) {
    this.cartService.eliminarProducto(index);
    this.obtenerCarrito();
  }

  mostrarFormularioCliente() {
    if (this.esCliente) {
      // Cliente logueado: crear pedido directamente sin pedir datos
      this.finalizarCompraCliente();
    } else {
      this.mostrarFormulario = true;
    }
  }

  /** Finalización directa para clientes logueados (crea un pedido) */
  finalizarCompraCliente() {
    const user = this.authService.getCurrentUser();
    if (!user) return;

    const pedido = {
      id_usuario: user.id_usuario,
      carrito: this.carrito,
      total: this.total
    };

    this.pedidoService.crearPedido(pedido).subscribe({
      next: (respuesta: any) => {
        const ahora = new Date();
        this.boletaData = {
          cliente: {
            nombre: user.usuario,
            telefono: '',
            correo: '',
            direccion: ''
          },
          items: this.carrito.map(p => ({ ...p })),
          total: this.total,
          fechaHora: ahora.toLocaleString('es-PE', {
            dateStyle: 'full',
            timeStyle: 'short'
          })
        };

        this.cartService.limpiarCarrito();
        this.obtenerCarrito();
        this.mostrarBoleta = true;
      },
      error: (error: any) => {
        alert('Hubo un error al procesar el pedido.');
        console.error(error);
      }
    });
  }

  /** Finalización con formulario para otros roles (crea una venta) */
  finalizarCompra() {
    if (!this.cliente.nombre || !this.cliente.telefono || !this.cliente.correo || !this.cliente.direccion) {
      alert('Por favor, completa todos los datos del cliente antes de finalizar la compra.');
      return;
    }

    const venta = {
      cliente: this.cliente,
      carrito: this.carrito,
      total: this.total
    };

    this.ventaService.registrarVenta(venta)
      .subscribe({
        next: (respuesta: any) => {
          const ahora = new Date();
          this.boletaData = {
            cliente: { ...this.cliente },
            items: this.carrito.map(p => ({ ...p })),
            total: this.total,
            fechaHora: ahora.toLocaleString('es-PE', {
              dateStyle: 'full',
              timeStyle: 'short'
            })
          };

          this.cartService.limpiarCarrito();
          this.obtenerCarrito();
          this.mostrarFormulario = false;
          this.cliente = { nombre: '', telefono: '', correo: '', direccion: '' };
          this.clienteSeleccionadoId = null;
          this.busquedaCliente = '';
          this.clientesFiltrados = this.clientes;
          this.mostrarBoleta = true;
        },
        error: (error: any) => {
          alert('Hubo un error al procesar la compra.');
          console.error(error);
        }
      });
  }

  imprimirBoleta() {
    window.print();
  }

  cerrarBoleta() {
    this.mostrarBoleta = false;
    this.boletaData = null;
  }
}
