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
  descargandoExcel = false;


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

  descargarExcel(): void {
    this.descargandoExcel = true;
    this.ventaService.exportarVentasExcel().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Reporte_Ventas.xlsx';
        a.click();
        window.URL.revokeObjectURL(url);
        this.descargandoExcel = false;
      },
      error: (error) => {
        console.error('Error al descargar excel:', error);
        alert('Hubo un error al descargar el reporte en Excel.');
        this.descargandoExcel = false;
      }
    });
  }
}
