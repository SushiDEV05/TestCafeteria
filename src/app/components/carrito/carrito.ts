import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/carrito.service';
import { VentaService } from '../../services/venta.service';

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
  ) {}

  ngOnInit(): void {
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

  alert('ENTRO A FINALIZAR COMPRA');

  const venta = {
    cliente: this.cliente,
    carrito: this.carrito,
    total: this.total
  };

  console.log('VENTA A ENVIAR', venta);

  this.ventaService.registrarVenta(venta)
    .subscribe({
      next: (respuesta: any) => {

        alert('LLEGO RESPUESTA DEL BACKEND');

        console.log(respuesta);

      },

      error: (error) => {

        alert('ERROR DEL BACKEND');

        console.log(error);

      }
    });
}
}
