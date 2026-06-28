import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProcessLotesService } from '../../service/process-lotes.service';
import { environment } from '../../../environments/environment';
import { CodiModel } from '../../models/CodiModel';
import { forkJoin, take } from 'rxjs';
import { EmpaqueModel } from '../../models/EmpaqueModel';
import { LoteJsonModel } from '../../models/LoteJsonModel';
import { PaqueteModel } from '../../models/PaqueteModel';
import { Console } from 'console';

@Component({
  selector: 'app-codi-detailes',
  templateUrl: './codi-detailes.component.html',
  styleUrl: './codi-detailes.component.scss',
})
export class CodiDetailesComponent implements OnInit {
  lote: LoteJsonModel;
  paquete: PaqueteModel;
  image: string;
  loteCode: string;
  paqueteCode: string;
  runaCode: string;
  tipoPaquete: string;
  consultados: string;
  estatus: string;
  pathQR: string;
  dataJsonLP = [];
  pathBase = environment.pathInterp;
  mostrar = false;
  qrList: CodiModel[] = [];
  isExist: boolean;
  mensajeExist: string;
  _ZERO = 0;

  constructor(
    private activateRoute: ActivatedRoute,
    private service: ProcessLotesService
  ) {}

  ngOnInit(): void {
    this.getValores();
  }

  private getValores() {
    this.qrList = [];
    let codi = this.activateRoute.snapshot.paramMap.get('codi');
    this.loteCode = codi.slice(0, 10);
    this.paqueteCode = codi.slice(-10);
    this.runaCode = codi.slice(10, 14);
    this.image = './assets/img/runas/' + this.runaCode.slice(0, 2) + '.png';
    this.pathQR = this.pathBase + codi;

    forkJoin({
      lote: this.service.getLoteByCodi(this.loteCode).pipe(take(1)),
      paquete: this.service.getPaqueteByCodi(this.paqueteCode).pipe(take(1))
    }).subscribe({
      next: ({ lote, paquete }) => {
        if (!lote) {
          this.mensajeExist = `Lote - ${this.loteCode}`;
          this.isExist = false;
          return;
        } else if (!paquete) {
          this.mensajeExist = `Paquete - ${this.paqueteCode} del Lote - ${this.loteCode}`;
          this.isExist = false;
          return;
        } else {
          this.paquete = paquete;
          this.lote = lote;
          try {
            let consultado: EmpaqueModel = paquete['consultados'].find((emp: EmpaqueModel) => this.runaCode === emp.runaId);
            this.consultados = consultado.consultas.toString();
            this.estatus = paquete['activo'] ? 'ACTIVO' : 'INACTIVO';
            this.tipoPaquete = paquete['tipoPaquete'];
            this.mostrar = true;
          } catch (error) {
            this.mensajeExist = `elemento, intenta de nuevo.`;
            this.isExist = false;
            return;
          }
      
          this.qrList.push({
            codi: this.pathQR,
            img: this.image,
            folio: '',
          });
          this.isExist = true;
        }
      },
      error: (err) => {        
        console.error('Error al consultar Firebase:', err)
      }
    });
  }

  reiniciarConsultados() {
    let consultado: EmpaqueModel = this.paquete['consultados'].find((emp: EmpaqueModel) => this.runaCode === emp.runaId);
    consultado.consultas = this._ZERO;
    consultado.timestamp = '';

    this.service.updateConsultadosPaquete(this.paquete['codigo'], this.paquete['consultados'])
            .then(() => { this.getValores(); })
            .catch(err => console.error('Hubo un error => ' + err));    
  }
}
