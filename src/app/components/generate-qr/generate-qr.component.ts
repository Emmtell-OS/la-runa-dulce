import { CodiModel } from './../../models/CodiModel';
import { map } from 'rxjs/operators';
import { Component, ViewChild } from '@angular/core';
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
import { log } from 'console';
import { resolve } from 'path';
import { rejects } from 'assert';

@Component({
  selector: 'app-generate-qr',
  templateUrl: './generate-qr.component.html',
  styleUrl: './generate-qr.component.scss',
})
export class GenerateQrComponent {
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
  generarActive = true;
  pathBase = environment.pathInterp;
  hojasPDFList = [];
  catTipoPaquete: TiposPaqueteModel[] = [];
  colGrid: any;
  borde = 'sinBorde';
  tp = '';
  visibleQR = false;
  progress = '';
  _PROCESANDO = 'PROCESANDO... ';

  @ViewChild(MatTable) tableHistorial!: MatTable<HistorialTableModel>;

  constructor(
    private service: ProcessLotesService,
    private tpService: TipoPaquetesServiceService
  ) {
    this.getRegistroLotes();
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
    this.dataJsonLP.map((lote) => {
      lote['paquetes'].map((paquete) => {
        let runaCod = [];
        paquete['consultados'].map((r: {}) => runaCod.push(Object.keys(r)[0]));
        this.dataTable.push({
          lote: lote['lote'],
          paquete: paquete['codigo'],
          tipoPaquete: paquete['tipoPaquete'],
          activo: '',
          creacion: moment(paquete['creacion']).format('DD-MM-YYYY'),
          consultados: runaCod,
        });
      });
    });

    this.dataSource = new MatTableDataSource<HistorialTableModel>(
      this.dataTable
    );
  }

  public async ordenarSeleccionados() {
    this.visibleQR = true;
    this.generarActive = true;
    await this.ordenarPromise();
    this.generarQR();
  }

  private ordenarPromise() {
    return new Promise((resolve, reject) => {
      this.progress = this._PROCESANDO + '25%';
      this.preseleccionados.map((ps) => {
        let tipoPaquete: TiposPaqueteModel = this.catTipoPaquete.find(
          (tp) =>
            ps.tipoPaquete.toLowerCase() === tp['tipoPaquete'].toLowerCase()
        );
        ps.consultados = tipoPaquete.rowGrid;
        this.seleccionadosList.push(ps);
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
      this.progress = this._PROCESANDO + '50%';
      this.qrList = [];
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
          let qrPorHoja = 0;
          if (contadorFilas === 0) {
            qrPorHoja = tipoPaquete.columnGrid * 8;
          } else {
            calcularRenglonesRestantes = true;
            qrPorHoja = tipoPaquete.columnGrid * (8 - contadorFilas);
          }

          let provisional = consultados.slice(0, qrPorHoja);
          await this.printQRS(provisional, seleccionado, 200).then();
          await this.getElement(500).then((element: any) => {
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
        await this.getElement(200).then((element: any) =>
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
          this.qrList.push({
            codi: seleccionado.lote + runaCode + seleccionado.paquete,
            img: './assets/img/' + runaCode.slice(0, 2) + '.png',
            folio: seleccionado.lote + seleccionado.paquete,
          });
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
      
      if(((this.hojasPDFList.length - 1) - index) === 1) {
        this.progress = this._PROCESANDO + '100%';
      }
      if (index > 0 && index < this.hojasPDFList.length) {
        doc.addPage();
        bufferY = 15;
      }
      for await (let img of hoja) {
        this.progress = this._PROCESANDO + '75%';
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

    this.progress = 'DESCARGANDO...';
    doc.save(`la-runa-dulce-${moment().format('DD-MM-YYYY')}.pdf`);
    this.qrList = [];
    this.tp = '';
    this.preseleccionados = [];
    this.seleccionadosList = [];
    this.hojasPDFList = [];
    this.visibleQR = false;
    this.selection.clear();
    this.progress = '';
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
