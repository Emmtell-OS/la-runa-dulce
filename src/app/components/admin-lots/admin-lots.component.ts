import { TableModel } from './../../models/TableModel';
import { LoteModel } from './../../models/LotelModel';
import { ProcessLotesService } from './../../service/process-lotes.service';
import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { PaqueteModel } from '../../models/PaqueteModel';
import { FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTable, MatTableDataSource, MatTableModule } from '@angular/material/table';
import { HistorialTableModel } from '../../models/HistorialTableModel';
import { MatDialog } from '@angular/material/dialog';
import { ProduccionModel } from '../../models/ProduccionModel';
import moment from 'moment';
import { GenerateQrComponent } from '../generate-qr/generate-qr.component';
import { TipoPaquetesServiceService } from '../../service/tipo-paquetes-service.service';
import { TiposPaqueteModel } from '../../models/TiposPaqueteModel';
import Utils from '../../utilities/utils';
import { CodiModel } from '../../models/CodiModel';
import { environment } from '../../../environments/environment';
import { DetallesLoteComponent } from '../modals/detalles-lote/detalles-lote.component';
import { EmpaqueModel } from '../../models/EmpaqueModel';
import { RUNAS_BASE } from '../constantes/runas.constants';
import { InterpretacionesServiceService } from '../../service/interpretaciones-service.service';
import { InterpretacionModel } from '../../models/InterpretacionModel';

@Component({
  selector: 'app-admin-lots',
  templateUrl: './admin-lots.component.html',
  styleUrl: './admin-lots.component.scss',
})
export class AdminLotsComponent implements OnInit {

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
  displayedHistorialColumns: string[] = ['lote', 'loteActivo', 'paquete', 'tipoPaquete', 'activo', 'consultados', 'action'];
  dataSourceHistorial: any;
  historialProductos: HistorialTableModel[] = [];
  displayedProduccionColumns: string[] = ['lote', 'paquete', 'tipoPaquete', 'produccion', 'action'];
  datasourceProduccion: any;
  produccionProductos: ProduccionModel[] = [];
  btnActive = true;
  btnProduction = [];
  qrList: CodiModel[] = [];
  qrList2: CodiModel[] = [];
  pathBase = environment.path;
  
  @ViewChild(MatTable) table!: MatTable<TableModel>;
  @ViewChild(MatTable) tableHistorial!: MatTable<HistorialTableModel>;
  @ViewChild(MatTable) tableProduccion!: MatTable<ProduccionModel>;

  constructor(private service: ProcessLotesService, 
              private tpService: TipoPaquetesServiceService,
              private interpretacionesService: InterpretacionesServiceService) {
    this.getRegistroLotes();
    this.getRegistroTiposPaquete();
    this.formularioRegistro = new FormGroup({
      lote: new FormControl(''),
      tipoPaquete: new FormControl('', Validators.required),
      cantidad: new FormControl('', [Validators.required, Validators.max(100)])
    });
    this.qrLogo();
  }

  ngOnInit(): void { }

  public async getRegistroLotes() {
    this.idsLotesBase = [];
    this.obtenerHistorialLotes();
    this.loadHistorialTable(true);
    this.loadProduccion(true);
  }

  obtenerHistorialLotes() {
    this.service.getLotes().valueChanges().subscribe((lotesBase: LoteModel[]) => {
      if (lotesBase) {

        this.idsLotesBase = ['Nuevo lote'];

        this.idsLotesBase.push(...lotesBase.map(l => l.lote));
        
        this.cargarFoliosLotes();
      }      
    });
  }

  cargarFoliosLotes() {
    this.idsLotesList = this.idsLotesBase;
    this.filteredLotes = this.lotesFilterControl.valueChanges
    .pipe(
      startWith(''),
      map(lote => lote ? this.filterLotes(lote) : this.idsLotesList.slice())
    );
  }

  filterLotes(name: string) {
    return this.idsLotesList.filter(lot => lot.toUpperCase().includes(name.toUpperCase()));
  }

  private qrLogo() {
    if(Utils.getRand(0,1) === 1) {
      this.qrList.push({
        codi: this.pathBase,
        img: '../../../assets/img/logos/logo-rd-oficial.png',
        folio: ''
      });
    } else {
      this.qrList2.push({
        codi: this.pathBase,
        img: '../../../assets/img/logos/logo-rd-oficial.png',
        folio: ''
      });
    }
  }

  public async getRegistroTiposPaquete() {
    /**conexión y consumo de Firebase */
      this.tiposPaquete = [];
      this.listaTP = [];
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

  public getRegistroInterpretaciones() {
    this.interpretacionesService.getAll().valueChanges().subscribe(interps => {
      this.catInterpretaciones = interps;
    });
  }

  public async getRegistroTiposPaqueteByTipo(tipo: string) {
    let listaTP: TiposPaqueteModel;
    /**conexión y consumo de Firebase */
    await this.obtenerFirebaseTPByTipoData(tipo).then((data: TiposPaqueteModel) => {
      listaTP = data;
    });
    
    return listaTP;
  }

  obtenerFirebaseTPByTipoData(tipo: string) {
    return new Promise((resolve, reject) => {
      this.tpService.getTipo(tipo).valueChanges().subscribe(val => {
        resolve(val);
      })
    });
  }

  applyFilterHistorial(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceHistorial.filter = filterValue.trim().toLowerCase();
  }

  public loadHistorialTable(ft: boolean) {
    
    // 1. Limpiamos el arreglo local y el DataSource
    this.historialProductos = [];
    this.dataSourceHistorial = new MatTableDataSource();

    // 2. Escuchamos el nodo plano de paquetes desde el servicio
    this.service.getPaquetes().valueChanges().subscribe((paquetesBase: any[]) => {
    if (!paquetesBase) {
      this.dataSourceHistorial = new MatTableDataSource([]);
      return;
    }

    this.historialProductos = [];

    paquetesBase.forEach((paq) => {
      // Filtramos en memoria: Solo nos interesan los Terminados ('T')
      if (paq['estatusProduccion'] === 'T') {
        
        // Contamos cuántos empaques han sido escaneados al menos una vez
        // Ajustado al nuevo modelo estructurado con propiedad 'consultas'
        const totalConsultados = paq['consultados'] 
          ? paq['consultados'].filter((x: any) => x['consultas'] > 0).length 
          : 0;

        this.historialProductos.push({
          "lote": paq['loteId'], // Usamos la referencia directa al lote
          "loteActivo": paq['activo'], // O la bandera del paquete, según tu regla
          "paquete": paq['codigo'],
          "tipoPaquete": paq['tipoPaquete'],
          "activo": paq['activo'],
          "creacion": paq['creacion'],
          "consultados": totalConsultados,
        });
      }
    });

    // 3. Ordenamos por fecha de creación (de más reciente a más antiguo)
    this.historialProductos.sort((a, b) => new Date(b.creacion).getTime() - new Date(a.creacion).getTime());
    
    // 4. Asignamos los datos al DataSource de Material
    this.dataSourceHistorial = new MatTableDataSource(this.historialProductos);
    
    // Si no es la primera carga y la tabla ya existe, forzamos el render
    if (!ft && this.tableHistorial) {
      this.tableHistorial.renderRows();
    }
  });
  }

  public loadProduccion(ft: boolean) {
    this.produccionProductos = [];
    this.btnProduction = [];

    // Consumimos el nuevo nodo plano del servicio
    this.service.getPaquetes().valueChanges().subscribe((paquetesBase: any[]) => {
      // Si por alguna razón viene vacío, inicializamos la tabla vacía
      if (!paquetesBase) {
        this.datasourceProduccion = new MatTableDataSource([]);
        return;
      }

      this.produccionProductos = [];
      this.btnProduction = [];

      paquetesBase.forEach((paq) => {
        // Filtramos en memoria: Solo nos interesa lo que NO está terminado ('T')
        if (paq['estatusProduccion'] !== 'T') {
          this.produccionProductos.push({
            "lote": paq['loteId'], // Ahora el paquete conoce a su lote directamente
            "paquete": paq['codigo'],
            "tipoPaquete": paq['tipoPaquete'],
            "produccion": this.getEstatusProd(paq['estatusProduccion']),
          });

          // Lógica de tus botones de acción
          if (paq['estatusProduccion'] === 'P') {
            this.btnProduction.push(true);
          } else if (paq['estatusProduccion'] === 'EP') {
            this.btnProduction.push(false);
          }
        }
      });

      // Asignamos los datos filtrados al DataSource de Material
      this.datasourceProduccion = new MatTableDataSource(this.produccionProductos);

      // Si NO es la primera carga (ft === false), forzamos el renderizado de la tabla
      if (!ft && this.tableProduccion) {
        this.tableProduccion.renderRows();
      }
    });
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

  /**
   * Crea un registro de memoria en la lista stash de la tabla preregistro.
   * 
   * @param formularioPreregistro
   */
  public agregarPreregistro(formularioPreregistro: FormControl) {
    if(this.autoCompleteInputValue === undefined ||
      this.autoCompleteInputValue.toLowerCase() === 'nuevo lote' ||
      this.autoCompleteInputValue === '') {
        this.autoCompleteInputValue = Utils.generateFolio();
    }

    this.formularioRegistro.value.lote = this.autoCompleteInputValue;
    this.stashLoteList.push(this.formularioRegistro.value);
    this.getIdLoteList();

    formularioPreregistro.setValue(null);
    this.autoCompleteInputValue = '';

    this.dataSource = new MatTableDataSource(this.stashLoteList);
    this.formularioRegistro.reset();
    this.getRegistroInterpretaciones();
  }

  public dropRow(index: any, ctrl: FormControl) {
    this.stashLoteList.splice(index, 1);
    this.dataSource = this.stashLoteList;
    this.table.renderRows();
    this.getIdLoteList();
    ctrl.setValue(null);
  }

  /**
   * Actualiza la lista de folios para lotes
   */
  public getIdLoteList() {
    this.idsLotesList = [];
    let loteStashList = this.stashLoteList.map(lot => lot['lote']);
    this.idsLotesList.push(...this.idsLotesBase);
    this.idsLotesList.push(...loteStashList);
  }

  public limpiarTablaStash() {
    this.stashLoteList.splice(0, this.stashLoteList.length);
    this.dataSource = this.stashLoteList;
    this.table.renderRows();
  }

  /***************Crear lote json******************** */

  public async iniciarProduccion(index: number, element: any) {
    try {
      // Cambiamos el estatus en Firebase directamente usando el ID del paquete
      await this.service.updateEstatusProduccion(element.paquete, 'EP');
      
      // Actualizamos localmente el botón para reflejar el cambio visual inmediato
      this.btnProduction[index] = false;
      this.produccionProductos[index].produccion = this.getEstatusProd('EP');
      this.datasourceProduccion = new MatTableDataSource(this.produccionProductos);
    } catch (error) {
      console.error('Error al iniciar producción:', error);
    }
  }

  public async completarProduccion(element: any, index: number) {
    try {
      // Cambiamos el estatus a Terminado ('T') en Firebase
      await this.service.updateEstatusProduccion(element.paquete, 'T');
      
      // Al ser Terminado, la suscripción de 'loadProduccion' lo filtrará 
      // automáticamente y desaparecerá de la tabla de producción.
    } catch (error) {
      console.error('Error al completar producción:', error);
    }
    
  }

  public mostrarGenerarQR() {
    const dialogRef = this.dialog.open(GenerateQrComponent, {
      data: '',
      width: '95%',
      maxWidth: '100%',
      height:'98%'
    });
  }

  public detallesPaquete(index: any, element: any) {
    const dialogRef = this.dialog.open(DetallesLoteComponent, {
      data: { 
        idPaquete: element.paquete, // El código único del paquete (QR)
        lote: element.lote           // El ID del lote
      },
      width: '1000px',
      height: '98%'
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        // Lógica al cerrar si la necesitas
      }
    });
  }

  public registrarPedido() {

    // Recorremos los lotes preregistrados en tu tabla temporal
    for (const element of this.stashLoteList) {
      const loteId = element['lote'];
      const cantidadPaquetes = parseInt(element['cantidad']);
      const tipoPaquete = element['tipoPaquete'];

      // Generamos y guardamos la cantidad de paquetes solicitada
      for (let i = 0; i < cantidadPaquetes; i++) {
        
        // Construimos el modelo de paquete inyectando el arreglo de empaques
        const paqueteModel: PaqueteModel = {
          codigo: Utils.generateFolio(),
          activo: true,
          creacion: moment().format(),
          estatusProduccion: 'P',
          tipoPaquete: tipoPaquete,
          loteId: "",
          // Aquí se ejecuta el método de arriba y devuelve el EmpaqueModel[] perfectamente ordenado
          consultados: this.createConsultados(tipoPaquete), 
        };

        try {
          // Guardamos en Firebase mediante el Multi-path update del servicio
          this.service.registrarPaquete(paqueteModel, loteId);
        } catch (error) {
          console.error(`Error al registrar el paquete ${paqueteModel.codigo} en el lote ${loteId}:`, error);
        }
      }
    }

    // Notificamos o refrescamos banderas visuales si es necesario
    this.getRegistroLotes();
    this.limpiarTablaStash();
  }

  private createConsultados(tipoPaquete: string): EmpaqueModel[] {
    const tipoPaq: TiposPaqueteModel = this.listaTP.find((tp) => tipoPaquete === tp['tipoPaquete']);
    if (!tipoPaq) return [];

    const poolRunasDisponibles: string[] = [];
    const limiteRunas = tipoPaq.totalEmpaques;
  
    // 1. Generamos el universo completo de variantes válidas (41 runas únicas posibles)
    RUNAS_BASE.forEach((runa, index) => {
      poolRunasDisponibles.push(runa + '01'); // Versión normal
      
      // Si el índice es mayor a 8, la runa admite posición invertida ('00')
      if (index > 8) {
        poolRunasDisponibles.push(runa + '00');
      }
    });
  
    // 2. Barajamos el pool usando el algoritmo clásico Fisher-Yates (Ultra eficiente)
    for (let i = poolRunasDisponibles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [poolRunasDisponibles[i], poolRunasDisponibles[j]] = [poolRunasDisponibles[j], poolRunasDisponibles[i]];
    }
  
    // 3. Extraemos las runas necesarias manejando casos donde el límite supere las 41 disponibles
    const runasSeleccionadas: string[] = [];
    while (runasSeleccionadas.length < limiteRunas) {
      const faltantes = limiteRunas - runasSeleccionadas.length;
      runasSeleccionadas.push(...poolRunasDisponibles.slice(0, faltantes));
    }

    // 4. Mapeamos directamente al nuevo formato estructurado
    return runasSeleccionadas.map((r) => {
      let listaInterpretaciones: InterpretacionModel = this.catInterpretaciones.filter((interp: InterpretacionModel) => interp.claveRuna === r)[0];
      const interpretacion = Utils.elegirInterpretacion(listaInterpretaciones.interpretaciones);
      return {
        runaId: r,
        timestamp: '',
        consultas: 0,
        interpretacionId: interpretacion === null ? 0 : interpretacion
      };
    });
  }

  public soloNumeros() {
    // Limpia cualquier caracter que no sea dígito usando una expresión regular limpia
    const limpio = this.formularioRegistro.value['cantidad'].replace(/[^0-9]/g, '');
    
    this.formularioRegistro.patchValue({
      cantidad: limpio
    }, { emitEvent: false });
  }

  private getRand(MAX:number, MIN:number): number {
    return Math.floor(Math.random() * (MAX - MIN + 1)) + MIN;
  }

}
