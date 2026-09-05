import { LoteModel } from './../../models/LotelModel';
import { Component, ViewChild, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { LotesConsoleModel } from '../../models/LotesConsoleModel';
import { PaquetesConsoleModel } from '../../models/PaquetesConsoleModel';
import { ProcessLotesService } from '../../service/process-lotes.service';
import { EliminarComponent } from '../modals/eliminar/eliminar.component';
import { PaqueteModel } from '../../models/PaqueteModel';

@Component({
  selector: 'lp-console',
  templateUrl: './lp-console.component.html',
  styleUrl: './lp-console.component.scss'
})
export class LpConsoleComponent {

  loteList: LoteModel[] = [];
  paqueteList: PaqueteModel[] = [];

  dataJsonLP = [];
  displayedLotesColumns: string[] = ['lote', 'paquetes', 'fecha', 'estatus', 'actions'];
  dataSourceHistorial: any;
  historialLotes: LotesConsoleModel[] = [];

  displayedPaquetesColumns: string[] = ['paquete', 'tipoPaquete', 'lote', 'creacion', 'estatus', 'actions'];
  dataSourceHistorialPaqs: any;
  historialPaqs: PaquetesConsoleModel[] = [];
  readonly dialog = inject(MatDialog);

  @ViewChild(MatTable) tableHistorialLotes!: MatTable<LotesConsoleModel>;
  @ViewChild(MatTable) tableHistorialPaquetes!: MatTable<PaquetesConsoleModel>;

  constructor(private service: ProcessLotesService) {
    this.getRegistroLotes(true);
  }

  public async getRegistroLotes(ft: boolean) {
    /**conexión y consumo de Firebase */
    await this.obtenerFirebaseData().then(() => {
      this.loadHistorialLoteTable(ft);
      this.loadHistorialPaqsTable(ft);
    });
  }

  obtenerFirebaseData() {
    return new Promise((resolve) => {
      this.service.getLotes().valueChanges().subscribe(lot => {
        this.loteList.splice(0, this.loteList.length);
        this.loteList.push(...lot); 
        
        this.service.getPaquetes().valueChanges().subscribe(paq => {
          this.paqueteList.splice(0, this.paqueteList.length);
          this.paqueteList.push(...paq);
          resolve('');
        });
      });
    });
  }

  public loadHistorialLoteTable(ft: boolean) {
    this.historialLotes.splice(0, this.historialLotes.length);
    this.dataSourceHistorial = new MatTableDataSource();  
    this.loteList.forEach((lote: LoteModel) => {     
      this.historialLotes.push({
        "lote": lote.lote,
        "paquetes": this.paqueteList.filter(paq => paq.loteId === lote.lote).length.toString(),
        "creacion": lote.creacion,
        "activo": lote.activo
      });
    });
    this.historialLotes.sort((a, b) => new Date(b.creacion).getTime() - new Date(a.creacion).getTime());
    this.dataSourceHistorial = new MatTableDataSource(this.historialLotes);
    if(!ft) {
      this.tableHistorialLotes.renderRows();
    }
  }

  public loadHistorialPaqsTable(ft: boolean) {
    
    this.historialPaqs.splice(0, this.historialPaqs.length);
    this.dataSourceHistorialPaqs = new MatTableDataSource();
    this.paqueteList.map((paq: PaqueteModel) => {
      let isEliminarPaq = (this.paqueteList.filter(paqt => paqt.loteId === paq.loteId).length > 1) ? true : false;
      this.historialPaqs.push({
        "paquete": paq.codigo,
        "tipoPaquete": paq.tipoPaquete,
        "lote": paq.loteId,
        "creacion": paq.creacion,
        "activo": paq.activo.toString(),
        "isEliminar": isEliminarPaq
      });
    });
    this.historialPaqs.sort((a, b) => new Date(b.creacion).getTime() - new Date(a.creacion).getTime());
    this.dataSourceHistorialPaqs = new MatTableDataSource(this.historialPaqs);
    if(!ft) {
      this.tableHistorialPaquetes.renderRows();
    }
  }

  applyFilterHistorial(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceHistorial.filter = filterValue.trim().toLowerCase();
  }

  applyFilterHistorialPaq(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceHistorialPaqs.filter = filterValue.trim().toLowerCase();
  }

  public mostrarDesactivarLote(element: any) {
    const dialogRef = this.dialog.open(EliminarComponent, {
      data: {
        seccion: (element['activo']) ? 'desLote' : 'actLote', 
        values: element['lote']
      },
      width: '300px',
      height:'170px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.desactivarLote(element);
      } else {
        this.loadHistorialLoteTable(false);
      }
    });
  }

  desactivarLote(element: any) {
    let statusUpdate = (element['activo'] === 'true') ? 'false' : 'true';
    this.service.updateLoteEstatusActivo(element['lote'], statusUpdate);
    this.getRegistroLotes(false);
  }

  public mostrarEliminarLote(element: any) {
    const dialogRef = this.dialog.open(EliminarComponent, {
      data: {
        seccion: 'delLote', 
        values: element['lote']
      },
      width: '400px',
      height:'170px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.eliminarLote(element);
      }
    });
  }

  eliminarLote(element: any) {
    const loteId = element['lote'];

    this.service.deleteLoteCascada(loteId, this.paqueteList)
      .then(() => {
        
        // 2. Refrescamos la tabla SOLO cuando Firebase confirme que ya borró todo en el servidor
        this.getRegistroLotes(false);
      })
      .catch((error) => {
        console.error('Error al intentar eliminar en cascada:', error);
      });
    this.getRegistroLotes(false);
  }

  public mostrarDesactivarPaquete(element: any) {
    let paq = `${element['tipoPaquete']} - ${element['paquete']}`
    const dialogRef = this.dialog.open(EliminarComponent, {
      data: {
        seccion: (element['activo']) ? 'desPaq' : 'actPaq', 
        values: paq
      },
      width: '350px',
      height:'170px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.desactivarPaquete(element);
      } else {
        this.loadHistorialPaqsTable(false);
      }
    });
  }

  desactivarPaquete(element: any) {
    let statusUpdate = (element['activo'] === 'true') ? 'false' : 'true';
    this.service.updatePaqueteEstatusActivo(element['paquete'], statusUpdate);
    this.getRegistroLotes(false);
  }

  public mostrarEliminarPaquete(element: any) {
    let paq = `${element['tipoPaquete']} - ${element['paquete']}`
    const dialogRef = this.dialog.open(EliminarComponent, {
      data: {
        seccion: 'delPaq', 
        values: paq
      },
      width: '400px',
      height:'170px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.eliminarPaquete(element);
      }
    });
  }

  eliminarPaquete(element: any) {
    
    this.service.deletePaquete(element['paquete']);
    this.getRegistroLotes(false);

  }


}
