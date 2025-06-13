import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PuntosVentaModel } from '../../../models/PuntosVentaModel';

@Component({
  selector: 'app-detalles-punto-venta',
  templateUrl: './detalles-punto-venta.component.html',
  styleUrl: './detalles-punto-venta.component.scss'
})
export class DetallesPuntoVentaComponent {

  items: PuntosVentaModel;

  readonly data = inject<PuntosVentaModel>(MAT_DIALOG_DATA);

  constructor() {
    this.items = this.data;
  }

}
