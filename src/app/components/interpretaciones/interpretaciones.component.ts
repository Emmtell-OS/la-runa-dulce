import { PaqueteModel } from './../../models/PaqueteModel';
import { LoteModel } from './../../models/LotelModel';
import { map, take, timeout } from 'rxjs/operators';
import { Component, inject, NgZone, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import moment from 'moment';
import { ProcessLotesService } from '../../service/process-lotes.service';
import { log } from 'console';
import { InterpretacionesServiceService } from '../../service/interpretaciones-service.service';
import Utils from '../../utilities/utils';
import { TemaService } from '../../service/tema.service';
import { TemasModel } from '../../models/TemasModel';
import { slideInOut } from '../../animaciones/slideInOut';
import { slideInUp } from '../../animaciones/slideInUp';
import { forkJoin } from 'rxjs';
import { EmpaqueModel } from '../../models/EmpaqueModel';


@Component({
  selector: 'app-interpretaciones',
  templateUrl: './interpretaciones.component.html',
  styleUrl: './interpretaciones.component.scss',
  animations: [slideInOut, slideInUp]
})
export class InterpretacionesComponent implements OnInit {
  dataJsonLP = [];
  catInterpretaciones = [];
  valueL: string;
  valueE: string;
  valueP: string;
  animacionRand: string;
  mostrarAnimacion: boolean;
  mostrarInterpretacion: boolean;
  mostrarReintento: boolean;
  mostrarCaducado: boolean;
  mostrarInicio: boolean;
  mostrarTexto: boolean;
  mostraraInterpretacion: boolean;
  mostraraReintento: boolean;
  mostraraCaducado: boolean;
  mostrarBtnInterpretacion: boolean;
  mostrarBtnInicio: boolean;
  mostrarApuntador: boolean;
  limiteDias = 3;
  textInterp = '';
  textoAnimacionList: any;
  textoAnimacion: any;
  idTextoAnimacion = 0;
  intervalTextoAnimacion: any;
  iniciar;
  _UNO = 1;
  imagen = './assets/img/runas/';
  catTemas: TemasModel;
  TEMACOLOR: any;
  TEMAIMG: any;
  bkgInterpretacion = '';
  nombreRuna: string;

  constructor(private activateRoute: ActivatedRoute, 
              private service: ProcessLotesService,
              private interpretacionesService: InterpretacionesServiceService,
              private temaService: TemaService) {
    this.mostrarAnimacion = false
    this.mostrarReintento = false;
    this.mostrarCaducado = false;
    this.mostrarInterpretacion = false;
    this.mostrarBtnInterpretacion = false;
    this.mostrarBtnInicio = false;
    this.mostrarApuntador = true;
    this.textoAnimacionList = ['Abriendo bolsa', 'Escogiendo runa', 'Interpretando', 'Listo'];
    //this.iniciarTexto();
    let x = 5;
    this.animacionRand = "/assets/img/animaciones/" + Utils.getRand(1, 3).toString() + ".gif";
    
  }

  ngOnInit(): void {
    //this.getRegistroLotes();
    this.getRegistroTema();
    this.getValores();
  }

  clickApuntador() {
    this.mostrarApuntador = false;
  }

  btnIniciar() {
    this.mostrarInicio = false
    this.iniciarTexto();
  }

  iniciarTexto() {
    this.textoAnimacion = 'Cargando'
    this.idTextoAnimacion = 0;
    this.intervalTextoAnimacion = setInterval(() => {
      if(this.idTextoAnimacion === this.textoAnimacionList.length) {
        this.mostrarBtnInterpretacion = true;
        this.iniciar = this.textoAnimacionList[this.textoAnimacionList.length - 1];
        clearInterval(this.intervalTextoAnimacion);
      }
      this.textoAnimacion = this.textoAnimacionList[this.idTextoAnimacion];
      this.idTextoAnimacion = this.idTextoAnimacion + 1;
    }, 1500); //cambiar a 1700
  }

  cerrarAnimacion() {
    this.mostrarBtnInicio = true
    if(this.mostraraReintento) {
      this.mostrarReintento = true;
      return
    }
    if (this.mostraraInterpretacion) {
      this.mostrarInterpretacion = true;
    } else if (this.mostraraCaducado) {
      this.mostrarCaducado = true;
    } else {
      this.mostrarReintento = true;
    }
    this.mostrarAnimacion = false;
    clearInterval(this.intervalTextoAnimacion);
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
    if (codi.length === 24) {
      this.valueL = codi.slice(0, 10);
      this.valueP = codi.slice(-10);
      this.valueE = codi.slice(10, 14);
      this.getRegistroInterpretaciones();
      this.orquestadorDeInterpretaciones(this.valueL, this.valueP, this.valueE);
    } else {
      this.mostrarReintento = true
    }
  }

  orquestadorDeInterpretaciones(loteRecibido: string, paqueteRecibido: string, runeCode: string) {
    forkJoin({
      lote: this.service.getLoteByCodi(loteRecibido).pipe(take(1)),
      paquete: this.service.getPaqueteByCodi(paqueteRecibido).pipe(take(1))
    }).subscribe({
      next: ({ lote, paquete }) => {
        if (lote && paquete) {
          const isLoteActivo = (lote['activo'] === true || lote['activo'] === 'true');
          const isPaqueteActivo = (paquete['activo'] === true || paquete['activo'] === 'true');          
          let consultado: EmpaqueModel = paquete['consultados'].find((emp: EmpaqueModel) => runeCode === emp.runaId);
          if (consultado && isLoteActivo && isPaqueteActivo && this.isLimiteDiasValido(consultado['timestamp'])) {                        
            this.obtenerInterpretacion(consultado['interpretacionId'], runeCode);            
            if (consultado.timestamp !== '') {
              consultado.consultas += this._UNO;
            } else {
              consultado.timestamp = moment().format();
              consultado.consultas = this._UNO;              
            }            
            this.service.updateConsultadosPaquete(paquete['codigo'], paquete['consultados'])
            .then(() => (this.textInterp === null) ? this.mostrarReintento = true : this.mostraraInterpretacion = true)
            .catch(err => this.mostrarReintento = true);
            return;
          }             
        }
        this.mostraraCaducado = true; 
      },
      error: (err) => {
        this.mostrarReintento = true
        console.error('Error al consultar Firebase:', err)
      }
    });
  }

  isLimiteDiasValido(fechaConsultado: string): boolean {
    if(fechaConsultado === '') {
      return true;
    }
    return moment().diff(moment(fechaConsultado, 'YYYY-MM-DDTHH:mm:ssZ'),'days') < this.limiteDias
  }

  private obtenerInterpretacion(id: number, runaCode: string) {
    
    //TODO ajustar a la nueva estructura de interpretaciones
    this.imagen = this.imagen + runaCode.slice(0,2) + '.png'
    let filtrado = this.catInterpretaciones[id];
    this.nombreRuna = Utils.getNombreRuna(runaCode.slice(0,2));
    
    if (filtrado !== undefined && filtrado !== '') {
      this.textInterp = filtrado;
      return; 
    }

    let interpretacion = Utils.elegirInterpretacion(this.catInterpretaciones); 
    this.textInterp = (interpretacion === null) ? null : this.catInterpretaciones[interpretacion];
  }

  public async getRegistroInterpretaciones() {
    this.interpretacionesService.getTipo(this.valueE).valueChanges().subscribe(val => {
      this.catInterpretaciones = val[1];
    })
  }

  /*-------------------------------------TEMAS---------------------------------------------------------------*/
  public async getRegistroTema() {
    /**conexión y consumo de Firebase */
    await this.obtenerFirebaseDataTema().then((data: any) => {
      this.catTemas = data.find((t) => t.asignado === true);
    });
    this.asignarTema();
  }

  obtenerFirebaseDataTema() {
    return new Promise((resolve, reject) => {
      this.temaService.getAll().valueChanges().subscribe(val => {
        resolve(val);
      })
    });
  }

  private asignarTema() {
    let color = '#' + this.catTemas.color;
    this.TEMACOLOR = {
      'background-color': color
    }
    setTimeout(() => {
      this.mostrarInicio = true      
      this.TEMAIMG = {
        //'background-image': `url('./assets/bkg-interpretacion/${this.catTemas.imagen}')`,
        'background-image': `url('${this.catTemas.imagen}')`,
        'background-size': 'cover',
        'background-color': color,
        'opacity': '1.5'
      }
    }, 100);
    
  }
}
