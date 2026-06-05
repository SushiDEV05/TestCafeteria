import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../services/carrito.service';
import { VentaService } from '../../services/venta.service';
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

  constructor(
    private cartService: CartService,
    private ventaService: VentaService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.obtenerCarrito();
  }

  obtenerCarrito() {
    this.carrito = this.cartService.obtenerCarrito();
    this.total = this.cartService.obtenerTotal();
  }

  eliminar(index: number) {
    this.cartService.eliminarProducto(index);
    this.obtenerCarrito();
  }

  mostrarFormularioCliente() {
    this.mostrarFormulario = true;
  }

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
          // Guardar snapshot de la boleta antes de limpiar
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

          // Limpiar carrito y formulario
          this.cartService.limpiarCarrito();
          this.obtenerCarrito();
          this.mostrarFormulario = false;
          this.cliente = { nombre: '', telefono: '', correo: '', direccion: '' };

          // Mostrar boleta
          this.mostrarBoleta = true;
        },
        error: (error) => {
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
