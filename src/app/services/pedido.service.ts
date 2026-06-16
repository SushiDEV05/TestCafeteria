import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PedidoService {
  private apiUrl = '/api/pedidos';

  constructor(private http: HttpClient) { }

  obtenerPedidos() {
    return this.http.get(this.apiUrl);
  }

  editarEstadoPedido(id: number, estado: string) {
    return this.http.put(`${this.apiUrl}/${id}`, { estado });
  }

  eliminarPedido(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  crearPedido(data: any) {
    return this.http.post(this.apiUrl, data);
  }
}
