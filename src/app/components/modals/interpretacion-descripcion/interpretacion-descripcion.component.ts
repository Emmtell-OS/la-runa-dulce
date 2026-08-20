import { InterpretacionModel } from './../../../models/InterpretacionModel';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { InterpretacionesServiceService } from './../../../service/interpretaciones-service.service';
import { Component, Inject, OnInit, inject } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'interpretacion-descripcion',
  templateUrl: './interpretacion-descripcion.component.html',
  styleUrl: './interpretacion-descripcion.component.scss'
})
export class InterpretacionDescripcionComponent implements OnInit{

  readonly dialogRef = inject(MatDialogRef<InterpretacionDescripcionComponent>);
  miTextoControl = new FormControl('');

  _data: any;
  accion: any;
  imgRuna: any;
  tipoRuna: any;
  nombreRuna: any;
  interpRuna: any;
  indice: any;
  rutaImagenesRunas = './assets/img/runas/';
  interpretacion = '';
  registroInterpretacion: InterpretacionModel;
  mostrarEditar = false;
  mostrarEliminar = false;
  mostrarBotonEliminar = false;
  mostrarConfirmarEliminar = false;

  constructor(
    private service: InterpretacionesServiceService,
    @Inject(MAT_DIALOG_DATA) public data: any // Aquí recibimos el { idPaquete, lote } que enviamos
  ) { 
    this._data = data
  }

  ngOnInit(): void {
    this.obtenerInterpretacion(this._data['codigo'])

    let consecutivo = parseInt(this._data['consecutivo']) + 1;
    this.indice = this._data['consecutivo'];
    this.imgRuna = this._data['img'];
    this.tipoRuna = this._data['tipo'];
    this.nombreRuna = this._data['runa'];
    this.interpRuna = 'Esta es la primer interpretacion';
    this.interpretacion = this._data['interp'];

    if (this.interpretacion === '') {
      this.editarInterp();
    } else {
      this.interpRuna = 'Esta es la interpretacion ' + consecutivo;
      this.mostrarBotonEliminar = true;
    }
  }

  obtenerInterpretacion(tipo: string) {
    this.service.getTipo(tipo).valueChanges().subscribe((intp: InterpretacionModel) => {
      if (intp) {
        this.registroInterpretacion = intp;
        this.definirAccion();
      }
    });
  }

  definirAccion() {
    if(this.registroInterpretacion[1].length === 1 
      && this.registroInterpretacion[1][0] === 'vacio' 
      || this.registroInterpretacion[1][0] === '') {
        this.accion = "primera";
    }

    if(this.registroInterpretacion[1].length >= 1
        && this.interpretacion === ''
        && this.registroInterpretacion[1][0] !== 'vacio'
        && this.registroInterpretacion[1][0] !== '') {
          this.accion = "nueva";
    }

    if(this.registroInterpretacion[1].length >= 1
      && this.interpretacion !== '') {
        this.accion = "editar";
    }
  }

  save() {
    this.interpretacion = this.miTextoControl.value;
    this.mostrarEditar = false
    switch (this.accion) {
      case 'primera':
        this.registroInterpretacion[1][0] = this.interpretacion;
      break;
      case 'nueva':
        this.registroInterpretacion[1].push(this.interpretacion);
      break;
      case 'editar':
        this.registroInterpretacion[1][this.indice] = this.interpretacion;
      break;
    }

    this.service.update(this.registroInterpretacion[0], this.registroInterpretacion[1]);

    if (this.accion === 'primera') {
      this.dialogRef.close();
    }

    this.mostrarBotonEliminar = true;
  }

  editarInterp() {
    this.miTextoControl.setValue(this.interpretacion);
    this.mostrarEditar = true;
  }

  showEliminar() {
    this.mostrarEliminar = true;
  }

  evaluarCadena(texto: string): void {
    if(texto.trim().toLowerCase() === this.nombreRuna.split(" ")[0].toLowerCase()) {
      this.mostrarConfirmarEliminar = true;
    }
  }

  eliminar() {
    if(this.registroInterpretacion[1].length === 1) {
      this.registroInterpretacion[1].pop(this.interpretacion);
      this.registroInterpretacion[1].push("");
    } else {
      this.registroInterpretacion[1].pop(this.interpretacion);
    }
    this.service.update(this.registroInterpretacion[0], this.registroInterpretacion[1]);
    this.dialogRef.close();
  }
}
