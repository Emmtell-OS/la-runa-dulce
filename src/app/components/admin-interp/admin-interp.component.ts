import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, map, startWith } from 'rxjs';
import { InterpretacionesServiceService } from '../../service/interpretaciones-service.service';
import { limit } from 'firebase/firestore';
import { log } from 'console';

@Component({
  selector: 'app-admin-interp',
  templateUrl: './admin-interp.component.html',
  styleUrl: './admin-interp.component.scss'
})
export class AdminInterpComponent {


  formularioInterpretaciones: FormGroup;
  interpretaciones: string[] = [];
  autoCompleteInputValue: any;
  runaFilterControl: FormControl = new FormControl('', Validators.required);
  runas: Observable<any[]>;
  catInterpretaciones = [];
  runasList = [];
  runasBase = [];
  interpretacionControl: any; //FormControl = new FormControl('');
  descripcionInput = false;
  descripcionP = false;
  selectInterp = false;
  btnEditar = false;
  btnCreate = false;
  txtActualizar = 'Actualizar';
  txtRegistrar = 'Registrar';
  txtbtn = '';
  descripcionParrafo = 'descripción...';
  mostrarMensaje = false;
  mensaje = null;
  _REGISTRADO = 'Se ha registrado la interpretación con éxito para ';
  _ERROR = 'La descripción no puede estar vacía y debe tener más de 10 caracteres';

  constructor(private service: InterpretacionesServiceService) {
    this.getRegistroInterpretaciones();
    this.formularioInterpretaciones = new FormGroup({
      runa: new FormControl('', Validators.required),
      interpretacion: new FormControl('', Validators.required),
      descripcion: new FormControl('')
    });
  }

  public async getRegistroInterpretaciones() {
    this.catInterpretaciones.splice(0, this.catInterpretaciones.length)
    /**conexión y consumo de Firebase */
    await this.obtenerFirebaseData().then((data: []) => {
      this.catInterpretaciones = data;
    });
    this.runasList.splice(0, this.runasList.length);
    this.runasBase = this.carga();
    this.cargarRunasCodigos();

  }

  obtenerFirebaseData() {
    return new Promise((resolve, reject) => {
      this.service.getAll().valueChanges().subscribe(val => {
        resolve(val);
      })
    });
  }

  obtenerValorRuna() {
    this.llenarInterpretaciones(this.autoCompleteInputValue);
    if(!this.selectInterp) {
      this.selectInterp = true;
    }
    this.formularioInterpretaciones.reset();
    this.descripcionInput = false;
    this.descripcionP = false;
    this.btnCreate = false;
    this.btnEditar = false;
    this.formularioInterpretaciones.setValue({
      runa: this.autoCompleteInputValue,
      interpretacion: null,
      descripcion: null
    });
  }

  obtenerValorInterpretacion() {
    let seleccionado = this.formularioInterpretaciones.value['interpretacion'];
    let runa = this.formularioInterpretaciones.value['runa'];
    let runaCode = this.runasBase.find((r) => r['runa'] === runa)['codigo'];
    let filtrado = this.catInterpretaciones.find((runa) => Object.keys(runa)[0] === runaCode);

    if (seleccionado === 'NUEVO') {
      this.txtbtn = this.txtRegistrar;
      this.btnCreate = true;
      this.descripcionInput = true;
      this.btnEditar = false;
      this.descripcionP = false;
    } else {
      this.btnCreate = false;
      this.descripcionInput = false;
      this.descripcionP = true;
      this.btnEditar = true;
      this.descripcionParrafo = filtrado[runaCode][seleccionado - 1];
      
    }
  }

  registrarInterpretacion() {
    let descripcion = this.formularioInterpretaciones.value['descripcion'];
    let descripcionValida = this.validarDescripcion(descripcion);
    let runaCode = this.runasBase.find((r) => r['runa'] === this.formularioInterpretaciones.value['runa'])['codigo'];
    if(this.formularioInterpretaciones.value['interpretacion'] === 'NUEVO' && descripcionValida) {

      let filtrado = this.catInterpretaciones.find((runa) => Object.keys(runa)[0] === runaCode);
      
      if (filtrado === undefined) {
        //console.log('nueva runa');
        let req = new Object();
        req[runaCode] = [descripcion];
        this.service.create(this.formularioInterpretaciones.value['runa'], req);
      } else {
        //console.log('nueva interpretacion');
        filtrado[runaCode].push(descripcion);
        this.service.create(this.formularioInterpretaciones.value['runa'], filtrado);
      }

      this.reiniciar(this.formularioInterpretaciones.value['runa']);
      return;
    }
  
    if(!descripcionValida) {
      this.pintarMensaje(null);
    } else {
      //Actualizar
      let filtrado = this.catInterpretaciones.find((runa) => Object.keys(runa)[0] === runaCode);
      filtrado[runaCode].splice([this.formularioInterpretaciones.value['interpretacion'] -1], 1, descripcion)
      this.service.create(this.formularioInterpretaciones.value['runa'], filtrado);
      this.reiniciar(this.formularioInterpretaciones.value['runa']);
    }
    
  }

  editarInterpretacion() {

    this.formularioInterpretaciones.setValue({
      runa: this.formularioInterpretaciones.value['runa'],
      interpretacion: this.formularioInterpretaciones.value['interpretacion'],
      descripcion: this.descripcionParrafo
    });

    this.txtbtn = this.txtActualizar;
    this.btnEditar = false;
    this.btnCreate = true;
    this.descripcionP = false;
    this.descripcionInput = true;
  }

  validarDescripcion(descripcion: any): any {

    if (descripcion !== '' && descripcion !== null && descripcion.toString().length > 10 &&
        descripcion !== undefined && descripcion.trim() !== '') {
          return true;
        }

    return false
  }

  reiniciar(runa: string) {
    this.formularioInterpretaciones.reset();
    this.btnCreate = false;
    this.btnEditar = false;
    this.selectInterp = false;
    this.descripcionInput = false;
    this.pintarMensaje(runa);
    this.getRegistroInterpretaciones();
  }

  pintarMensaje(msj: string) {
    this.mensaje = (msj !== null) ? this._REGISTRADO + msj : this._ERROR;
    this.mostrarMensaje = true;
    setTimeout(() => {
      this.mostrarMensaje = false;
      this.mensaje = '';
    }, 8000);
  }

  llenarInterpretaciones(runa: any) {
    let limit = null;
    this.interpretaciones.splice(0, this.interpretaciones.length);
    this.interpretaciones.push('NUEVO');
    let runaCode = this.runasBase.find((r) => r['runa'] === runa)['codigo'];
    let filtrado = this.catInterpretaciones.find((r) => Object.keys(r).includes(runaCode.toString()));

    if (filtrado !== undefined) {
      
      limit = Number(filtrado[runaCode].length);
      
      for (let i = 0; i < limit; i++) {
        let toAdd = i + 1;
        this.interpretaciones.push(toAdd.toString());
      }
      
    }
  }

  cargarRunasCodigos() {
    this.runasList.push(...this.runasBase);
    this.runas = this.runaFilterControl.valueChanges
    .pipe(
      startWith(''),
      map(lote => lote ? this.filterRunas(lote) : this.runasList.slice())
    );
  }

  filterRunas(name: string) {
    return this.runasList.filter(run => run['runa'].toUpperCase().includes(name.toUpperCase()));
  }

  carga() {
    return [
      {
        'runa': 'GEBO',
        'codigo': 'GE01'
      },
      {
        'runa': 'EIHWAZ',
        'codigo': 'EI01'
      },
      {
        'runa': 'INGUZ',
        'codigo': 'NG01'
      },
      {
        'runa': 'JERA',
        'codigo': 'JE01'
      },
      {
        'runa': 'HAGALAZ',
        'codigo': 'HA01'
      },
      {
        'runa': 'SOWELU',
        'codigo': 'SW01'
      },
      {
        'runa': 'ISA',
        'codigo': 'IS01'
      },
      {
        'runa': 'DAGAZ',
        'codigo': 'DA01'
      },
      {
        'runa': 'ODIN',
        'codigo': 'OD01'
      },
      {
        'runa': 'URUZ',
        'codigo': 'UR01'
      },
      {
        'runa': 'URUZ-I',
        'codigo': 'UR00'
      },
      {
        'runa': 'OTHILA',
        'codigo': 'OT01'
      },
      {
        'runa': 'OTHILA-I',
        'codigo': 'OT00'
      },
      {
        'runa': 'ANSUZ',
        'codigo': 'AS01'
      },
      {
        'runa': 'ANSUZ-I',
        'codigo': 'AS00'
      },
      {
        'runa': 'MANNAZ',
        'codigo': 'MA01'
      },
      {
        'runa': 'MANNAZ-I',
        'codigo': 'MA00'
      },
      {
        'runa': 'ALGIZ',
        'codigo': 'AL01'
      },
      {
        'runa': 'ALGIZ-I',
        'codigo': 'AL00'
      },
      {
        'runa': 'NAUTHIZ',
        'codigo': 'NA01'
      },
      {
        'runa': 'NAUTHIZ-I',
        'codigo': 'NA00'
      },
      {
        'runa': 'PERTH',
        'codigo': 'PE01'
      },
      {
        'runa': 'PERTH-I',
        'codigo': 'PE00'
      },
      {
        'runa': 'TEIWAZ',
        'codigo': 'TE01'
      },
      {
        'runa': 'TEIWAZ-I',
        'codigo': 'TE00'
      },
      {
        'runa': 'KANO',
        'codigo': 'KA01'
      },
      {
        'runa': 'KANO-I',
        'codigo': 'KA00'
      },
      {
        'runa': 'WUNJO',
        'codigo': 'WU01'
      },
      {
        'runa': 'WUNJO-I',
        'codigo': 'WU00'
      },
      {
        'runa': 'FEHU',
        'codigo': 'FE01'
      },
      {
        'runa': 'FEHU-I',
        'codigo': 'FE00'
      },
      {
        'runa': 'RAIDO',
        'codigo': 'RA01'
      },
      {
        'runa': 'RAIDO-I',
        'codigo': 'RA00'
      },
      {
        'runa': 'EHWAZ',
        'codigo': 'EH01'
      },
      {
        'runa': 'EHWAZ-I',
        'codigo': 'EH00'
      },
      {
        'runa': 'BERKANA',
        'codigo': 'BE01'
      },
      {
        'runa': 'BERKANA-I',
        'codigo': 'BE00'
      },
      {
        'runa': 'THURIZAS',
        'codigo': 'TH01'
      },
      {
        'runa': 'THURIZAS-I',
        'codigo': 'TH00'
      },
      {
        'runa': 'LAGUZ',
        'codigo': 'LA01'
      },
      {
        'runa': 'LAGUZ-I',
        'codigo': 'LA00'
      }
    ];
  }

}
