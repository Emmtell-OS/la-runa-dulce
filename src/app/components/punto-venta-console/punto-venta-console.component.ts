import { Component, ViewChild, inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTable } from '@angular/material/table';
import moment from 'moment';
import { PuntosVentaModel } from '../../models/PuntosVentaModel';
import { PuntosVentaService } from '../../service/puntos-venta.service';
import Utils from '../../utilities/utils';
import { DetallesPuntoVentaComponent } from '../modals/detalles-punto-venta/detalles-punto-venta.component';
import { EliminarComponent } from '../modals/eliminar/eliminar.component';

@Component({
  selector: 'puntoventa',
  templateUrl: './punto-venta-console.component.html',
  styleUrl: './punto-venta-console.component.scss'
})
export class PuntoVentaConsoleComponent {

  formularioPuntoVenta: FormGroup;
  puntoVenta: PuntosVentaModel;
  readonly dialog = inject(MatDialog);
  displayedPVColumns = ['comercio', 'representante', 'negocio', 'estatus', 'actions'];
  datasourcePV: any;
  catPV: PuntosVentaModel[] = [];
  isEdit: boolean;
  editId: string

  @ViewChild(MatTable) tablePuntoVenta!: MatTable<PuntosVentaModel>;

  constructor(private servicePuntoVenta: PuntosVentaService) {
    this.formularioPuntoVenta = new FormGroup({
      nombreComercial: new FormControl('', Validators.required),
      representante: new FormControl('', Validators.required),
      negocio: new FormControl('', Validators.required),
      direccion: new FormControl('', Validators.required),
      telefono: new FormControl(''),
      contacto: new FormControl(''),
      urlMaps: new FormControl('', Validators.required)
    });
    this.getRegistroPuntoVenta(true);
  }

  private async getRegistroPuntoVenta(ft: boolean) {
    /**conexión y consumo de Firebase */
    this.catPV.splice(0, this.catPV.length);
    this.datasourcePV = [];
    await this.obtenerFirebaseDataTema().then((data: any) => {
      this.catPV = data;
    });

    this.datasourcePV = this.catPV.sort((a, b) => a.nombreComercial.localeCompare(b.nombreComercial, 'en', { numeric: true }));
    if(!ft) {
      this.tablePuntoVenta.renderRows();
    }
  }

  private obtenerFirebaseDataTema() {
    return new Promise((resolve, reject) => {
      this.servicePuntoVenta.getAll().valueChanges().subscribe(val => {
        resolve(val);
      })
    });
  }

  registrar(editMode: boolean) {
    let id: string;
    let activo: boolean;
    let creacion: string;
    if(editMode){
      activo = this.catPV.find((pv) => pv.id === this.editId).activo;
      id = this.editId;
      creacion = this.catPV.find((pv) => pv.id === this.editId).creacion;
    } else {
      id = this.generateFolio().toString();
      activo = false;
      creacion = moment().format();
    }
    
    this.puntoVenta = {
      nombreComercial: this.formularioPuntoVenta.value['nombreComercial'],
      representante: this.formularioPuntoVenta.value['representante'],
      negocio: this.formularioPuntoVenta.value['negocio'],
      direccion: this.formularioPuntoVenta.value['direccion'],
      telefono: this.validarVacio(this.formularioPuntoVenta.value['telefono']),
      contacto: this.validarVacio(this.formularioPuntoVenta.value['contacto']),
      urlMaps: this.formularioPuntoVenta.value['urlMaps'],
      id: id,
      activo: activo,
      creacion: creacion,
    }
    this.servicePuntoVenta.create(id, this.puntoVenta);
    this.formularioPuntoVenta.reset();
    this.getRegistroPuntoVenta(false);
  }

  validarVacio(value: string): string {
    if (value === '') {
      return '-';
    }
    return value;
  }

  private generateFolio(): String {
    let indice: string = '';

    for (let i = 1; i <= 10; i++) {
      let rand = Utils.getRand(48, 122); //this.getRand(122, 48);
      while ((rand > 90 && rand < 97) || (rand > 57 && rand < 65)) {
        rand = Utils.getRand(48, 122); //this.getRand(122, 48);
      }
      indice = indice + String.fromCharCode(rand);
    }

    return indice;
  }

  editar(element: PuntosVentaModel) {
    this.isEdit = true
    this.editId = element.id
    this.formularioPuntoVenta.setValue({
      nombreComercial: element.nombreComercial,
      representante: element.representante,
      negocio: element.negocio,
      direccion: element.direccion,
      telefono: element.telefono,
      contacto: element.contacto,
      urlMaps: element.urlMaps
    });
  }

  mostrarDesactivarPV(element: PuntosVentaModel) {
    let paq = `${element.nombreComercial}`
    const dialogRef = this.dialog.open(EliminarComponent, {
      data: {
        seccion: (element['activo']) ? 'desPV' : 'actPV', 
        values: paq
      },
      width: '450px',
      height:'170px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.desactivarPV(element);
      } else {
        this.getRegistroPuntoVenta(false);
      }
    });
  }

  desactivarPV(element: PuntosVentaModel) {
    let pvToUpdate = this.catPV.find((pv) => pv.id === element.id);
    pvToUpdate.activo = (pvToUpdate.activo) ? false : true;
    this.servicePuntoVenta.update(element.id, pvToUpdate);
    this.getRegistroPuntoVenta(false);
  }

  mostrarEliminarPV(element: PuntosVentaModel) {
    let paq = `${element.nombreComercial}`
    const dialogRef = this.dialog.open(EliminarComponent, {
      data: {
        seccion: 'delPV', 
        values: paq
      },
      width: '450px',
      height:'170px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.eliminarPV(element);
      }
    });
  }

  eliminarPV(element: PuntosVentaModel) {
    this.servicePuntoVenta.delete(element.id);
    this.getRegistroPuntoVenta(false);
  }

  mostrarDetalles(element: PuntosVentaModel) {
    const dialogRef = this.dialog.open(DetallesPuntoVentaComponent, {
      data: element,
      width: '70%'
    });
  }
}
