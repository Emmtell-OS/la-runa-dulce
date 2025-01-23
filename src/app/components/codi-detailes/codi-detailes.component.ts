import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProcessLotesService } from '../../service/process-lotes.service';
import { environment } from '../../../environments/environment';
import { CodiModel } from '../../models/CodiModel';

@Component({
  selector: 'app-codi-detailes',
  templateUrl: './codi-detailes.component.html',
  styleUrl: './codi-detailes.component.scss'
})
export class CodiDetailesComponent implements OnInit {

  image: string;
  lote: string;
  paquete: string;
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

  constructor(private activateRoute: ActivatedRoute,
              private service: ProcessLotesService,) {
  }

  ngOnInit(): void {
    this.getRegistroLotes();
  }

  private async getRegistroLotes() {
    /**conexión y consumo de Firebase */
    try {
      this.dataJsonLP = [];
      await this.obtenerFirebaseData().then((data: []) => {
        this.dataJsonLP = data;
      });
      this.getValores();
    } catch (error) {
      console.error(error);
      
    }
  }

  obtenerFirebaseData() {
    return new Promise((resolve, reject) => {
      this.service.getAll().valueChanges().subscribe(val => {
        resolve(val);
      })
    });
  }

  private getValores(): any {
    let codi = this.activateRoute.snapshot.paramMap.get('codi');
    this.lote = codi.slice(0, 10);
    this.paquete = codi.slice(-10);
    this.runaCode = codi.slice(10, 14);
    this.image = './assets/img/' + this.runaCode.slice(0, 2) + '.png';
    this.pathQR = this.pathBase + codi;
    
    let lot = this.dataJsonLP.find((lotes) => lotes['lote'] === this.lote);
    if (lot === undefined) {
      this.mensajeExist = `Lote - ${this.lote}`;
      this.isExist = false;
      return;
    }
    let paq = lot['paquetes'].find((paquetes) => paquetes['codigo'] === this.paquete);
    if (paq === undefined) {
      this.mensajeExist = `Paquete - ${this.paquete} del Lote - ${this.lote}`;
      this.isExist = false;
      return;
    }
    
    let consul = paq['consultados'].find((cns) => Object.keys(cns)[0] === this.runaCode);
    this.consultados = consul['consultas'];
    this.estatus = (paq['activo']) ? 'ACTIVO' : 'INACTIVO';
    this.tipoPaquete = paq['tipoPaquete'];
    this.mostrar = true;

    this.qrList.push({
      codi: this.pathQR,
      img: this.image,
      folio: ''
    });
    this.isExist = true;
    
  }

  reiniciarConsultados() {

    let isSaveValid = false;
    this.dataJsonLP.find((lote => {
      if(lote['lote'] === this.lote) {
        lote['paquetes'].find(paq => {
          if(paq['codigo'] === this.paquete) {
            let indexConsultado = paq['consultados'].findIndex((elm) => Object.keys(elm)[0] === this.runaCode);
            paq['consultados'][indexConsultado][this.runaCode] = '';
            paq['consultados'][indexConsultado]['consultas'] = 0;
            isSaveValid = true;
          }
        });
      }
    }));

    if(isSaveValid) {
      let loteToSave = this.dataJsonLP.find(lote => lote['lote'] === this.lote);
      this.service.update(this.lote, loteToSave);
      this.getRegistroLotes();
      this.qrList = [];
    }
    

  }

}
