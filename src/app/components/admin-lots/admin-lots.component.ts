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
  tiposPaquete = ["Tira", "Caja"];
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

  constructor(private service: ProcessLotesService) {
    this.formularioRegistro = new FormGroup({
      lote: new FormControl(''),
      tipoPaquete: new FormControl('', Validators.required),
      cantidad: new FormControl('', [Validators.required, Validators.max(100)])
    });
    this.getRegistroLotes();
  }

  ngOnInit(): void {
    this.idsLotesList.push(...this.idsLotesBase);
    this.filteredLotes = this.lotesFilterControl.valueChanges
    .pipe(
      startWith(''),
      map(lote => lote ? this.filterLotes(lote) : this.idsLotesList.slice())
    );
    this.loadHistorialTable(true);
    this.loadProduccion(true);
  }

  filterLotes(name: string) {
    return this.idsLotesList.filter(lot => lot.toUpperCase().includes(name.toUpperCase()));
  }

  public getRegistroLotes() {
    /**conexión y consumo de Firebase */
    let fireb = '[{"lote":"RA34l0H0Nu","activo":true,"creacion":"2024-08-15T16:42:58.286Z","paquetes":[{"codigo":"FlF6zWzyMw","activo":true,"creacion":"2024-08-15T16:42:58.286Z","estatusProduccion":"T","tipoPaquete":"Tira","consultados":[{"SW01":"","consultas":0,"inter":3},{"JE01":"","consultas":0,"inter":2},{"NA00":"","consultas":0,"inter":2},{"TE00":"","consultas":0,"inter":0},{"DA01":"","consultas":0,"inter":1},{"MA01":"","consultas":0,"inter":1},{"UR00":"","consultas":0,"inter":1},{"EI01":"","consultas":0,"inter":1},{"AL01":"","consultas":0,"inter":0},{"LA00":"","consultas":0,"inter":3},{"EH01":"","consultas":0,"inter":0},{"NA01":"","consultas":0,"inter":1}]},{"codigo":"v658BCdrTw","activo":true,"creacion":"2024-08-15T16:42:58.286Z","estatusProduccion":"T","tipoPaquete":"Tira","consultados":[{"DA01":"","consultas":0,"inter":0},{"AS00":"","consultas":0,"inter":3},{"BE00":"","consultas":0,"inter":3},{"NG01":"","consultas":0,"inter":0},{"KA01":"","consultas":0,"inter":2},{"AL00":"","consultas":0,"inter":1},{"TH00":"","consultas":0,"inter":0},{"EI01":"","consultas":0,"inter":0},{"GE01":"","consultas":0,"inter":1},{"TE00":"","consultas":0,"inter":0},{"AL01":"","consultas":0,"inter":1},{"OD01":"","consultas":0,"inter":1}]},{"codigo":"ZTTrljeqtD","activo":true,"creacion":"2024-08-15T16:43:21.650Z","estatusProduccion":"P","tipoPaquete":"Caja","consultados":[{"HA01":"","consultas":0,"inter":3},{"BE01":"","consultas":0,"inter":1},{"GE01":"","consultas":0,"inter":2},{"PE01":"","consultas":0,"inter":0},{"TE01":"","consultas":0,"inter":0},{"BE00":"","consultas":0,"inter":3},{"NG01":"","consultas":0,"inter":0},{"RA01":"","consultas":0,"inter":0},{"LA01":"","consultas":0,"inter":1},{"OT01":"","consultas":0,"inter":2},{"NA00":"","consultas":0,"inter":3},{"IS01":"","consultas":0,"inter":3}]}]}]';
    //let fireb = '[]';
    this.dataJsonLP = JSON.parse(fireb);
    const arr = this.dataJsonLP.map((stg) => stg.lote);
    this.idsLotesBase.push(...arr);
  }

  public loadHistorialTable(ft: boolean) {

    this.historialProductos.splice(0, this.historialProductos.length);
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
      this.tableHistorial.renderRows();
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
      this.tableProduccion.renderRows();
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

  public listarLote(ctrl: FormControl) {
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
    this.table.renderRows();
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
    this.tableProduccion.renderRows();    
    this.btnProduction.splice(index, 1, false);    

  }

  public completarProduccion(element: any, index: number) {
    this.dataJsonLP.find((lote => {
      if(lote['lote'] === element['lote']) {
        lote['paquetes'].find(paq => {
          if(paq['codigo'] === element['paquete']) {
            paq['estatusProduccion'] = 'T';
          }
        });
      }
    }));
    this.loadProduccion(false);
    this.loadHistorialTable(false);
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
      data: {idPaquete: element['paquete'], lote: loteObj },
      width: '1000px',
      height:'98%'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      if (result !== undefined) {
        console.log("some");
      }
    });

  }

  public registrarPedido() {

    this.createJsonLP();
    this.getIdLoteList();
    this.limpiarTablaStash();

  }

  public createJsonLP() {

    this.stashLoteList.forEach(element => {

      const paqueteList = [];
      for (let i = 0; i < parseInt(element['cantidad']); i++) {
        let paqueteModel: PaqueteModel = {
          codigo: this.generateFolio().toString(),
          activo: true,
          creacion: moment(),
          estatusProduccion: 'P',
          tipoPaquete: element['tipoPaquete'],
          consultados: this.createConsultados(),
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
        this.dataJsonLP.push({
          lote: element['lote'],
          activo: true,
          creacion: moment(),
          paquetes: paqueteList,
        });
      }

    });

    this.loadProduccion(false);
    
  }

  public createLote(numeroLotes: number, numeroPaquetes: number, tipoPaquete: string) {
    const paqueteList = [];
    let loteModel = new Object();

    for (let i = 0; i < numeroPaquetes; i++) {
      let paqueteModel: PaqueteModel = {
        codigo: this.generateFolio().toString(),
        activo: false,
        creacion: '',
        estatusProduccion: 'P',
        tipoPaquete: tipoPaquete,
        consultados: this.createConsultados(),
      };

      paqueteList.push(paqueteModel);
    }

    for (let i = 0; i < numeroLotes; i++) {
      loteModel = {
        lote: this.generateFolio().toString(),
        activo: false,
        creacion: new Date().toLocaleString(),
        paquetes: paqueteList,
      };
    }

  }

  private createConsultados():any {
   let runas = ['GE', 'EI', 'NG', 'JE', 'HA', 
   'SW', 'IS', 'DA', 'OD', 'UR', 
   'OT', 'AS', 'MA', 'AL', 'NA', 
   'PE', 'TE', 'KA', 'WU', 'FE', 
   'RA', 'LA', 'EH', 'BE', 'TH'];
   let consultadosList = [];
   let runasIdList = [];
   let limiteRunas = 12;
   let existRuna = false;

   while(runasIdList.length < limiteRunas) {
    let indexR = this.getRand(24, 0);
    let runa = '';
    let invertido = '01';
    if (indexR > 8) {
      if(this.getRand(100, 1) % 2 != 0) {
        invertido = '00';
      }
    }
    runa = runas[indexR] + invertido;

    if (!runasIdList.includes(runa)) {
      runasIdList.push(runa);
    }
   }

   runasIdList.map((r) => {
      let consultadosObject = new Object();
      consultadosObject[r] = '';
      consultadosObject['consultas'] = 0;
      consultadosObject['inter'] = this.getRand(3, 0);
      consultadosList.push(consultadosObject);
   });

   return consultadosList;
  }

  private generateFolio(): String {
    let indice: string = '';

    for (let i = 1; i <= 10; i++) {
      let rand = this.getRand(122, 48);
      while ((rand > 90 && rand < 97) || (rand > 57 && rand < 65)) {
        rand = this.getRand(122, 48);
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
