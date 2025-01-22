import { Component, ViewChild, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { LotesConsoleModel } from '../../models/LotesConsoleModel';
import { PaquetesConsoleModel } from '../../models/PaquetesConsoleModel';
import { ProcessLotesService } from '../../service/process-lotes.service';
import { EliminarComponent } from '../modals/eliminar/eliminar.component';

@Component({
  selector: 'lp-console',
  templateUrl: './lp-console.component.html',
  styleUrl: './lp-console.component.scss'
})
export class LpConsoleComponent {

  dataJsonLP = [];
  displayedLotesColumns: string[] = ['lote', 'paquetes', 'fecha', 'estatus'];
  dataSourceHistorial: any;
  historialLotes: LotesConsoleModel[] = [];

  displayedPaquetesColumns: string[] = ['paquete', 'tipoPaquete', 'lote', 'creacion', 'estatus'];
  dataSourceHistorialPaqs: any;
  historialPaqs: PaquetesConsoleModel[] = [];
  readonly dialog = inject(MatDialog);

  @ViewChild(MatTable) tableHistorialLotes!: MatTable<LotesConsoleModel>;
  @ViewChild(MatTable) tableHistorialPaquetes!: MatTable<PaquetesConsoleModel>;

  constructor(private service: ProcessLotesService) {
    this.getRegistroLotes();
  }

  public async getRegistroLotes() {
    /**conexión y consumo de Firebase */
    this.dataJsonLP.splice(0, this.dataJsonLP.length);
    await this.obtenerFirebaseData().then((data: []) => {
      this.dataJsonLP.push(...data);
    });
    
    this.loadHistorialTable(true);
    this.loadHistorialPaqsTable(true);
  }

  obtenerFirebaseData() {
    return new Promise((resolve, reject) => {
      this.service.getAll().valueChanges().subscribe(val => {
        resolve(val);
      })
    });
  }

  public loadHistorialTable(ft: boolean) {
    
    this.historialLotes.splice(0, this.historialLotes.length);
    this.dataSourceHistorial = new MatTableDataSource();  
    this.dataJsonLP.forEach((lote) => {     
      this.historialLotes.push({
        "lote": lote['lote'],
        "paquetes": (lote['paquetes'] === '') ? '0' : lote['paquetes'].length,
        "creacion": lote['creacion'],
        "activo": lote['activo']
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
    this.dataJsonLP.filter((lt) => lt['activo'] === true).forEach((lote) => {
      let folioLote = lote['lote']
      let isEliminarPaq = (lote['paquetes'].length > 1) ? true : false;
      lote['paquetes'].forEach(paquete => {
        this.historialPaqs.push({
          "paquete": paquete['codigo'],
          "tipoPaquete": paquete['tipoPaquete'],
          "lote": folioLote,
          "creacion": paquete['creacion'],
          "activo": paquete['activo'],
          "isEliminar": isEliminarPaq
        });
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
        this.loadHistorialTable(false);
      }
    });
  }

  desactivarLote(element: any) {
    this.dataJsonLP.find((lote => {
      if(lote['lote'] === element['lote']) {
        (lote['activo']) ? lote['activo'] = false : lote['activo'] = true; 
      }
    }));

    let loteToSave = this.dataJsonLP.find(lote => lote['lote'] === element['lote'] );
    this.service.update(element['lote'], loteToSave);
    this.getRegistroLotes();
    this.loadHistorialTable(false);
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
    this.service.delete(element['lote']);
    this.getRegistroLotes();
    this.loadHistorialTable(false);
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
    this.dataJsonLP.find((lote => {
      if(lote['lote'] === element['lote']) {
        lote['paquetes'].forEach(paq => {
          if(paq['codigo'] === element['paquete']) {
            (paq['activo']) ? paq['activo'] = false : paq['activo'] = true;     
          }
        });
      }
    }));

    let loteToSave = this.dataJsonLP.find(lote => lote['lote'] === element['lote'] );
    this.service.update(element['lote'], loteToSave);
    this.getRegistroLotes();
    this.loadHistorialTable(false);
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
    let paqueteIndex = 0;
    this.dataJsonLP.find((lote => {
      if(lote['lote'] === element['lote']) {
        paqueteIndex = lote['paquetes'].findIndex(paq => paq['codigo'] === element['paquete']);
        lote['paquetes'].splice(paqueteIndex, 1);
        if (lote['paquetes'].length === 0) {
          lote['activo'] = false;
          lote['paquetes'] = '';
        }
      }
    }));

    let loteToSave = this.dataJsonLP.find(lote => lote['lote'] === element['lote'] );
    this.service.update(element['lote'], loteToSave);
    this.getRegistroLotes();
    this.loadHistorialPaqsTable(false);

  }


}
