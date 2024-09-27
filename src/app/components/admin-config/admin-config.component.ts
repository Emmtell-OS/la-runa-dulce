import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TiposPaqueteModel } from '../../models/TiposPaqueteModel';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { TipoPaquetesServiceService } from '../../service/tipo-paquetes-service.service';
import { log } from 'console';
import { TemaService } from '../../service/tema.service';
import { MatDialog } from '@angular/material/dialog';
import { EliminarComponent } from '../modals/eliminar/eliminar.component';
import { TemasModel } from '../../models/TemasModel';

@Component({
  selector: 'app-admin-config',
  templateUrl: './admin-config.component.html',
  styleUrl: './admin-config.component.scss'
})
export class AdminConfigComponent {

  _TIPOS_PAQUETE = "tipoPaquetes";
  formularioTiposPaquetes: FormGroup;
  formularioTemas: FormGroup;
  displayedTiposPaquetesColumns = ['tipoPaquete', 'totalEmpaques', 'columnGrid', 'rowGrid', 'actions'];
  datasourceTP: any;
  catTipoPaquete: TiposPaqueteModel[] = [];
  _columnGridValue = 0;
  _rowGridValue = 0;
  modificar = false;
  modificarTema = false;
  tipoPaqueteUpdate = ''
  readonly dialog = inject(MatDialog);
  displayedTemasColumns = ['tema', 'color', 'imagen', 'actions'];
  datasourceTemas: any;
  catTemas: TemasModel[] = [];
  temaUpdate = ''
  

  constructor(private tpService: TipoPaquetesServiceService,
              private temaService: TemaService) {
    this.getRegistroTiposPaquete();
    this.getRegistroTema();
    this.formularioTiposPaquetes = new FormGroup({
      tipoPaquete: new FormControl('', Validators.required),
      totalEmpaques: new FormControl('', [Validators.required, Validators.min(4)])
    });
    this.formularioTemas = new FormGroup({
      tema: new FormControl('', Validators.required),
      color: new FormControl('', Validators.required),
      imagen: new FormControl('', Validators.required)
    });
  }

  public async getRegistroTiposPaquete() {
    this.datasourceTP = []
    this.catTipoPaquete.splice(0, this.catTipoPaquete.length)
    /**conexión y consumo de Firebase */
    await this.obtenerFirebaseData().then((data: []) => {
      this.catTipoPaquete.push(...data);
    });
    this.cargarTabla();
  }

  obtenerFirebaseData() {
    return new Promise((resolve, reject) => {
      this.tpService.getAll().valueChanges().subscribe(val => {
        resolve(val);
      })
    });
  }

  public calcular() {
    let menor = 0;
    let CUATRO = this.unirValores(this.formularioTiposPaquetes.value['totalEmpaques'], 4)
    let CINCO = this.unirValores(this.formularioTiposPaquetes.value['totalEmpaques'], 5)
    let SEIS = this.unirValores(this.formularioTiposPaquetes.value['totalEmpaques'], 6)
    let listS = [CUATRO.toString(), CINCO.toString(), SEIS.toString()];
    let menores = this.derechoPequeño(listS)
    if(menores.length > 1) {
      menores = menores.sort();
    }
    menor = menores[0];
    
    switch(Number(menor)) {
      case CUATRO:
        this._columnGridValue = 4;
        this._rowGridValue = Number(menor.toString().slice(0, (menor.toString().length -1)));
        break;
      case CINCO:
        this._columnGridValue = 5;
        this._rowGridValue = Number(menor.toString().slice(0, (menor.toString().length -1)));
        break;
      case SEIS:
        this._columnGridValue = 6;
        this._rowGridValue = Number(menor.toString().slice(0, (menor.toString().length -1)));
        break;
    }

    this.archivar()

  }

  private derechoPequeño(lista: string[]){
    let listaDer = [];
    let listaMenores = [];
    lista.map((i: string) => {
      listaDer.push(Number(i.slice(-1)))
    });
    listaDer = listaDer.sort();
    lista.forEach((v: string) => {
      if(v.slice(-1) === listaDer[0].toString()) {
        listaMenores.push(v);
      }
    });
    return listaMenores;
  }

  private unirValores(inicial: number, dividendo: number) {
    let result = 0
    let i = Math.ceil(inicial / dividendo);
    let res = inicial - (i * dividendo)
    if(res === 0) {
      return result = Number(i.toString() + res.toString());
    }
    let d = dividendo - res;
    return result = Number(i.toString() + d.toString());
  }

  private archivar() {
    let ftp = this.formularioTiposPaquetes.value['tipoPaquete'].toUpperCase().trimStart().trimEnd();
    let existe = this.catTipoPaquete.filter((tp) =>  tp.tipoPaquete === ftp);
    if (existe.length === 0 || this.modificar) {
      if (this.modificar) {
        console.log(this.tipoPaqueteUpdate);
        
        this.eliminarTipoPaquete(this.tipoPaqueteUpdate, true);
      }
      let tiposPaquetesModel: TiposPaqueteModel = {
        tipoPaquete: ftp,
        totalEmpaques: this.formularioTiposPaquetes.value['totalEmpaques'],
        columnGrid: this._columnGridValue,
        rowGrid: this._rowGridValue
      }
      this.tpService.create(this._TIPOS_PAQUETE + '/' + tiposPaquetesModel['tipoPaquete'], tiposPaquetesModel);
      this.getRegistroTiposPaquete();
      this.formularioTiposPaquetes.reset();
    }
  }

  private cargarTabla() {
    this.datasourceTP = new MatTableDataSource(this.catTipoPaquete);
  }

  public editar(element: any) {
    this.formularioTiposPaquetes.setValue({
      tipoPaquete: element['tipoPaquete'].toLowerCase(),
      totalEmpaques: element['totalEmpaques']
    });
    this.modificar = true;
    this.tipoPaqueteUpdate = element['tipoPaquete'];
    //this.eliminarTipoPaquete(element, true);
  }

  private eliminarTipoPaquete(tipoPaquete: any, isEditar: boolean) {    
    this.tpService.delete(this._TIPOS_PAQUETE + '/' + tipoPaquete);
    if(!isEditar) {
      this.getRegistroTiposPaquete();
    }
  }

  public mostrarEliminar(element: any, isEditar: boolean) {
    const dialogRef = this.dialog.open(EliminarComponent, {
      data: {seccion: 'tipoPaquete', values: element},
      width: '300px',
      height:'170px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.eliminarTipoPaquete(element['tipoPaquete'], isEditar);
      }
    });
  }

  public soloNumeros(val: any) {
    let specialKeys = ['', 'Shift', 'Alt', 'Control', 'AltGraph']
    let regex = /^\d+$/
    let result = val['key']
    if(!regex.test(val['key'])) {
      if(this.formularioTiposPaquetes.value['totalEmpaques'].length > 0) {
        result = this.formularioTiposPaquetes.value['totalEmpaques'].replace(val['key'], '');
      } else {
        result = ''
      }
    } else {
      result = this.formularioTiposPaquetes.value['totalEmpaques'];
    }
    let tipoP = this.formularioTiposPaquetes.value['tipoPaquete'];
    tipoP = tipoP.trimStart().trimEnd()
    this.formularioTiposPaquetes.setValue({
      tipoPaquete: tipoP,
      totalEmpaques: result
    });
    
  }

  /*-----------------------------------METODOS TEMAS---------------------------------------------*/
  public async getRegistroTema() {
    /**conexión y consumo de Firebase */
    this.catTemas.splice(0, this.catTemas.length);
    this.datasourceTemas = [];
    await this.obtenerFirebaseDataTema().then((data: any) => {
      this.catTemas = data;
    });
    this.datasourceTemas = this.catTemas;
  }

  obtenerFirebaseDataTema() {
    return new Promise((resolve, reject) => {
      this.temaService.getAll().valueChanges().subscribe(val => {
        resolve(val);
      })
    });
  }


  crearTema() {
    let color = this.formularioTemas.value['color'];
    let existeTema = this.catTemas.filter((t) => this.formularioTemas.value['tema'].toUpperCase() === t.tema.toUpperCase());
    if(existeTema.length === 0 || this.modificarTema){
      if (this.modificarTema) {
        this.eliminarTema(this.temaUpdate, true);
      }
      let temaBody: TemasModel = {
        tema: this.formularioTemas.value['tema'].toUpperCase(),
        color: color.slice(1, 7),
        imagen: this.formularioTemas.value['imagen'],
        asignado: false,
      }
      this.temaService.create(this.formularioTemas.value['tema'].toUpperCase(), temaBody);
      this.getRegistroTema();
      this.formularioTemas.setValue({
        tema: '',
        color: '#000000',
        imagen: ''
      });
      this.modificarTema = false;
    }
  }

  editarTema(elemet: any) {
    let colorHex = '#' + elemet['color'];
    this.formularioTemas.setValue({
      tema: elemet['tema'],
      color: colorHex,
      imagen: elemet['imagen']
    });
    this.modificarTema = true;
    this.temaUpdate = elemet.tema;
  }

  private eliminarTema(tema: any, isEditar: boolean) {
    this.temaService.delete(tema);
    if(!isEditar) {
      this.getRegistroTema();
    }
  }

  public mostrarEliminarTema(element: any) {
    const dialogRef = this.dialog.open(EliminarComponent, {
      data: {seccion: 'tema', values: element},
      width: '380px',
      height:'190px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log(element.tema);
        
        this.eliminarTema(element.tema, false);
      }
    });
  }

  asignarTema(element: any) {
    let temaAnterior = this.catTemas.find((t) => t.asignado === true);
    temaAnterior['asignado'] = false;
    this.temaService.create(temaAnterior.tema, temaAnterior);
    let tema = this.catTemas.find((t) => element['tema'].toUpperCase() === t.tema.toUpperCase());
    tema['asignado'] = true;
    this.temaService.create(tema.tema, tema);
    this.getRegistroTema();
  }
}

