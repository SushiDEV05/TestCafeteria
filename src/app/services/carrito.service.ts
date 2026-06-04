import { Injectable } from '@angular/core';
@Injectable({
  providedIn: 'root'
})
export class CartService {
  items: any[] = [];
  agregarAlCarrito(producto: any) {
    const productoExistente = this.items.find(
      item => item.id_producto === producto.id_producto
    );
    if (productoExistente) {
      productoExistente.cantidad += producto.cantidad;
    } else {
      this.items.push({
        ...producto,
        precio: Number(producto.precio),
        cantidad: Number(producto.cantidad)
      });
    }
  }
  obtenerCarrito() {
    return this.items;
  }
  eliminarProducto(index: number) {
    this.items.splice(index, 1);
  }
  limpiarCarrito() {
    this.items = [];
  }
  obtenerTotal() {
    return this.items.reduce(
      (total, producto) =>
        total + (producto.precio * producto.cantidad),
      0
    );
  }
}