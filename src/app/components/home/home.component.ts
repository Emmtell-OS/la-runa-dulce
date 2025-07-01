import { Component, ViewChild, OnInit, AfterViewInit, ElementRef } from '@angular/core';
import { PuntosVentaModel } from '../../models/PuntosVentaModel';
import { MatTable } from '@angular/material/table';
import { PuntosVentaService } from '../../service/puntos-venta.service';
import * as AOS from 'aos';
import Glide, { Controls, Breakpoints } from '@glidejs/glide'

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, AfterViewInit {

  displayedPVColumns = ['comercio', 'direccion', 'mapa'];
  datasourcePV: any;
  catPV: PuntosVentaModel[] = [];
  mostrarMobile: boolean;
  imgCarrusel: number;
  mostrarApuntador: boolean;

  w: number; //eliminar en produccion
  h: number; //eliminar en produccion

  @ViewChild(MatTable) tablePuntoVenta!: MatTable<PuntosVentaModel>;
  @ViewChild('glide', { static: true }) glideRef: ElementRef;

  constructor(private servicePuntoVenta: PuntosVentaService) {
    this.getRegistroPuntoVenta(true);
    this.w = window.innerWidth;
    this.h = window.innerHeight;
    if (this.w <= 850) {
      this.mostrarMobile = true;
      this.imgCarrusel = 1;
      this.mostrarApuntador = true;
    } else {
      this.mostrarMobile = false;
      this.imgCarrusel = 2;
    }
  }

ngOnInit(): void {
  AOS.init();
 }

 ngAfterViewInit(){
  //AOS.init();
  new Glide(//'.glide'
    this.glideRef.nativeElement, {
    type: 'carousel',
    startAt: 0,
    perView: this.imgCarrusel,
    autoplay: 3000,
    hoverpause: true,
    keyboard: true,
    swipeThreshold: 5,
    dragThreshold: 10,
    //gap: 50
    /*breakpoints: {
      800: {
        perView: 2
      },
      480: {
        perView: 1
      }
    }*/
  }
  ).mount();
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

  clickApuntador() {
    this.mostrarApuntador = false;
  }
  
}
