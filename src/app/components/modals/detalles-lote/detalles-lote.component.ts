import { Component, inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import moment from 'moment';
import { DialogData } from '../../../models/DialogData';
import { SemaforoModel } from '../../../models/SemaforoModel';
import { ProcessLotesService } from '../../../service/process-lotes.service';

@Component({
  selector: 'app-detalles-lote',
  templateUrl: './detalles-lote.component.html',
  styleUrl: './detalles-lote.component.scss'
})
export class DetallesLoteComponent {

  readonly dialogRef = inject(MatDialogRef<DetallesLoteComponent>);
  readonly data = inject<DialogData>(MAT_DIALOG_DATA);

  dataJsonLP = [];
  tipoPaquete: string;
  creacion: any; //string
  activo: string;
  lote = this.data.lote;
  numPaquete = this.data.idPaquete;
  runas: SemaforoModel[] = [];

  constructor(private service: ProcessLotesService) {
    this.getRegistroLotes();
  }

  public async getRegistroLotes() {
    /**conexión y consumo de Firebase */
    await this.obtenerFirebaseData().then((data: []) => {
      this.dataJsonLP.push(...data);
    });
    this.setValues();
  }

  obtenerFirebaseData() {
    return new Promise((resolve, reject) => {
      this.service.getAll().valueChanges().subscribe(val => {
        resolve(val);
      })
    });
  }

  refrescar() {
    this.dataJsonLP.splice(0, this.dataJsonLP.length);
    this.runas = [];
    this.getRegistroLotes();
  }

  public setValues() {

    this.dataJsonLP.find((lot) => {
      if(lot['lote'] === this.lote) {
        lot['paquetes'].find((paq) => {
          if (paq['codigo'] === this.numPaquete) {
            this.tipoPaquete = paq['tipoPaquete'];
            this.creacion = moment(paq['creacion']).format("DD/MM/YYYY");
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
    });

  }

  public getSemaforoClas(creacion: string): string {

    if (creacion === '') {
      return 'soff';
    }

    let diasRestantes = moment().diff(moment(creacion), 'days');

    switch(true) {
      case (diasRestantes < 4): //50%
        return 'son';
      case (diasRestantes < 7): //37.5%
        return 'swarn';
      case (diasRestantes < 8): //12.5%
        return 'sdan';
      default:
        return 'sout';          
    }

  }

}
