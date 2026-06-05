import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VentaService } from '../../services/venta.service';

@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ventas.html',
  styleUrl: './ventas.css'
})
export class VentasComponent implements OnInit {

  ventas: any[] = [];
  cargando = true;

  constructor(private ventaService: VentaService) {}

  ngOnInit(): void {
    this.obtenerVentas();
  }

  obtenerVentas(): void {
    this.cargando = true;
    this.ventaService.getVentas().subscribe({
      next: (data) => {
        this.ventas = data;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al obtener las ventas:', error);
        alert('Hubo un error al obtener el historial de ventas.');
        this.cargando = false;
      }
    });
  }
}
