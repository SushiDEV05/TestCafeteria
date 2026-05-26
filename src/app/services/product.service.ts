import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})
export class ProductService {
  api = 'http://localhost:3000/api/productos';
  constructor(private http: HttpClient) {}
  obtenerProductos() {
    return this.http.get(this.api);
  }
  agregarProducto(producto: any) {
    return this.http.post(this.api, producto);
  }
  eliminarProducto(id: number) {
    return this.http.delete(`${this.api}/${id}`);
  }
  editarProducto(id: number, producto: any) {
    return this.http.put(`${this.api}/${id}`, producto);
  }
}