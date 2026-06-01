import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/carrito.service';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carrito.html',
  styleUrl: './carrito.css'
})
export class Carrito implements OnInit {
  carrito: any[] = [];
  total = 0;
  constructor(private cartService: CartService) {}
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
}