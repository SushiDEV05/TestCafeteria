import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private api = '/api/clientes';

  constructor(private http: HttpClient) { }

  obtenerClientes() {
    return this.http.get(this.api);
  }

  obtenerClientePorId(id: number) {
    return this.http.get(`${this.api}/${id}`);
  }

  agregarCliente(cliente: any) {
    return this.http.post(this.api, cliente);
  }

  editarCliente(id: number, cliente: any) {
    return this.http.put(`${this.api}/${id}`, cliente);
  }

  eliminarCliente(id: number) {
    return this.http.delete(`${this.api}/${id}`);
  }
}
