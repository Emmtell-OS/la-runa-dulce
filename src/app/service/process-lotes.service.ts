import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/compat/database';

@Injectable({
  providedIn: 'root'
})
export class ProcessLotesService {

  private dbPath = '/dataJsonLP';
  dataLP: AngularFireList<any>;

  constructor(private db: AngularFireDatabase) {
    this.dataLP = db.list(this.dbPath);
  }


  getAll(): AngularFireList<any> {
    return this.dataLP;
  }

  create(idLote:string, lote: any): any {
    return this.dataLP.set(idLote, lote);
  }

  update(idLote:string, lote: any): any {
    return this.dataLP.set(idLote, lote);
  }

  delete(idLote:string): any {
    return this.db.list(this.dbPath).remove(idLote);
  }
}
