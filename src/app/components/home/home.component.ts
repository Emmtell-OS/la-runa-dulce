import { Component, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { PuntosVentaModel } from '../../models/PuntosVentaModel';
import { MatTable } from '@angular/material/table';
import { PuntosVentaService } from '../../service/puntos-venta.service';
import * as AOS from 'aos';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, AfterViewInit {

  displayedPVColumns = ['comercio', 'direccion', 'mapa'];
  datasourcePV: any;
  catPV: PuntosVentaModel[] = [];

  @ViewChild(MatTable) tablePuntoVenta!: MatTable<PuntosVentaModel>;

  constructor(private servicePuntoVenta: PuntosVentaService) {
    this.getRegistroPuntoVenta(true);
  }

 ngOnInit(): void {
  AOS.init();
 }

 ngAfterViewInit(){
  //AOS.init();
}

  private async getRegistroPuntoVenta(ft: boolean) {
    /**conexión y consumo de Firebase */
    this.catPV.splice(0, this.catPV.length);
    this.datasourcePV = [];
    await this.obtenerFirebaseDataTema().then((data: any) => {
      this.catPV = data;
    });

    this.datasourcePV = this.catPV.filter((ft) => ft.activo === true).sort((a, b) => a.nombreComercial.localeCompare(b.nombreComercial, 'en', { numeric: true }));
    if(!ft) {
      this.tablePuntoVenta.renderRows();
    }
  }

  private obtenerFirebaseDataTema() {
    return new Promise((resolve, reject) => {
      this.servicePuntoVenta.getAll().valueChanges().subscribe(val => {
        resolve(val);
      })
    });
  }
  
}
