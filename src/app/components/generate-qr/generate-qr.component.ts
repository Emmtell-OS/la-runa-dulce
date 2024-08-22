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
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import moment from 'moment';

@Component({
  selector: 'app-generate-qr',
  templateUrl: './generate-qr.component.html',
  styleUrl: './generate-qr.component.scss',
})
export class GenerateQrComponent {
  displayedColumns: string[] = ['select', 'lote', 'paquete', 'creacion'];
  dataJsonLP: any;
  dataSource: any;
  selection: any;
  dataTable: HistorialTableModel[] = [];
  preseleccionados: HistorialTableModel[] = [];
  codiModelList: CodiModel[] = [];
  qrList: CodiModel[] = [];
  mostarQR = false;
  is24 = true;
  generarActive = true;

  @ViewChild(MatTable) tableHistorial!: MatTable<HistorialTableModel>;

  constructor() {
    this.getRegistroLotes();
    this.cargarDatos();
  }

  private getRegistroLotes() {
    /**conexión y consumo de Firebase */
    try {
      let fireb =
        '[{"lote":"QFvW99yh0T","activo":true,"creacion":"2024-08-19T22:55:11.158Z","paquetes":[{"codigo":"br61tK8kNi","activo":true,"creacion":"2024-08-19T22:55:11.158Z","estatusProduccion":"T","tipoPaquete":"Tira","consultados":[{"FE01":"","consultas":0,"inter":3},{"UR00":"","consultas":0,"inter":2},{"DA01":"","consultas":0,"inter":0},{"RA01":"","consultas":0,"inter":0},{"TE00":"","consultas":0,"inter":0},{"PE00":"","consultas":0,"inter":0},{"EI01":"","consultas":0,"inter":1},{"NA00":"","consultas":0,"inter":0},{"BE01":"","consultas":0,"inter":3},{"LA00":"","consultas":0,"inter":3},{"KA01":"","consultas":0,"inter":0},{"JE01":"","consultas":0,"inter":3}]},{"codigo":"QpMGpGR0d0","activo":true,"creacion":"2024-08-19T22:55:11.158Z","estatusProduccion":"T","tipoPaquete":"Tira","consultados":[{"FE01":"","consultas":0,"inter":0},{"UR00":"","consultas":0,"inter":1},{"GE01":"","consultas":0,"inter":3},{"MA00":"","consultas":0,"inter":3},{"EI01":"","consultas":0,"inter":3},{"SW01":"","consultas":0,"inter":2},{"BE00":"","consultas":0,"inter":0},{"OD01":"","consultas":0,"inter":1},{"FE00":"","consultas":0,"inter":2},{"KA00":"","consultas":0,"inter":3},{"LA00":"","consultas":0,"inter":3},{"KA01":"","consultas":0,"inter":0}]},{"codigo":"WpLbzP0yIq","activo":true,"creacion":"2024-08-19T22:55:11.158Z","estatusProduccion":"T","tipoPaquete":"Tira","consultados":[{"SW01":"","consultas":0,"inter":3},{"TH01":"","consultas":0,"inter":3},{"AL01":"","consultas":0,"inter":1},{"NG01":"","consultas":0,"inter":0},{"LA00":"","consultas":0,"inter":2},{"OT01":"","consultas":0,"inter":3},{"AS00":"","consultas":0,"inter":0},{"TE00":"","consultas":0,"inter":3},{"PE01":"","consultas":0,"inter":2},{"KA01":"","consultas":0,"inter":2},{"RA00":"","consultas":0,"inter":1},{"JE01":"","consultas":0,"inter":3}]}]},{"lote":"2zmn55favz","activo":true,"creacion":"2024-08-19T22:55:11.158Z","paquetes":[{"codigo":"NaZiwdbiC9","activo":true,"creacion":"2024-08-19T22:55:11.158Z","estatusProduccion":"T","tipoPaquete":"Tira","consultados":[{"TE00":"","consultas":0,"inter":1},{"SW01":"","consultas":0,"inter":0},{"OD01":"","consultas":0,"inter":1},{"NA00":"","consultas":0,"inter":3},{"NA01":"","consultas":0,"inter":1},{"TE01":"","consultas":0,"inter":3},{"EH01":"","consultas":0,"inter":2},{"JE01":"","consultas":0,"inter":2},{"FE01":"","consultas":0,"inter":3},{"OT00":"","consultas":0,"inter":0},{"OT01":"","consultas":0,"inter":3},{"GE01":"","consultas":0,"inter":3}]},{"codigo":"7RBJB4caai","activo":true,"creacion":"2024-08-19T22:55:11.158Z","estatusProduccion":"T","tipoPaquete":"Tira","consultados":[{"GE01":"","consultas":0,"inter":3},{"JE01":"","consultas":0,"inter":1},{"PE01":"","consultas":0,"inter":0},{"OD01":"","consultas":0,"inter":1},{"BE00":"","consultas":0,"inter":0},{"KA00":"","consultas":0,"inter":1},{"TE00":"","consultas":0,"inter":0},{"KA01":"","consultas":0,"inter":0},{"TE01":"","consultas":0,"inter":3},{"WU00":"","consultas":0,"inter":1},{"OT01":"","consultas":0,"inter":0},{"RA01":"","consultas":0,"inter":1}]}]},{"lote":"42x5ErAWdZ","activo":true,"creacion":"2024-08-19T22:55:11.159Z","paquetes":[{"codigo":"61KPxRFuvS","activo":true,"creacion":"2024-08-19T22:55:11.159Z","estatusProduccion":"P","tipoPaquete":"Tira","consultados":[{"IS01":"","consultas":0,"inter":1},{"OT00":"","consultas":0,"inter":1},{"EH00":"","consultas":0,"inter":2},{"AS00":"","consultas":0,"inter":0},{"BE01":"","consultas":0,"inter":1},{"SW01":"","consultas":0,"inter":1},{"TE00":"","consultas":0,"inter":0},{"NG01":"","consultas":0,"inter":0},{"JE01":"","consultas":0,"inter":2},{"WU01":"","consultas":0,"inter":3},{"UR00":"","consultas":0,"inter":2},{"NA00":"","consultas":0,"inter":0}]}]}]';
      this.dataJsonLP = JSON.parse(fireb);
      //console.log(this.dataJsonLP);
    } catch (error) {
      console.log(error);
    }
  }

  private cargarDatos() {
    this.dataJsonLP.map((lote) => {
      lote['paquetes'].map((paquete) => {
        let runaCod = [];
        paquete['consultados'].map((r: {}) => runaCod.push(Object.keys(r)[0]));
        this.dataTable.push({
          lote: lote['lote'],
          paquete: paquete['codigo'],
          tipoPaquete: '',
          activo: '',
          creacion: moment(paquete['creacion']).format('DD-MM-YYYY'),
          consultados: runaCod,
        });
      });
    });

    this.dataSource = new MatTableDataSource<HistorialTableModel>(
      this.dataTable
    );
    this.selection = new SelectionModel<HistorialTableModel>(true, []);
  }

  public generar() {
    this.codiModelList.splice(0, this.codiModelList.length);
    this.generarCodiList();
    this.crearQRS();
  }

  private generarCodiList() {
    this.preseleccionados.map((ps) => {
      let indexDT = this.dataTable.findIndex(
        (dt) => dt['lote'] === ps['lote'] && dt['paquete'] === ps['paquete']
      );
      this.dataTable[indexDT]['consultados'].map((cns: any) => {
        this.codiModelList.push({
          codi: ps['lote'] + cns + ps['paquete'],
          img: cns.slice(0, 2),
          folio: ps['lote'] + ps['paquete'],
        });
      });
    });
  }

  private crearQRS() {
    let limiteQR = this.codiModelList.length - 1;
    let totalPaginas = Math.ceil(this.codiModelList.length / 48);
    let paginasCreadas = 0;
    let DATA: any;
    const doc = new jsPDF('p', 'pt', 'a4');
    const options = {
      background: 'white',
      scale: 3,
    };
    this.qrList = [];

    let intervalo = setInterval(() => {

      if (paginasCreadas <= totalPaginas) {

        if(paginasCreadas === totalPaginas) {
          doc.save(`la-runa-dulce-${moment().format('DD-MM-YYYY')}.pdf`);
        }
  
        if (paginasCreadas > 0 && totalPaginas > 1) {
          doc.addPage();
        }
  
        this.qrList = this.codiModelList.slice(0, 48);
  
        this.mostarQR = true;
  
        setTimeout(() => {
          DATA = document.getElementById('contentToConvert');
  
          try {
            html2canvas(DATA, options).then((canvas) => {
              const img = canvas.toDataURL('image/PNG');
  
              // Add image Canvas to PDF
              const bufferX = 15;
              const bufferY = 15;
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
                'FAST'
              );
              return doc;
            });
            paginasCreadas = paginasCreadas + 1;
            this.qrList.splice(0, this.qrList.length);
            //.then((docResult) => {
            //docResult.save(`la-runa-dulce-${moment().format('DD-MM-YYYY')}.pdf`);
            //});
          } catch (error) {
            console.error(error);
          }
        }, 300);
      } else {
        clearInterval(intervalo);
      }

    }, 1500)

  }

  mapearSeleccionado(row?: HistorialTableModel) {
    if (this.selection.isSelected(row)) {
      //agreagar de preseleccionados
      this.preseleccionados.push({
        lote: row['lote'],
        paquete: row['paquete'],
        tipoPaquete: '',
        activo: '',
        creacion: '',
        consultados: 0,
      });
    } else {
      //eliminar a preseleccionados
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
