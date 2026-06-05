import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class Admin {
  productos: any[] = [];
  editando = false;
  productoEditandoId = 0;
  /* IMAGEN SELECCIONADA */
  imagenSeleccionada!: File;
  nuevoProducto = {
    nombre: '',
    descripcion: '',
    precio: 0,
    imagen: '',
    stock: 0
  };
  constructor(
    private productService: ProductService,
    private authService: AuthService,
    private router: Router
  ) {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    const activeRole = this.authService.getActiveRole();
    if (activeRole === 'empleado') {
      alert('Acceso denegado. No tienes permisos para administrar productos.');
      this.router.navigate(['/inicio']);
      return;
    }
    this.obtenerProductos();
  }
  /* OBTENER PRODUCTOS */
  obtenerProductos() {
    this.productService.obtenerProductos()
      .subscribe((data: any) => {
        this.productos = data;
      });
  }
  /* SELECCIONAR IMAGEN */
  seleccionarImagen(event: any) {
    this.imagenSeleccionada = event.target.files[0];
  }
  /* AGREGAR O EDITAR */
  agregarProducto() {
    const formData = new FormData();
    formData.append(
      'nombre',
      this.nuevoProducto.nombre
    );
    formData.append(
      'descripcion',
      this.nuevoProducto.descripcion
    );
    formData.append(
      'precio',
      this.nuevoProducto.precio.toString()
    );
    formData.append(
      'stock',
      this.nuevoProducto.stock.toString()
    );
    /* IMAGEN */
    if (this.imagenSeleccionada) {
      formData.append(
        'imagen',
        this.imagenSeleccionada
      );
    }
    if (this.editando) {
      this.productService.editarProducto(
        this.productoEditandoId,
        formData
      ).subscribe(() => {
        alert('Producto actualizado');
        this.cancelarEdicion();
        this.obtenerProductos();
      });
    } else {
      this.productService.agregarProducto(formData)
        .subscribe(() => {
          alert('Producto agregado');
          this.obtenerProductos();
          this.limpiarFormulario();
        });
    }
  }
  /* ELIMINAR */
  eliminarProducto(id: number) {
    this.productService.eliminarProducto(id)
      .subscribe(() => {
        alert('Producto eliminado');
        this.obtenerProductos();
      });
  }
  /* EDITAR */
  editarProducto(producto: any) {
    this.editando = true;
    this.productoEditandoId = producto.id_producto;
    this.nuevoProducto = {
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: producto.precio,
      imagen: producto.imagen,
      stock: producto.stock
    };
  }
  /* CANCELAR */
  cancelarEdicion() {
    this.editando = false;
    this.productoEditandoId = 0;
    this.limpiarFormulario();
  }
  /* LIMPIAR */
  limpiarFormulario() {
    this.nuevoProducto = {
      nombre: '',
      descripcion: '',
      precio: 0,
      imagen: '',
      stock: 0
    };
  }
}