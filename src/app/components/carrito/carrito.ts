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

  cliente = {
    nombre: '',
    telefono: '',
    correo: '',
    direccion: '',
  };

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
    const venta = {
      cliente: this.cliente,
      carrito: this.carrito,
      total: this.total
    };

    this.ventaService.registrarVenta(venta)
      .subscribe({
        next: (respuesta: any) => {
          alert('¡Compra confirmada con éxito!');
          this.cartService.limpiarCarrito();
          this.obtenerCarrito();
          this.mostrarFormulario = false;
          this.cliente = {
            nombre: '',
            telefono: '',
            correo: '',
            direccion: '',
          };
        },
        error: (error) => {
          alert('Hubo un error al procesar la compra.');
          console.error(error);
        }
      });
  }
}
