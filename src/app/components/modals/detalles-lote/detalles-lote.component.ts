import { EmpaqueModel } from './../../../models/EmpaqueModel';
import { Component, Inject, inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import moment from 'moment';
import { DialogData } from '../../../models/DialogData';
import { SemaforoModel } from '../../../models/SemaforoModel';
import { ProcessLotesService } from '../../../service/process-lotes.service';
import { MatTableDataSource } from '@angular/material/table';
import { PaqueteModel } from '../../../models/PaqueteModel';

@Component({
  selector: 'app-detalles-lote',
  templateUrl: './detalles-lote.component.html',
  styleUrl: './detalles-lote.component.scss'
})
export class DetallesLoteComponent {

  readonly dialogRef = inject(MatDialogRef<DetallesLoteComponent>);
  //readonly data = inject<DialogData>(MAT_DIALOG_DATA);

  tipoPaquete: string;
  creacion: any; //string
  activo: string;
  lote = this.data.lote;
  numPaquete = this.data.idPaquete;
  runas: SemaforoModel[] = [];

  public paqueteInfo: PaqueteModel;

  constructor(
    private service: ProcessLotesService,
    @Inject(MAT_DIALOG_DATA) public data: any // Aquí recibimos el { idPaquete, lote } que enviamos
  ) { }

  ngOnInit() {
    this.cargarDatosPaquete();
  }

/**
 * Encapsula la lógica de suscripción reactiva
 */
private cargarDatosPaquete() {
  const idPaquete = this.data.idPaquete;

  if (idPaquete) {
    this.service.getPaqueteByCodi(idPaquete).subscribe((paqueteCompleto: any) => {
      if (paqueteCompleto) {
        this.paqueteInfo = paqueteCompleto;                
        this.setValues();        
      }
    });
  }
}

  refrescar() {
    this.runas = [];
    this.cargarDatosPaquete();
  }

  public setValues() {
    this.tipoPaquete = this.paqueteInfo.tipoPaquete.toUpperCase();
    this.creacion = moment(this.paqueteInfo.creacion).format("DD/MM/YYYY");
    this.activo = (this.paqueteInfo.activo) ? 'En uso' : 'Inactivo';
    this.paqueteInfo.consultados.map((paq: EmpaqueModel) => {
      this.runas.push({
        url: '/assets/img/runas/' + paq.runaId.slice(0,2) + '.png',
        codr: paq.runaId,
        consultas: paq.consultas,
        semaforo: this.getSemaforoClas(paq.timestamp),
        inver: (paq.runaId.slice(-2) === '00') ? 'invertida' : ''
      });
    });
  }

  public getSemaforoClas(creacion: string): string {

    if (creacion === '') {
      return 'soff';
    }

    let diasRestantes = moment().diff(moment(creacion), 'days');

    switch(true) {
      case (diasRestantes < 1): //50%
        return 'son';
      case (diasRestantes < 2): //37.5%
        return 'swarn';
      case (diasRestantes < 3): //12.5%
        return 'sdan';
      default:
        return 'sout';          
    }

  }

}
