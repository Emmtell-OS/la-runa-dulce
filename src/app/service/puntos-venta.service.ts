import { Injectable } from '@angular/core';
import { AngularFireList, AngularFireDatabase } from '@angular/fire/compat/database';
import { PuntosVentaModel } from '../models/PuntosVentaModel';

@Injectable({
  providedIn: 'root'
})
export class PuntosVentaService {

  private dbPath = '/puntosVenta';
  dataPV: AngularFireList<any>;

  constructor(private db: AngularFireDatabase) {
    this.dataPV = db.list(this.dbPath);
  }

  getAll(): any {
    return this.db.list(this.dbPath);
  }

  create(idPv: string, body: PuntosVentaModel): any {
    return this.dataPV.set(idPv, body);
  }

  update(idPv:string, body: PuntosVentaModel): any {
    return this.dataPV.set(idPv, body);
  }

  delete(idPv:string): any {
    return this.db.list(this.dbPath).remove(idPv);
  }
}
