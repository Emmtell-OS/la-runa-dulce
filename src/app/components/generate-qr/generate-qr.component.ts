import { FormControl } from '@angular/forms';
import { CodiModel } from './../../models/CodiModel';
import { map } from 'rxjs/operators';
import { Component, OnInit, ViewChild, ElementRef, inject } from '@angular/core';
import {
  MatTable,
  MatTableDataSource,
  MatTableModule,
} from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { SelectionModel } from '@angular/cdk/collections';
import { HistorialTableModel } from '../../models/HistorialTableModel';
import { environment } from '../../../environments/environment';
import { Html2CanvasOptions, RGBAData, jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import moment from 'moment';
import { ProcessLotesService } from '../../service/process-lotes.service';
import { TipoPaquetesServiceService } from '../../service/tipo-paquetes-service.service';
import { TiposPaqueteModel } from '../../models/TiposPaqueteModel';
import { resolve } from 'path';
import { rejects } from 'assert';
import { log } from 'console';
import Utils from '../../utilities/utils';
import { MatDialog } from '@angular/material/dialog';
import { EliminarComponent } from '../modals/eliminar/eliminar.component';

@Component({
  selector: 'app-generate-qr',
  templateUrl: './generate-qr.component.html',
  styleUrl: './generate-qr.component.scss',
})
export class GenerateQrComponent implements OnInit {
  displayedColumns: string[] = [
    'select',
    'tipoPaquete',
    'paquete',
    'lote',
    'creacion',
  ];
  dataJsonLP: any;
  dataSource: any;
  selection = new SelectionModel<HistorialTableModel>(true, []);
  dataTable: HistorialTableModel[] = [];
  preseleccionados: HistorialTableModel[] = [];
  seleccionadosList: HistorialTableModel[] = [];
  codiModelList: CodiModel[] = [];
  qrList: CodiModel[] = [];
  qrList2: CodiModel[] = [];
  //qrList = [];
  generarActive = true;
  pathBase = environment.pathInterp;
  hojasPDFList = [];
  catTipoPaquete: TiposPaqueteModel[] = [];
  colGrid: any;
  borde = 'sinBorde';
  tp = '';
  visibleQR = false;
  qrCode = null;
  qrStyle: any;
  readonly dialog = inject(MatDialog);

  @ViewChild(MatTable) tableHistorial!: MatTable<HistorialTableModel>;
  @ViewChild('inputt') inputt: ElementRef;

  constructor(
    private service: ProcessLotesService,
    private tpService: TipoPaquetesServiceService
  ) {
    this.getRegistroLotes();
  }

  ngOnInit(): void {
    
    
  }

  private async getRegistroLotes() {
    /**conexión y consumo de Firebase */
    try {
      await this.obtenerFirebaseData().then((data: []) => {
        this.dataJsonLP = data;
      });
      this.cargarDatos();
      this.getRegistroTiposPaquete();
    } catch (error) {
      console.log(error);
    }
  }

  obtenerFirebaseData() {
    return new Promise((resolve, reject) => {
      this.service
        .getAll()
        .valueChanges()
        .subscribe((val) => {
          resolve(val);
        });
    });
  }

  public async getRegistroTiposPaquete() {
    this.catTipoPaquete.splice(0, this.catTipoPaquete.length);
    /**conexión y consumo de Firebase */
    await this.obtenerFirebaseDataTP().then((data: []) => {
      this.catTipoPaquete.push(...data);
    });
  }

  obtenerFirebaseDataTP() {
    return new Promise((resolve, reject) => {
      this.tpService
        .getAll()
        .valueChanges()
        .subscribe((val) => {
          resolve(val);
        });
    });
  }

  private cargarDatos() {
    this.dataTable = [];
    this.dataJsonLP.map((lote) => {
      lote['paquetes'].map((paquete) => {
        let runaCod = [];
        paquete['consultados'].map((r: {}) => runaCod.push(Object.keys(r)[0]));
        this.dataTable.push({
          lote: lote['lote'],
          paquete: paquete['codigo'],
          tipoPaquete: paquete['tipoPaquete'],
          activo: '',
          creacion: paquete['creacion'],
          consultados: runaCod,
        });
      });
    });
    this.dataTable.sort((a, b) => new Date(b.creacion).getTime() - new Date(a.creacion).getTime());
    this.dataTable.map((data) => data.creacion = moment(data.creacion).format('DD-MM-YYYY hh:mm'));
    this.dataSource = new MatTableDataSource<HistorialTableModel>(
      this.dataTable
    );
  }

  public async ordenarSeleccionados() {
    this.visibleQR = true;
    this.generarActive = true;
    await this.ordenarPromise();
    if ( this.seleccionadosList.length > 0) {
      this.generarQR();
    } else {
      this.visibleQR = false;
      this.selection.clear();
      this.inputt.nativeElement.value = '';
    }
    
  }

  private ordenarPromise() {
    return new Promise((resolve, reject) => {
      this.preseleccionados.map((ps) => {
        let tipoPaquete: TiposPaqueteModel = this.catTipoPaquete.find(
          (tp) =>
            ps.tipoPaquete.toLowerCase() === tp['tipoPaquete'].toLowerCase()
        );
        if (tipoPaquete !== undefined) {
          ps.consultados = tipoPaquete.rowGrid;
          this.seleccionadosList.push(ps);
        } else {
          this.mostrarError(ps.tipoPaquete);
        }
      });

      this.seleccionadosList.sort((a, b) => b.consultados - a.consultados);
      resolve(this.seleccionadosList);
    });
  }

  private async generarQR() {
    let contadorFilas = 0;
    let itemsHoja = [];
    for await (const [
      index,
      seleccionado,
    ] of this.seleccionadosList.entries()) {
      this.qrList = [];
      this.qrList2 = [];
      this.qrStyle = Utils.getRand(0,1);
      if (contadorFilas > 0) {
        this.borde = 'conBorde';
      }
      let tipoPaquete: TiposPaqueteModel = this.catTipoPaquete.find(
        (tp) =>
          seleccionado.tipoPaquete.toLowerCase() ===
          tp['tipoPaquete'].toLowerCase()
      );
      
      this.tp = tipoPaquete.tipoPaquete;

      if (
        8 - contadorFilas < tipoPaquete.rowGrid &&
        itemsHoja.length > 0 &&
        tipoPaquete.rowGrid < 8
      ) {
        if (itemsHoja.length > 0) {
          this.hojasPDFList.push(itemsHoja);
        }
        itemsHoja = [];
        this.borde = 'sinBorde';
        contadorFilas = 0;
      }

      this.colGrid = tipoPaquete.columnGrid;
      let paquetes = this.dataJsonLP.find((lotes) => lotes['lote'] === seleccionado['lote'])['paquetes'];
      let consultados =  paquetes.find((paq) => paq['codigo'] === seleccionado['paquete'])['consultados'];
      

      if (tipoPaquete.rowGrid > 8) {
        let renglonesRestantes = Math.floor(tipoPaquete.rowGrid % 8);
        let calcularRenglonesRestantes = false;
        for await (const consultado of consultados) {
          
          this.qrList = [];
          this.qrList2 = [];
          let qrPorHoja = 0;
          if (contadorFilas === 0) {
            qrPorHoja = tipoPaquete.columnGrid * 8;
          } else {
            calcularRenglonesRestantes = true;
            qrPorHoja = tipoPaquete.columnGrid * (8 - contadorFilas);
          }

          let provisional = consultados.slice(0, qrPorHoja);
          await this.printQRS(provisional, seleccionado, 200).then();
          await this.getElement(1500).then((element: any) => {
            itemsHoja.push(element);
            if (qrPorHoja === provisional.length) {
              this.hojasPDFList.push(itemsHoja);
              itemsHoja = [];
              contadorFilas = 0;
              this.borde = 'sinBorde';
            }
          });
          consultados.splice(0, qrPorHoja);
          if (calcularRenglonesRestantes) {
            renglonesRestantes = provisional.length / tipoPaquete.columnGrid;
          }
        }
        contadorFilas = renglonesRestantes === 8 ? 0 : renglonesRestantes;
        this.tp = '';
      } else {
        await this.printQRS(consultados, seleccionado, 200).then();
        await this.getElement(1200).then((element: any) =>
          itemsHoja.push(element)
        );
        contadorFilas += tipoPaquete.rowGrid;
      }

      if (contadorFilas === 8 || index === this.seleccionadosList.length - 1) {
        this.hojasPDFList.push(itemsHoja);
        itemsHoja = [];
        this.borde = 'sinBorde';
        contadorFilas = 0;
      }
    }
    this.crearPDF();
  }

  private printQRS(
    consultados: [],
    seleccionado: HistorialTableModel,
    time: number
  ) {
    return new Promise((resolve, rejects) => {
      setTimeout(() => {
        consultados.map((consultado: {}) => {
          let runaCode = Object.keys(consultado)[0];
          if(this.qrStyle === 1) {
            this.qrList.push({
              codi: this.pathBase + seleccionado.lote + runaCode + seleccionado.paquete,
              img: './assets/img/' + runaCode.slice(0, 2) + '.png',
              folio: ''
            });
          } else {
            this.qrList2.push({
              codi: this.pathBase + seleccionado.lote + runaCode + seleccionado.paquete,
              img: './assets/img/' + runaCode.slice(0, 2) + '.png',
              folio: ''
            });
          }
        });
        resolve(this.qrList);
      }, time);
    });
  }

  private getElement(time: number): any {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(this.getCanvas(document.getElementById('contentToConvert')));
      }, time);
    });
  }

  private getCanvas(img: any) {
    return html2canvas(img).then((canvas) => canvas.toDataURL('image/PNG'));
  }

  private async crearPDF() {
    const doc = new jsPDF('p', 'pt', 'a4');
    let bufferY = 15;

    for await (const [index, hoja] of this.hojasPDFList.entries()) {
      
      if (index > 0 && index < this.hojasPDFList.length) {
        doc.addPage();
        bufferY = 15;
      }
      for await (let img of hoja) {
        const bufferX = 2;
        const imgProps = (doc as any).getImageProperties(img);
        const pdfWidth = doc.internal.pageSize.getWidth() - 2 * bufferX;
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        doc.addImage(
          img,
          'PNG',
          bufferX,
          bufferY,
          pdfWidth,
          pdfHeight,
          undefined,
          'NONE'
        );

        bufferY += pdfHeight + 5;
      }
    }

    doc.save(`la-runa-dulce-${moment().format('DD-MM-YYYY')}.pdf`);
    this.qrList = [];
    this.qrList2 = [];
    this.tp = '';
    this.preseleccionados = [];
    this.seleccionadosList = [];
    this.hojasPDFList = [];
    this.visibleQR = false;
    this.selection.clear();
    this.dataJsonLP.splice(0, this.dataJsonLP.length);
    this.getRegistroLotes();
    this.inputt.nativeElement.value = '';
    
  }

  private mostrarError(tp: string) {
    const dialogRef = this.dialog.open(EliminarComponent, {
      data: {seccion: 'qr', values: tp},
      width: '500px',
      height:'170px'
    });
  }

  mapearSeleccionado(row?: HistorialTableModel) {
    if (this.selection.isSelected(row)) {
      //agreagar a preseleccionados
      this.preseleccionados.push({
        lote: row['lote'],
        paquete: row['paquete'],
        tipoPaquete: row['tipoPaquete'],
        activo: '',
        creacion: '',
        consultados: 0,
      });
      this.selection.select(this.dataSource);
    } else {
      //eliminar de preseleccionados
      let index = this.preseleccionados.findIndex(
        (r) => r['lote'] === row['lote'] && r['paquete'] === row['paquete']
      );
      this.preseleccionados.splice(index, 1);
    }

    if (this.preseleccionados.length !== 0) {
      this.generarActive = false;
    } else {
      this.generarActive = true;
    }

    //console.log(this.preseleccionados);
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: HistorialTableModel): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }

    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${
      row.lote
    }`;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  /*toggleAllRows() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }

    this.selection.select(...this.dataSource.data);
  }*/
}
