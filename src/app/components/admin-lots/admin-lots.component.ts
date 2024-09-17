import { TableModel } from './../../models/TableModel';
import { LoteModel } from './../../models/LotelModel';
import { ProcessLotesService } from './../../service/process-lotes.service';
import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { PaqueteModel } from '../../models/PaqueteModel';
import { HttpClient } from '@angular/common/http';

import { MatCardModule } from '@angular/material/card';
import { FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatTable, MatTableDataSource, MatTableModule } from '@angular/material/table';
import { HistorialTableModel } from '../../models/HistorialTableModel';
import { MatDialog } from '@angular/material/dialog';
import { DetallesLoteComponent } from '../detalles-lote/detalles-lote.component';
import { ProduccionModel } from '../../models/ProduccionModel';
import moment from 'moment';
import {MatDividerModule} from '@angular/material/divider';
import { GenerateQrComponent } from '../generate-qr/generate-qr.component';
import { rejects } from 'assert';
import { TipoPaquetesServiceService } from '../../service/tipo-paquetes-service.service';
import { log } from 'console';
import { TiposPaqueteModel } from '../../models/TiposPaqueteModel';
import { InterpretacionesServiceService } from '../../service/interpretaciones-service.service';
import Utils from '../../utilities/utils';

@Component({
  selector: 'app-admin-lots',
  templateUrl: './admin-lots.component.html',
  styleUrl: './admin-lots.component.scss',
})
export class AdminLotsComponent implements OnInit {

  dataJsonLP = [];
  formularioRegistro: FormGroup;
  lotesFilterControl: FormControl = new FormControl('');
  filteredLotes: Observable<any[]>;
  readonly dialog = inject(MatDialog);

  idsLotesList = [];
  idsLotesBase = ["Nuevo lote"];
  tiposPaquete = [];
  listaTP = [];
  catInterpretaciones = [];
  autoCompleteInputValue: any;
  stashLoteList: TableModel[] = [];
  displayedColumns: string[] = ['lote', 'tipoPaquete', 'cantidad', 'action'];
  dataSource: any;
  displayedHistorialColumns: string[] = ['lote', 'paquete', 'tipoPaquete', 'activo', 'consultados', 'action'];
  dataSourceHistorial: any;
  historialProductos: HistorialTableModel[] = [];
  displayedProduccionColumns: string[] = ['lote', 'paquete', 'tipoPaquete', 'produccion', 'action'];
  datasourceProduccion: any;
  produccionProductos: ProduccionModel[] = [];
  isPaqProduccion = false;
  btnActive = true;
  btnProduction = [];
  
  @ViewChild(MatTable) table!: MatTable<TableModel>;
  @ViewChild(MatTable) tableHistorial!: MatTable<HistorialTableModel>;
  @ViewChild(MatTable) tableProduccion!: MatTable<ProduccionModel>;

  constructor(private service: ProcessLotesService, 
              private tpService: TipoPaquetesServiceService,
              private interpretacionervice: InterpretacionesServiceService) {
    this.getRegistroLotes();
    this.getRegistroTiposPaquete();
    this.formularioRegistro = new FormGroup({
      lote: new FormControl(''),
      tipoPaquete: new FormControl('', Validators.required),
      cantidad: new FormControl('', [Validators.required, Validators.max(100)])
    });
  }

  ngOnInit(): void { }

  public async getRegistroLotes() {
    /**conexión y consumo de Firebase */
    await this.obtenerFirebaseData().then((data: []) => {
      this.dataJsonLP.push(...data);
    });
    const arr = this.dataJsonLP.map((stg) => stg.lote);
    this.idsLotesBase.push(...arr);
    
    this.cargarFoliosLotes();
    this.loadHistorialTable(true);
    this.loadProduccion(true);
  }

  obtenerFirebaseData() {
    return new Promise((resolve, reject) => {
      this.service.getAll().valueChanges().subscribe(val => {
        resolve(val);
      })
    });
  }

  public async getRegistroTiposPaquete() {
    /**conexión y consumo de Firebase */
    this.listaTP = this.listaTP.slice(0, this.listaTP.length);
    await this.obtenerFirebaseTPData().then((data: []) => {
      this.listaTP.push(...data);
    });
    this.listaTP.map((tp) => {
      this.tiposPaquete.push(tp['tipoPaquete']);
    })
  }

  obtenerFirebaseTPData() {
    return new Promise((resolve, reject) => {
      this.tpService.getAll().valueChanges().subscribe(val => {
        resolve(val);
      })
    });
  }

  public async getRegistroInterpretaciones() {
    this.catInterpretaciones.splice(0, this.catInterpretaciones.length)
    /**conexión y consumo de Firebase */
    await this.obtenerFirebaseDataInterp().then((data: []) => {
      this.catInterpretaciones = data;
    });

  }

  obtenerFirebaseDataInterp () {
    return new Promise((resolve, reject) => {
      this.service.getAll().valueChanges().subscribe(val => {
        resolve(val);
      })
    });
  }

  public async getRegistroTiposPaqueteByTipo(tipo: string) {
    let listaTP: TiposPaqueteModel;
    /**conexión y consumo de Firebase */
    await this.obtenerFirebaseTPByTipoData(tipo).then((data: TiposPaqueteModel) => {
      listaTP = data;
    });
    console.log(listaTP);
    
    return listaTP;
    /*listaTP.map((tp) => {
      this.tipoPaqueteFiltrado.push(tp['tipoPaquete']);
    })*/
  }

  obtenerFirebaseTPByTipoData(tipo: string) {
    return new Promise((resolve, reject) => {
      this.tpService.getTipo(tipo).valueChanges().subscribe(val => {
        resolve(val);
      })
    });
  }

  cargarFoliosLotes() {
    this.idsLotesList.push(...this.idsLotesBase);
    this.filteredLotes = this.lotesFilterControl.valueChanges
    .pipe(
      startWith(''),
      map(lote => lote ? this.filterLotes(lote) : this.idsLotesList.slice())
    );
  }

  filterLotes(name: string) {
    return this.idsLotesList.filter(lot => lot.toUpperCase().includes(name.toUpperCase()));
  }

  public loadHistorialTable(ft: boolean) {
    
    this.historialProductos.splice(0, this.historialProductos.length);
    this.dataSourceHistorial = new MatTableDataSource();
    this.dataJsonLP.forEach((lote) => {
      let folioLote = lote['lote']
      lote['paquetes'].forEach(paq => {  
        if (paq['estatusProduccion'] === 'T') {
          this.historialProductos.push({
            "lote": folioLote,
            "paquete": paq['codigo'],
            "tipoPaquete": paq['tipoPaquete'],
            "activo": (paq['activo']) ? 'activo' : 'inactivo',
            "creacion": paq['creacion'],
            "consultados": paq['consultados'].filter(x => x['consultas'] > 0).length,
          });
        }
      });
    });

    this.dataSourceHistorial = new MatTableDataSource(this.historialProductos);
    if(!ft) {
      //this.tableHistorial.renderRows();
    }
  }

  public loadProduccion(ft: boolean) {
    this.produccionProductos.splice(0, this.produccionProductos.length);
    this.btnProduction.splice(0, this.btnProduction.length);
    this.dataJsonLP.forEach((lote) => {
      let folioLote = lote['lote']
      lote['paquetes'].forEach(paq => {  
        if (paq['estatusProduccion'] != 'T') {
          this.produccionProductos.push({
            "lote": folioLote,
            "paquete": paq['codigo'],
            "tipoPaquete": paq['tipoPaquete'],
            "produccion": this.getEstatusProd(paq['estatusProduccion']),
          });
          this.btnProduction.push(true);
        }
      });
    });
    
    this.datasourceProduccion = new MatTableDataSource(this.produccionProductos);
    if(!ft) {
      //this.tableProduccion.renderRows();

    }
  }

  public getEstatusProd(estatus: string): string {
    switch(estatus) {
      case 'P':
        return 'Pendiente'
      case 'EP':
        return 'En Producción'
      case 'T':
        return 'Terminado'
      default:
        return ''
    }
  }

  public agregarPreregistro(ctrl: FormControl) {
    if(this.autoCompleteInputValue === undefined ||
      this.autoCompleteInputValue.toLowerCase() === 'nuevo lote' ||
      this.autoCompleteInputValue === '') {
        this.autoCompleteInputValue = this.generateFolio().toString();
    }

    this.formularioRegistro.value.lote = this.autoCompleteInputValue;
    this.stashLoteList.push(this.formularioRegistro.value);
    this.getIdLoteList();
    
    ctrl.setValue(null);
    this.autoCompleteInputValue = '';

    this.dataSource = new MatTableDataSource(this.stashLoteList);
    this.formularioRegistro.reset();
    //this.table.renderRows();
  }

  public validForm() {
    if(!this.formularioRegistro.valid || this.formularioRegistro.dirty) {

    }
  }

  public dropRow(index: any, ctrl: FormControl) {
    this.stashLoteList.splice(index, 1);
    this.dataSource = this.stashLoteList;
    this.table.renderRows();
    this.getIdLoteList();
    ctrl.setValue(null);
  }

  public getIdLoteList() {
    this.idsLotesList.splice(0, this.idsLotesList.length);
    this.idsLotesList.push(...this.idsLotesBase);
    const arr = new Set(this.stashLoteList.map((stg) => stg.lote));
    this.idsLotesList.push(...arr);
  }

  public limpiarTablaStash() {
    this.stashLoteList.splice(0, this.stashLoteList.length);
    this.dataSource = this.stashLoteList;
    this.table.renderRows();
  }

  /***************Crear lote json******************** */

  public iniciarProduccion(index: number) {

    this.produccionProductos[index]['produccion'] = this.getEstatusProd('EP');
    this.datasourceProduccion = this.produccionProductos;
    this.isPaqProduccion = true;
    //this.tableProduccion.renderRows();    
    this.btnProduction.splice(index, 1, false);    

  }

  public completarProduccion(element: any, index: number) {
    let isSaveValid = false;
    this.dataJsonLP.find((lote => {
      if(lote['lote'] === element['lote']) {
        lote['paquetes'].find(paq => {
          if(paq['codigo'] === element['paquete']) {
            paq['estatusProduccion'] = 'T';
            isSaveValid = true;
          }
        });
      }
    }));

    if(isSaveValid) {
      let loteToSave = this.dataJsonLP.find(lote => lote['lote'] === element['lote'] );
      this.service.update(element['lote'], loteToSave);
      //this.loadProduccion(false);
      //this.loadHistorialTable(false);
      this.getRegistroLotes()
    }
    
  }

  public eliminarPaquete(index: any, element: any) {
    this.dataJsonLP.find((lote => {
      if(lote['lote'] === element['lote']) {
        lote['paquetes'].splice(index,1);
      }
    }));
    this.loadHistorialTable(false);
  }

  public mostrarGenerarQR() {
    const dialogRef = this.dialog.open(GenerateQrComponent, {
      data: '',
      width: '1000px',
      height:'98%'
    });
  }

  public detallesPaquete(index: any, element: any) {
    let loteObj = this.dataJsonLP.find(folio => folio['lote'] === element['lote']);

    const dialogRef = this.dialog.open(DetallesLoteComponent, {
      data: {idPaquete: element['paquete'], lote: element['lote'] },
      width: '1000px',
      height:'98%'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        //hacer algo al cerrar el dialogo
      }
    });

  }

  public registrarPedido() {

    this.getRegistroTiposPaquete();
    this.createJsonLP();
    this.getRegistroLotes();
    this.getIdLoteList();
    this.limpiarTablaStash();

  }

  public createJsonLP() {

    let dJsonLP;

    this.stashLoteList.forEach(element => {

      const paqueteList = [];
      for (let i = 0; i < parseInt(element['cantidad']); i++) {
        let paqueteModel: PaqueteModel = {
          codigo: this.generateFolio().toString(),
          activo: true,
          creacion: moment().format(),
          estatusProduccion: 'P',
          tipoPaquete: element['tipoPaquete'],
          consultados: this.createConsultados(element['tipoPaquete']),
        };
        paqueteList.push(paqueteModel);
      }

      let existLote = false;
      
      this.dataJsonLP.find((pedido) => {
        if(pedido['lote'] === element['lote']) {
          pedido['paquetes'].push(...paqueteList);
          existLote = true;
        }
      });

      if (!existLote) {
        this.idsLotesBase.push(element['lote']);
        dJsonLP = {
          lote: element['lote'],
          activo: true,
          creacion: moment().format(),
          paquetes: paqueteList,
        };
        this.service.create(element['lote'], dJsonLP);
      }

    });

    this.loadProduccion(false);
    
  }

  private createConsultados(tipoPaquete: string): any {
    let tipoPaq: TiposPaqueteModel = this.listaTP.find((tp) => tipoPaquete === tp['tipoPaquete']);
    let runas = ['GE', 'EI', 'NG', 'JE', 'HA', 
    'SW', 'IS', 'DA', 'OD', 'UR', 
    'OT', 'AS', 'MA', 'AL', 'NA', 
    'PE', 'TE', 'KA', 'WU', 'FE', 
    'RA', 'LA', 'EH', 'BE', 'TH'];
    let consultadosList = [];
    let runasIdList = [];
    let limiteRunas = tipoPaq.totalEmpaques;
    let existRuna = false;

    while(runasIdList.length < limiteRunas) {
      let indexR = Utils.getRand(0, 24); //this.getRand(24, 0);
      let runa = '';
      let invertido = '01';
      if (indexR > 8) {
        if(Utils.getRand(1, 100) % 2 != 0) {
          invertido = '00';
        }
      }
      runa = runas[indexR] + invertido;
      if(limiteRunas > 41 && runasIdList.length >= 41) {          
        if(runasIdList.filter((rdl) => rdl === runa).length < Math.ceil(limiteRunas/41)) {
          runasIdList.push(runa);
        }
      } else {
        if (!runasIdList.includes(runa)) {
          runasIdList.push(runa);
        }
      }
    }

    runasIdList.map((r) => {
      let interpretacion = Utils.elegirInterpretacion(r, this.catInterpretaciones);
      let consultadosObject = new Object();
      consultadosObject[r] = '';
      consultadosObject['consultas'] = 0;
      consultadosObject['inter'] = (interpretacion === null) ? 1 : interpretacion;
      consultadosList.push(consultadosObject);
    });

    return consultadosList;
  }

  private generateFolio(): String {
    let indice: string = '';

    for (let i = 1; i <= 10; i++) {
      let rand = Utils.getRand(48, 122); //this.getRand(122, 48);
      while ((rand > 90 && rand < 97) || (rand > 57 && rand < 65)) {
        rand = Utils.getRand(48, 122); //this.getRand(122, 48);
      }
      indice = indice + String.fromCharCode(rand);
    }

    return indice;
  }

  private getRand(MAX:number, MIN:number): number {
    return Math.floor(Math.random() * (MAX - MIN + 1)) + MIN;
  }

  private printJson() {
    console.log(this.dataJsonLP);
    console.log(JSON.stringify(this.dataJsonLP));
  }
}
