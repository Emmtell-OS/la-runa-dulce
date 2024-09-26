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

  constructor() {
    this.setMensaje();
  }

  private setMensaje() {
    switch(this.data.seccion) {
      case 'tipoPaquete':
        this.mensaje = `¿Deseas eliminar el tipo de paquete ${this.data.values['tipoPaquete']}?`;
    }
  }

  public cerrar() {
    this.dialogRef.close();
  }

}
