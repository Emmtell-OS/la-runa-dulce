import { map, timeout } from 'rxjs/operators';
import { Component, inject, NgZone, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import moment from 'moment';
import { ProcessLotesService } from '../../service/process-lotes.service';
import { log } from 'console';
import { InterpretacionesServiceService } from '../../service/interpretaciones-service.service';
import Utils from '../../utilities/utils';
import { TemaService } from '../../service/tema.service';

@Component({
  selector: 'app-interpretaciones',
  templateUrl: './interpretaciones.component.html',
  styleUrl: './interpretaciones.component.scss',
})
export class InterpretacionesComponent implements OnInit {
  dataJsonLP = [];
  catInterpretaciones = [];
  valueL: string;
  valueE: string;
  valueP: string;
  mostrarAnimacion: boolean = true;
  mostrarInterpretacion: boolean;
  mostrarReintento: boolean;
  mostrarCaducado: boolean;
  mostrarInicio: boolean;
  mostrarTexto: boolean;
  limiteDias = 7;
  textInterp = '';
  textoAnimacionList: any;
  textoAnimacion: any;
  idTextoAnimacion = 0;
  intervalTextoAnimacion: any;
  iniciar;
  _UNO = 1;
  imagen = './assets/img/';
  tema = '';
  bkgInterpretacion = '';

  constructor(private activateRoute: ActivatedRoute, 
              private service: ProcessLotesService,
              private interpretacionesService: InterpretacionesServiceService,
              private temaService: TemaService) {
    
    this.mostrarInicio = true;
    this.mostrarReintento = false;
    this.mostrarCaducado = false;
    this.mostrarInterpretacion = false;
    this.textoAnimacionList = ['Abriendo bolsa ...', 'Revolviendo ...', 'Escogiendo runa ...', 'Continuar ->'];
    //this.iniciarTexto();
    let x = 5;
    
    
  }

  ngOnInit(): void {
    this.getRegistroLotes();
    this.getRegistroTema();
    this.getValores();
  }

  btnIniciar() {
    this.mostrarInicio = false
    this.iniciarTexto();
  }

  iniciarTexto() {
    this.textoAnimacion = 'Cargando ...'
    this.idTextoAnimacion = 0;
    this.intervalTextoAnimacion = setInterval(() => {
      if(this.idTextoAnimacion === this.textoAnimacionList.length) {
        this.iniciar = this.textoAnimacionList[this.textoAnimacionList.length - 1];
        clearInterval(this.intervalTextoAnimacion);
      }
      this.textoAnimacion = this.textoAnimacionList[this.idTextoAnimacion];
      this.idTextoAnimacion = this.idTextoAnimacion + 1;
    }, 4000);
  }

  cerrarAnimacion() {
    this.mostrarAnimacion = false;
    clearInterval(this.intervalTextoAnimacion);
  }

  private async getRegistroLotes() {
    /**conexión y consumo de Firebase */
    try {
      await this.obtenerFirebaseData().then((data: []) => {
        this.dataJsonLP = data;
      });
      this.getRegistroInterpretaciones();      
    } catch (error) {
      this.mostrarReintento = true;
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
    this.valueL = codi.slice(0, 10);
    this.valueP = codi.slice(-10);
    this.valueE = codi.slice(10, 14);
  }

  showInterpretacion(): any {
    let valid = this.isValid();

    if (valid) {
      this.mostrarInterpretacion = true;
    } else {
      this.mostrarCaducado = true;
    }
  }

  private isValid(): any {
    let valid = false;

    this.dataJsonLP.find((lote) => {
      if (lote['lote'] === this.valueL && lote['activo']) {
        lote['paquetes'].find((paq) => {
          if (paq['codigo'] === this.valueP && paq['activo']) {
            let indexEmp = paq['consultados'].findIndex((em) =>
              Object.keys(em).includes(this.valueE)
            );
            if (indexEmp !== -1) {
              if (paq['consultados'][indexEmp][this.valueE] !== '') {
                if (
                  moment().diff(
                    moment(paq['consultados'][indexEmp][this.valueE], false),
                    'days'
                  ) < this.limiteDias
                ) {
                  this.obtenerInterpretacion(paq['consultados'][indexEmp]['inter'], this.valueE);
                  let contadorConsultas = paq['consultados'][indexEmp]['consultas'];
                  contadorConsultas += this._UNO;
                  paq['consultados'][indexEmp]['consultas'] = contadorConsultas;
                  valid = true;
                }
              } else {
                paq['consultados'][indexEmp][this.valueE] = moment().format();
                paq['consultados'][indexEmp]['consultas'] = 1;
                this.obtenerInterpretacion(
                  paq['consultados'][indexEmp]['inter'],
                  this.valueE
                );
                valid = true;
              }
            }
          }
        });
      }
    });

    if(valid) {
      let loteToSave = this.dataJsonLP.find((lote) => lote['lote'] === this.valueL && lote['activo'])
      this.service.update(this.valueL.toString(), loteToSave);
    }

    return valid;
  }

  private obtenerInterpretacion(id: number, runaCode: string) {
    let filtrado = this.catInterpretaciones.find((runa) => Object.keys(runa)[0] === runaCode);
    
    if (filtrado !== undefined ) {
      if (filtrado[runaCode][id] !== undefined) {
        this.textInterp = filtrado[runaCode][id];
        return;
      }
    }
    let interpretacion = Utils.elegirInterpretacion(runaCode, this.catInterpretaciones);      
    this.textInterp = (interpretacion === null) ? 'Reintenta mas tarde...' : filtrado[runaCode][interpretacion];

    this.imagen = this.imagen + runaCode.slice(0,2) + '.png'
  }

  public async getRegistroInterpretaciones() {
    this.catInterpretaciones.splice(0, this.catInterpretaciones.length)
    /**conexión y consumo de Firebase */
    await this.obtenerFirebaseDataInterp().then((data: []) => {
      this.catInterpretaciones = data;
    });
    this.showInterpretacion();
  }

  obtenerFirebaseDataInterp() {
    return new Promise((resolve, reject) => {
      this.interpretacionesService.getAll().valueChanges().subscribe(val => {
        resolve(val);
      })
    });
  }

  public async getRegistroTema() {
    /**conexión y consumo de Firebase */
    await this.obtenerFirebaseDataTema().then((data: any) => {
      this.tema = data[0];
      this.bkgInterpretacion = './assets/bkg-interpretacion/' + data[0] + '.gif';
    });
  }

  obtenerFirebaseDataTema() {
    return new Promise((resolve, reject) => {
      this.temaService.getAll().valueChanges().subscribe(val => {
        resolve(val);
      })
    });
  }
}
