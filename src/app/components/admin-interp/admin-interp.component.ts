import { Component, inject } from '@angular/core';
import { InterpretacionesServiceService } from '../../service/interpretaciones-service.service';
import Utils from '../../utilities/utils';
import { MatDialog } from '@angular/material/dialog';
import { InterpretacionDescripcionComponent } from '../modals/interpretacion-descripcion/interpretacion-descripcion.component';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'admin-interp',
  templateUrl: './admin-interp.component.html',
  styleUrl: './admin-interp.component.scss'
})
export class AdminInterpComponent {

  catInterpData: any[] = [];
  interpCardList: any[] = [];
  rutaImagenesRunas = './assets/img/runas/';
  mostrarGrid = false;
  mostrarInterpVacia = false;
  imgRunaGrid: any;
  nombreRunaGrid: any;
  interpRunaGrid: any;
  tipoRunaGrid: any;
  codigoRunaGrid: any;
  interpretacionesList: any[] = [];
  interpCardListOriginal: any[] = [];
  interpCardListOrdenada: any[] = [];

  readonly dialog = inject(MatDialog);

  constructor(private service: InterpretacionesServiceService) {    
    this.getCatInterpretaciones();
  }

  // 1. Convertimos el Observable a Promesa esperable con firstValueFrom
  async getCatInterpretaciones(): Promise<void> {
    const catInterpretaciones = await firstValueFrom(this.service.getAll().valueChanges());
    if (catInterpretaciones) {
      this.catInterpData = catInterpretaciones;
      this.renderizarCards();
    }
  }

  // 2. Método sincrónico para armar la lista de tarjetas
  renderizarCards(): void {
    this.interpCardList = []; // Limpiamos para evitar duplicados
    this.catInterpData.forEach((interp: any) => {
      const key = interp.claveRuna;
      const runa = Utils.getNombreRuna(key.substring(0, 2));
      const tipo = key.substring(2, 4);
      const size = (interp.interpretaciones[0] === '') ? 0 : interp.interpretaciones.length;
      
      this.interpCardList.push({
        "nombre": (tipo === '00') ? runa + ' INVERTIDA' : runa + ' DIRECTA',
        "imagen": this.rutaImagenesRunas + key.substring(0, 2) + ".png",
        "tipo": (tipo === '00') ? 'invertida' : '',
        "interpretacionesList": interp.interpretaciones,
        "interpretacionesSize": size + " Interpretaciones",
        "codigoRuna": interp.claveRuna
      });
    });
    this.interpCardListOriginal = [...this.interpCardList];
    this.interpCardListOrdenada = [...this.interpCardList];
  }

  filtroRunas(termino: string): void {
    this.ordenar('nombre-desc');
    // Si el parámetro viene vacío, restablecemos la lista original completa
    if (!termino || termino.trim() === '') {
      this.interpCardList = [...this.interpCardListOriginal];
      return;
    }
  
    const busqueda = termino.toLowerCase().trim();
  
    // Búsqueda por coincidencias en nombre, código de runa o dentro del texto de las interpretaciones
    this.interpCardList = this.interpCardListOriginal.filter(item => {
      const coincideNombre = item.nombre.toLowerCase().includes(busqueda);
      const coincideCodigo = item.codigoRuna.toLowerCase().includes(busqueda);
  
      return coincideNombre || coincideCodigo;
    });
  }

  ordenar(criterio: string): void {
    switch (criterio) {
      case 'na': // Nombre ASC
        this.interpCardListOrdenada = [...this.interpCardListOriginal].sort((a, b) =>
          a.nombre.localeCompare(b.nombre)
        );
        break;
  
      case 'nd': // Nombre DESC
        this.interpCardListOrdenada = [...this.interpCardListOriginal].sort((a, b) =>
          b.nombre.localeCompare(a.nombre)
        );
        break;
  
      case 'ia': // Interpretación ASC
        this.interpCardListOrdenada = [...this.interpCardListOriginal].sort((a, b) => {
          const numA = parseInt(a.interpretacionesSize, 10) || 0;
          const numB = parseInt(b.interpretacionesSize, 10) || 0;
          return numA - numB;
        });
        break;
  
      case 'id': // Interpretación DESC
        this.interpCardListOrdenada = [...this.interpCardListOriginal].sort((a, b) => {
          const numA = parseInt(a.interpretacionesSize, 10) || 0;
          const numB = parseInt(b.interpretacionesSize, 10) || 0;
          return numB - numA;
        });
        break;
  
      case 'd': // Default
      default:
        this.interpCardListOrdenada = [...this.interpCardListOriginal];
        break;
    }
  
    // Actualizamos la lista vinculada a la plantilla
    this.interpCardList = [...this.interpCardListOrdenada];
  }

  show(runa: any) {
    this.imgRunaGrid = runa['imagen'];
    this.nombreRunaGrid = runa['nombre'];
    this.interpRunaGrid = runa['interpretacionesSize'];
    this.tipoRunaGrid = runa['tipo'];
    this.codigoRunaGrid = runa['codigoRuna'];
    
    // Limpiamos la lista previa para no encadenar elementos anteriores
    this.interpretacionesList = [];

    if (runa['interpretacionesList'][0] === '') {
      this.interpRunaGrid = 0 + " Interpretaciones";
      this.mostrarInterpVacia = true;
    } else {
      this.mostrarInterpVacia = false;
      runa['interpretacionesList'].forEach((int: any, index: number) => {
        this.interpretacionesList.push({
          "indice": index + 1,
          "interp": int
        });
      });
    }
    this.mostrarGrid = true;
  }

  abrirDiaogInterpretacion(interp: any) {
    let dataInterp: any;
    if (interp === null) {
      dataInterp = {
        "consecutivo": this.interpRunaGrid.split(' ')[0],
        "runa": this.nombreRunaGrid,
        "codigo": this.codigoRunaGrid,
        "img": this.imgRunaGrid,
        "interp": "",
        "tipo": this.tipoRunaGrid
      };
    } else {
      dataInterp = {
        "consecutivo": interp['indice'] - 1,
        "runa": this.nombreRunaGrid,
        "codigo": this.codigoRunaGrid,
        "img": this.imgRunaGrid,
        "interp": interp['interp'],
        "tipo": this.tipoRunaGrid
      };
    }

    const dialogRef = this.dialog.open(InterpretacionDescripcionComponent, {
      data: dataInterp,
      panelClass: 'modal-responsive',
      width: '95vw',
      maxWidth: '95vw',
      height: 'auto',
      maxHeight: '99vh'
    });

    dialogRef.afterClosed().subscribe(() => {
      this.reiniciar();
    });
  }

  // 3. Reiniciar secuencial y seguro
  async reiniciar() {
    // A) Reseteo de estados
    this.catInterpData = [];
    this.interpCardList = [];
    this.interpretacionesList = [];
    this.mostrarInterpVacia = false;

    // B) Esperamos REALMENTE a que traiga la información de Firebase
    await this.getCatInterpretaciones();

    // C) Si tenemos seleccionada una runa activa en el grid, refrescamos su vista
    if (this.codigoRunaGrid) {
      const runaSeleccionada = this.interpCardList.find(item => item.codigoRuna === this.codigoRunaGrid);
      if (runaSeleccionada) {
        this.show(runaSeleccionada);
      }
    }
  }

}
