import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/compat/database';
import { TiposPaqueteModel } from '../models/TiposPaqueteModel';

@Injectable({
  providedIn: 'root'
})
export class TipoPaquetesServiceService {

  private dbPath = '/configuracion';
  dataConfig: AngularFireList<any>;

  constructor(private db: AngularFireDatabase) {
    this.dataConfig = db.list(this.dbPath);
  }


  getAll(): AngularFireList<any> {
    return this.db.list(this.dbPath + '/tipoPaquetes');
  }

  getTipo(idTP: string): any {
    return this.db.list(this.dbPath + '/tipoPaquetes/' + idTP);
  }

  create(idConf:string, lote: any): any {
    return this.dataConfig.set(idConf, lote);
  }

  update(idConf:string, lote: any): any {
    return this.dataConfig.set(idConf, lote);
  }

  delete(idConf:string): any {
    return this.db.list(this.dbPath).remove(idConf);
  }
}
