import { Component, OnInit, ViewChild, ElementRef, inject } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { combineLatest } from 'rxjs';
import { take } from 'rxjs/operators';
import { jsPDF } from 'jspdf';
import moment from 'moment';

import { ProcessLotesService } from '../../service/process-lotes.service';
import { TipoPaquetesServiceService } from '../../service/tipo-paquetes-service.service';
import { HistorialTableModel } from '../../models/HistorialTableModel';
import { TiposPaqueteModel } from '../../models/TiposPaqueteModel';
import { environment } from '../../../environments/environment';
import { QrGeneratorService } from '../../service/qr-generator.service';
import { url } from 'inspector';
import Utils from '../../utilities/utils';

@Component({
  selector: 'app-generate-qr',
  templateUrl: './generate-qr.component.html',
  styleUrl: './generate-qr.component.scss',
})
export class GenerateQrComponent implements OnInit {
  displayedColumns: string[] = ['select', 'tipoPaquete', 'paquete', 'lote', 'creacion'];
  dataSource = new MatTableDataSource<HistorialTableModel>();
  selection = new SelectionModel<HistorialTableModel>(true, []);
  
  private preseleccionados: HistorialTableModel[] = [];
  private catTipoPaquete: TiposPaqueteModel[] = [];
  
  formatoImpresion: 'TERMICO' | 'A4' = 'TERMICO'; // Por defecto térmico
  generarActive = true;
  visibleQR = false; 
  pathBase = environment.pathInterp; 

  @ViewChild('inputt') inputt!: ElementRef;

  constructor(
    private service: ProcessLotesService,
    private tpService: TipoPaquetesServiceService,
    private qrGenerator: QrGeneratorService
  ) {}

  ngOnInit(): void {
    this.cargarComponente();
  }

  private cargarComponente() {
    combineLatest({
      lotes: this.service.getLotes().valueChanges(),
      paquetes: this.service.getPaquetes().valueChanges(),
      tipos: this.tpService.getAll().valueChanges()
    }).pipe(take(1)).subscribe({
      next: ({ lotes, paquetes, tipos }) => {
        this.catTipoPaquete = tipos;
        this.procesarTablaPlana(lotes, paquetes);
      },
      error: (err) => console.error('Error al inicializar datos:', err)
    });
  }

  private procesarTablaPlana(lotes: any[], paquetes: any[]) {
    const listaTabla: HistorialTableModel[] = [];
    const lotesActivosIds = new Set(lotes.filter(l => l.activo === true || l.activo === 'true').map(l => l.lote));

    paquetes.forEach(paq => {
      const paqActivo = paq.activo === true || paq.activo === 'true';
      if (paqActivo && lotesActivosIds.has(paq.loteId)) {
        const runaCod: string[] = [];
        if (paq.consultados) {
          paq.consultados.forEach((r: any) => runaCod.push(r.runaId || Object.keys(r)[0]));
        }
        listaTabla.push({
          lote: paq.loteId,
          loteActivo: '',
          paquete: paq.codigo,
          tipoPaquete: paq.tipoPaquete,
          activo: '',
          creacion: paq.creacion,
          consultados: runaCod
        });
      }
    });

    listaTabla.sort((a, b) => new Date(b.creacion).getTime() - new Date(a.creacion).getTime());
    listaTabla.forEach(data => data.creacion = moment(data.creacion).format('DD-MM-YYYY hh:mm'));
    this.dataSource.data = listaTabla;
  }

  mapearSeleccionado(row: HistorialTableModel) {
    setTimeout(() => {
      if (this.selection.isSelected(row)) {
        if (!this.preseleccionados.some(p => p.paquete === row.paquete)) {
          this.preseleccionados.push(row);
        }
      } else {
        this.preseleccionados = this.preseleccionados.filter(p => p.paquete !== row.paquete);
      }
      this.generarActive = this.preseleccionados.length === 0;
    });
  }

  public async ordenarSeleccionados() {
    this.visibleQR = true;
    this.generarActive = true;

    if (this.preseleccionados.length > 0) {
      if (this.formatoImpresion === 'TERMICO') {
        await this.generarPdfTermico();
      } else {
        await this.generarPdfPlanillaA4();
      }
    } else {
      this.limpiarInterfaz();
    }
  }

  /**
   * MOTOR A: TÉRMICO (1 QR por mini etiqueta autoadherible de 5x5 cm)
   */
  private async generarPdfTermico() {
    const ptsPorMm = 2.83465;
    const size = 50 * ptsPorMm;

    const doc = new jsPDF({
      orientation: 'p',
      unit: 'pt',
      format: [size, size]
    });

    let esPrimeraPagina = true;

    for (const seleccionado of this.preseleccionados) {
      const itemData = this.dataSource.data.find(d => d.paquete === seleccionado.paquete);
      if (!itemData || !itemData.consultados) continue;
      let punto = '.';

      for (const runaCode of itemData.consultados) {
        
        if (!esPrimeraPagina) doc.addPage([size, size]);
        esPrimeraPagina = false;

        const urlAcortada = `${this.pathBase}${seleccionado.lote}${runaCode}${seleccionado.paquete}`;
        const qrDataUrl = await this.qrGenerator.generateQr({
          data: urlAcortada,
          runaCode: runaCode.substring(0,2)
        });

        let nombreRuna = Utils.getNombreRuna(runaCode.substring(0,2)) + punto;
        
        const titulo = `${nombreRuna}`;

        doc.setFontSize(7);
        doc.setFont('Helvetica', 'bold');
        doc.text(`${titulo}`, size / 2, 12, { align: 'center' });

        const qrSize = 100;
        doc.addImage(qrDataUrl, 'PNG', (size - qrSize) / 2, 18, qrSize, qrSize, undefined, 'FAST');

        doc.setFontSize(6);
        doc.setFont('Helvetica', 'normal');
        doc.text(`Escanea para tu interpretación${punto}`, size / 2, size - 15, { align: 'center' });
        doc.text(`Encuentranos en ${environment.path}${punto}`, size / 2, size - 6, { align: 'center' });
        punto = '';
      } 
    }

    doc.save(this.generarNombreDocumento());
    this.limpiarInterfaz();
  }

  /**
   * MOTOR B: PLANILLA A4 / CARTA (Organiza múltiples códigos en filas y columnas con guías de corte)
   */
  private async generarPdfPlanillaA4() {
    // Configuración estándar A4 en puntos (595.28 x 841.89)
    const doc = new jsPDF('p', 'pt', 'a4');
    
    // Dimensiones de la cuadrícula de etiquetas (60x60 puntos apróx 2.1x2.1 cm cada cuadro)
    const boxWidth = 100;
    const boxHeight = 115;
    const marginX = 18; // Margen izquierdo inicial
    const marginY = 25; // Margen superior inicial
    const gapX = 15;    // Separación horizontal entre etiquetas
    const gapY = 20;    // Separación vertical entre etiquetas
    
    const maxCols = 5;  // 5 etiquetas por fila
    const maxRows = 6;  // 6 filas por página (30 etiquetas por hoja)

    let currentCol = 0;
    let currentRow = 0;
    let esPrimeraPagina = true;

    for (const seleccionado of this.preseleccionados) {
      const itemData = this.dataSource.data.find(d => d.paquete === seleccionado.paquete);
      if (!itemData || !itemData.consultados) continue;
      let punto = '.';

      for (const runaCode of itemData.consultados) {
        
        // Si se llena la hoja actual, añadimos una nueva página y reseteamos coordenadas
        if (currentRow >= maxRows) {
          doc.addPage();
          currentRow = 0;
          currentCol = 0;
        }

        // Calcular coordenadas X e Y exactas en la hoja para la etiqueta actual
        const x = marginX + (currentCol * (boxWidth + gapX));
        const y = marginY + (currentRow * (boxHeight + gapY));

        // Dibujar un pequeño recuadro gris tenue que sirva como guía de corte para el cliente
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.5);
        doc.rect(x, y, boxWidth, boxHeight);

        // Generar QR nativo
        const urlAcortada = `${this.pathBase}${seleccionado.lote}${runaCode}${seleccionado.paquete}`;
        const qrDataUrl = await this.qrGenerator.generateQr({
          data: urlAcortada,
          runaCode: runaCode.substring(0,2)
        });
        const nombreRuna = Utils.getNombreRuna(runaCode.substring(0,2)) + punto;

        // Pintar elementos dentro del recuadro
        doc.setFontSize(6);
        doc.setFont('Helvetica', 'bold');
        doc.text(`La Runa Dulce${punto}`, x + (boxWidth / 2), y + 10, { align: 'center' });

        // QR
        doc.addImage(qrDataUrl, 'PNG', x + 5, y + 12, boxWidth - 10, boxWidth - 10, undefined, 'FAST');

        // Identificadores de pie de etiqueta
        doc.setFontSize(5);
        doc.setFont('Helvetica', 'normal');
        doc.text(`Obten tu consejo de ${nombreRuna}${punto}`, x + (boxWidth / 2), y + boxHeight - 9, { align: 'center' });
        doc.text(`Escanea para tu interpretación${punto}`, x + (boxWidth / 2), y + boxHeight - 3, { align: 'center' });        
        punto = '';

        // Avanzar a la siguiente columna
        currentCol++;
        if (currentCol >= maxCols) {
          currentCol = 0;
          currentRow++;
        }
      }
    }

    doc.save(this.generarNombreDocumento());
    this.limpiarInterfaz();
  }

  private limpiarInterfaz() {
    this.preseleccionados = [];
    this.visibleQR = false;
    this.selection.clear();
    if (this.inputt) this.inputt.nativeElement.value = '';
    this.cargarComponente();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  generarNombreDocumento(): string {
    let folio = Utils.generateFolio().substring(0, 5);
    let date = moment().format('DDMMYYYY');
    return `lrd${date}${folio}.pdf`;
  }
}