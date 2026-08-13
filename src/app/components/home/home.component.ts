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
  
  @ViewChild('glideImages') glideImagesRef!: ElementRef;
  @ViewChild('glideTexts') glideTextsRef!: ElementRef;

  private glideImagesInstance: any;
  private glideTextsInstance: any;

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
  // Carrusel imagenes
  this.glideImagesInstance = new Glide(this.glideImagesRef.nativeElement, {
    type: 'carousel',
    autoplay: 5000,
    animationDuration: 800,    
    dragThreshold: 10
  });

  // Carrusel texto
  this.glideTextsInstance = new Glide(this.glideTextsRef.nativeElement, {
    type: 'carousel',
    autoplay: 10000,
    animationDuration: 800
  });

  // Montar las dos instancias de forma independiente
  this.glideImagesInstance.mount();
  this.glideTextsInstance.mount();
}
  ngOnDestroy(): void {
    // Destruir instancias para prevenir fugas de memoria
    if (this.glideImagesInstance) this.glideImagesInstance.destroy();
    if (this.glideTextsInstance) this.glideTextsInstance.destroy();
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
