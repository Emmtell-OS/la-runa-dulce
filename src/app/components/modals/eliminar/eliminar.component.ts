import { Component, inject } from '@angular/core';
import { DialogEliminar } from '../../../models/DialogEliminar';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';

@Component({
  selector: 'app-eliminar',
  templateUrl: './eliminar.component.html',
  styleUrl: './eliminar.component.scss'
})
export class EliminarComponent {
  readonly dialogRef = inject(MatDialogRef<EliminarComponent>);
  readonly data = inject<DialogEliminar>(MAT_DIALOG_DATA);

  mensaje = ''
  confirmacion = false;
  isCerrar = true;
  isEliminar = true;

  constructor() {
    this.setMensaje();
  }

  private setMensaje() {
    switch(this.data.seccion) {
      case 'tipoPaquete':
        this.mensaje = `¿Deseas eliminar el tipo de paquete ${this.data.values['tipoPaquete']}?`;
        break;
      case 'tema':
        this.mensaje = `¿Quieres eliminar de forma permanente el tema ${this.data.values['tema']}?`
        break;
      case 'qr':
        this.mensaje = `No existe el Tipo Paquete ${this.data.values} en catálogo. No se genera este QR`
        this.isEliminar = false;
        break;
      case 'interpretacion':
        this.mensaje = `¿Deseas eliminar la interpretación ${this.data.values['numero']} de ${this.data.values['runa']} ?`;
        break;
      case 'desLote':
        this.mensaje = `¿Deseas desactivar el Lote ${this.data.values}?`
        this.isEliminar = false;
        this.confirmacion = true;
        break;
      case 'actLote':
        this.mensaje = `¿Deseas activar el Lote ${this.data.values}?`
        this.isEliminar = false;
        this.confirmacion = true;
        break;
      case 'delLote':
        this.mensaje = `¿Deseas eliminar de forma permanente el Lote ${this.data.values}?`
        this.isEliminar = true
        break;
      case 'desPaq':
        this.mensaje = `¿Deseas desactivar el Paquete ${this.data.values}?`
        this.isEliminar = false;
        this.confirmacion = true;
        break;
      case 'actPaq':
        this.mensaje = `¿Deseas activar el Paquete ${this.data.values}?`
        this.isEliminar = false;
        this.confirmacion = true;
        break;
      case 'delPaq':
        this.mensaje = `¿Deseas eliminar de forma permanente el Paquete ${this.data.values}?`
        this.isEliminar = true;
        break;
      case 'desPV':
        this.mensaje = `¿Deseas desactivar el Punto de Venta ${this.data.values}? NO se mostrará en el home`
        this.isEliminar = false;
        this.confirmacion = true;
        break;
      case 'actPV':
        this.mensaje = `¿Deseas activar el Punto de Venta ${this.data.values}? SE MOSTRARÁ en el home`
        this.isEliminar = false;
        this.confirmacion = true;
        break;
      case 'delPV':
        this.mensaje = `¿Deseas eliminar de forma permanente el Punto de Venta ${this.data.values}?`
        this.isEliminar = true;
        break;  
      default:
        this.mensaje = 'mensaje de prueba'
    }
  }

  public cerrar() {
    this.dialogRef.close();
  }

}
