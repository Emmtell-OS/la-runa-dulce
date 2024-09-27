import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/compat/database';
import { TemasModel } from '../models/TemasModel';

@Injectable({
  providedIn: 'root'
})
export class TemaService {

  private dbPath = '/configuracion/tema';
  dataConfig: AngularFireList<any>;

  constructor(private db: AngularFireDatabase) {
    this.dataConfig = db.list(this.dbPath);
  }


  getAll(): any {
    return this.db.list(this.dbPath);
  }

  create(idTema: string, tema: TemasModel): any {
    return this.dataConfig.set(idTema, tema);
  }

  update(idConf:string, lote: any): any {
    return this.dataConfig.set(idConf, lote);
  }

  delete(idTema:string): any {
    return this.db.list(this.dbPath).remove(idTema);
  }
}
