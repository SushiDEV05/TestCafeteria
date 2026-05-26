import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/carrito.service';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './menu.html',
  styleUrl: './menu.css'
})
export class Menu implements OnInit {
  productos: any[] = [];
  cargando = true;
  constructor(
    private CartService: CartService,
    private productService: ProductService
  ) {}
  ngOnInit(): void {
    this.obtenerProductos();
  }
  obtenerProductos() {
    this.productService.obtenerProductos()
      .subscribe({
        next: (data: any) => {
          /* AGREGAR CANTIDAD */
          this.productos = data.map((producto: any) => ({
            ...producto,
            cantidad: 1
          }));
          this.cargando = false;
        },
        error: (error) => {
          console.log(error);
          this.cargando = false;
        }
      });
  }
  aumentar(producto: any) {
    producto.cantidad++;
  }
  disminuir(producto: any) {
    if (producto.cantidad > 1) {
      producto.cantidad--;
    }
  }
  agregar(producto: any) {
    this.CartService.agregarAlCarrito({
      ...producto,
      cantidad: producto.cantidad
    });
    alert(producto.nombre + ' agregado al carrito');
  }
}