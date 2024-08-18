import { SemaforoModel } from './../../models/SemaforoModel';
import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DialogData } from '../../models/DialogData';
import moment from 'moment';

@Component({
  selector: 'app-detalles-lote',
  templateUrl: './detalles-lote.component.html',
  styleUrl: './detalles-lote.component.scss',
})
export class DetallesLoteComponent {
  readonly dialogRef = inject(MatDialogRef<DetallesLoteComponent>);
  readonly data = inject<DialogData>(MAT_DIALOG_DATA);

  tipoPaquete: string;
  creacion: string;
  activo: string;
  lote: string;
  paquete: string;
  numPaquete = this.data.idPaquete;
  runas: SemaforoModel[] = [];

  constructor() {
    this.setValues();
  }

  public setValues() {

    this.paquete = this.numPaquete;
    this.lote = this.data.lote['lote'];

    this.data.lote['paquetes'].find((paq) => {
      if (paq['codigo'] === this.numPaquete) {
        this.tipoPaquete = paq['tipoPaquete'];
        this.creacion = moment(paq['creacion']).format('DD-MM-YYYY');
        this.activo = paq['activo'] ? 'En uso' : 'Inactivo';
        paq['consultados'].map(r => {
          this.runas.push({
            url: '/assets/img/' + Object.keys(r)[0].slice(0,2) + '.png',
            codr: Object.keys(r)[0],
            consultas: r['consultas'],
            semaforo: this.getSemaforoClas(r[Object.keys(r)[0]]),
            inver: (Object.keys(r)[0].slice(-2) === '00') ? 'invertida' : ''
          });
        });
      }
    });
  }

  public getSemaforoClas(creacion: string): string {

    if (creacion === '') {
      return 'soff';
    }

    let diasRestantes = moment().diff(moment(creacion), 'days');

    switch(true) {
      case (diasRestantes < 19): //4
        return 'son';
      case (diasRestantes < 24): //7
        return 'swarn';
      case (diasRestantes < 31): //8
        return 'sdan';
      default:
        return 'sout';          
    }

  }
}
