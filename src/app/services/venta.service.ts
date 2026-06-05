import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class VentaService {

  apiUrl = 'http://localhost:3000/api/ventas';

  constructor(private http: HttpClient) {}

  registrarVenta(data: any) {
    return this.http.post(this.apiUrl, data);
  }

  getVentas() {
    return this.http.get<any[]>(this.apiUrl);
  }

}