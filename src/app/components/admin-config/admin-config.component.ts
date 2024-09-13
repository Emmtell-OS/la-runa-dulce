import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TiposPaqueteModel } from '../../models/TiposPaqueteModel';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { TipoPaquetesServiceService } from '../../service/tipo-paquetes-service.service';
import { log } from 'console';

@Component({
  selector: 'app-admin-config',
  templateUrl: './admin-config.component.html',
  styleUrl: './admin-config.component.scss'
})
export class AdminConfigComponent {

  _TIPOS_PAQUETE = "tipoPaquetes";
  formularioTiposPaquetes: FormGroup;
  displayedTiposPaquetesColumns = ['tipoPaquete', 'totalEmpaques', 'columnGrid', 'rowGrid', 'actions'];
  datasourceTP: any;
  catTipoPaquete: TiposPaqueteModel[] = [];
  _columnGridValue = 0;
  _rowGridValue = 0;
  modificar = false;
  tipoPaqueteUpdate = ''

  constructor(private tpService: TipoPaquetesServiceService) {
    this.getRegistroTiposPaquete();
    this.formularioTiposPaquetes = new FormGroup({
      tipoPaquete: new FormControl('', Validators.required),
      totalEmpaques: new FormControl('', [Validators.required, Validators.min(4)])
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
      let tiposPaquetesModel: TiposPaqueteModel = {
        tipoPaquete: ftp,
        totalEmpaques: this.formularioTiposPaquetes.value['totalEmpaques'],
        columnGrid: this._columnGridValue,
        rowGrid: this._rowGridValue
      }
      this.tpService.create(this._TIPOS_PAQUETE + '/' + tiposPaquetesModel['tipoPaquete'], tiposPaquetesModel);
      this.getRegistroTiposPaquete();
      this.formularioTiposPaquetes.reset();
    } else {
      //tool tip ya existe el tipo paquete
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
    this.eliminar(element, true);
  }

  public eliminar(element: any, isEditar: boolean) {    
    this.tpService.delete(this._TIPOS_PAQUETE + '/' + element['tipoPaquete']);
    if(!isEditar) {
      this.getRegistroTiposPaquete();
    }
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
    this.formularioTiposPaquetes.setValue({
      tipoPaquete: this.formularioTiposPaquetes.value['tipoPaquete'],
      totalEmpaques: result
    });
    
  }
}
