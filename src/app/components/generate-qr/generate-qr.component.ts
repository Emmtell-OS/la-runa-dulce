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
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import moment from 'moment';
import { ProcessLotesService } from '../../service/process-lotes.service';

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
  paginasCreadas = 0;
  pathBase = environment.pathInterp;

  @ViewChild(MatTable) tableHistorial!: MatTable<HistorialTableModel>;

  constructor(private service: ProcessLotesService) {
    this.getRegistroLotes();
  }

  private async getRegistroLotes() {
    /**conexión y consumo de Firebase */
    try {
      await this.obtenerFirebaseData().then((data: []) => {
        this.dataJsonLP = data;
      });
      
      console.log(this.dataJsonLP);
      this.cargarDatos();
      //console.log(this.dataJsonLP);
    } catch (error) {
      console.log(error);
    }
  }

  obtenerFirebaseData() {
    return new Promise((resolve, reject) => {
      this.service.getAll().valueChanges().subscribe(val => {
        resolve(val);
      })
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

    /**
     * Esta lógica es temporal, se dbe crear flujo dinamico de ordenamiendo en qr
     * basado en el total de empaques según el tipo de paquete
     */

    let limiteQR = this.codiModelList.length - 1;
    let totalPaginas = Math.ceil(this.codiModelList.length / 48);
    let DATA: any;
    const doc = new jsPDF('p', 'pt', 'a4');
    const options = {
      background: 'white',
      scale: 3,
    };
    this.qrList = [];

    let intervalo = setInterval(() => {

      if(this.paginasCreadas === totalPaginas) {
        doc.save(`la-runa-dulce-${moment().format('DD-MM-YYYY')}.pdf`);
      }

      this.qrList = [];

      if (this.paginasCreadas < totalPaginas) {
  
        if (this.paginasCreadas > 0 && totalPaginas > 1) {
          doc.addPage();
          this.codiModelList.splice(0, 48);
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
            this.paginasCreadas = this.paginasCreadas + 1;
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

    }, 2020)

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
