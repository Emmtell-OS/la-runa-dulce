import { map, timeout } from 'rxjs/operators';
import { Component, inject, NgZone, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import moment from 'moment';

@Component({
  selector: 'app-interpretaciones',
  templateUrl: './interpretaciones.component.html',
  styleUrl: './interpretaciones.component.scss',
})
export class InterpretacionesComponent implements OnInit {
  dataJsonLP = [];
  valueL: string;
  valueE: string;
  valueP: string;
  mostrarAnimacion: boolean = true;
  mostrarInterpretacion: boolean;
  mostrarReintento: boolean;
  mostrarCaducado: boolean;
  limiteDias = 7;
  textInterp = '';
  textoAnimacionList: any;
  textoAnimacion: any;
  idTextoAnimacion = 0;
  intervalTextoAnimacion: any;
  iniciar;

  constructor(private activateRoute: ActivatedRoute) {
    this.mostrarReintento = false;
    this.mostrarCaducado = false;
    this.mostrarInterpretacion = false;
    this.textoAnimacionList = ['Abriendo bolsa...', 'Revolviendo...', 'Escogiendo runa...', 'Presiona para continuar ->'];
    this.iniciarTexto();
  }

  ngOnInit(): void {
    this.getRegistroLotes();
    this.getValores();
    this.showInterpretacion();
  }

  iniciarTexto() {
    this.idTextoAnimacion = 0;
    this.intervalTextoAnimacion = setInterval(() => {
      if(this.idTextoAnimacion === this.textoAnimacionList.length) {
        this.iniciar = this.textoAnimacionList[this.textoAnimacionList.length - 1];
        clearInterval(this.intervalTextoAnimacion);
      }
      this.textoAnimacion = this.textoAnimacionList[this.idTextoAnimacion];
      this.idTextoAnimacion = this.idTextoAnimacion + 1;
    }, 3500);
  }

  cerrarAnimacion() {
    this.mostrarAnimacion = false;
    clearInterval(this.intervalTextoAnimacion);
  }

  private getRegistroLotes() {
    /**conexión y consumo de Firebase */
    try {
      let fireb =
        '[{"lote":"RA34l0H0Nu","activo":true,"creacion":"2024-08-15T16:42:58.286Z","paquetes":[{"codigo":"FlF6zWzyMw","activo":true,"creacion":"2024-08-15T16:42:58.286Z","estatusProduccion":"T","tipoPaquete":"Tira","consultados":[{"SW01":"","consultas":0,"inter":3},{"JE01":"","consultas":0,"inter":2},{"NA00":"","consultas":0,"inter":2},{"TE00":"","consultas":0,"inter":0},{"DA01":"","consultas":0,"inter":1},{"MA01":"","consultas":0,"inter":1},{"UR00":"","consultas":0,"inter":1},{"EI01":"","consultas":0,"inter":1},{"AL01":"","consultas":0,"inter":0},{"LA00":"","consultas":0,"inter":3},{"EH01":"","consultas":0,"inter":0},{"NA01":"","consultas":0,"inter":1}]},{"codigo":"v658BCdrTw","activo":true,"creacion":"2024-08-15T16:42:58.286Z","estatusProduccion":"T","tipoPaquete":"Tira","consultados":[{"DA01":"","consultas":0,"inter":0},{"AS00":"","consultas":0,"inter":3},{"BE00":"","consultas":0,"inter":3},{"NG01":"","consultas":0,"inter":0},{"KA01":"","consultas":0,"inter":2},{"AL00":"","consultas":0,"inter":1},{"TH00":"","consultas":0,"inter":0},{"EI01":"","consultas":0,"inter":0},{"GE01":"","consultas":0,"inter":1},{"TE00":"","consultas":0,"inter":0},{"AL01":"","consultas":0,"inter":1},{"OD01":"","consultas":0,"inter":1}]},{"codigo":"ZTTrljeqtD","activo":true,"creacion":"2024-08-15T16:43:21.650Z","estatusProduccion":"P","tipoPaquete":"Caja","consultados":[{"HA01":"","consultas":0,"inter":3},{"BE01":"","consultas":0,"inter":1},{"GE01":"","consultas":0,"inter":2},{"PE01":"","consultas":0,"inter":0},{"TE01":"","consultas":0,"inter":0},{"BE00":"","consultas":0,"inter":3},{"NG01":"","consultas":0,"inter":0},{"RA01":"","consultas":0,"inter":0},{"LA01":"","consultas":0,"inter":1},{"OT01":"","consultas":0,"inter":2},{"NA00":"","consultas":0,"inter":3},{"IS01":"","consultas":0,"inter":3}]}]}]';
      this.dataJsonLP = JSON.parse(fireb);
      console.log(this.dataJsonLP);
    } catch (error) {
      this.mostrarReintento = true;
    }
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
      //this.mostrarAnimacion = false;
      this.mostrarInterpretacion = true;
    } else {
      //this.mostrarAnimacion = false;
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
                    moment(paq['consultados'][indexEmp][this.valueE]),
                    'days'
                  ) < this.limiteDias
                ) {
                  this.obtenerInterpretacion(
                    paq['consultados'][indexEmp]['inter']
                  );
                  paq['consultados'][indexEmp]['consultas'] =
                    paq['consultados'][indexEmp]['consultas']['consultas'] + 1;
                  valid = true;
                }
              } else {
                paq['consultados'][indexEmp][this.valueE] = moment();
                paq['consultados'][indexEmp]['consultas'] = 1;
                this.obtenerInterpretacion(
                  paq['consultados'][indexEmp]['inter']
                );
                valid = true;
              }
            }
          }
        });
      }
    });

    //save json
    console.log(this.dataJsonLP);
    return valid;
  }

  private obtenerInterpretacion(id: number) {
    //conectarse a firebase
    //obtener el numero de interpretacion de la runa
    //asignarlo a inter
    this.textInterp = 'Esta es la interpretacion';
    console.log(this.textInterp);
  }
}
