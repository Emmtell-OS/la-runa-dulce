import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/compat/database';

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

  create(tema: string): any {
    return this.dataConfig.set('tema', tema);
  }

  update(idConf:string, lote: any): any {
    return this.dataConfig.set(idConf, lote);
  }

  delete(idConf:string): any {
    return this.db.list(this.dbPath).remove(idConf);
  }
}
