import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/compat/database';

@Injectable({
  providedIn: 'root'
})
export class InterpretacionesServiceService {

  private dbPath = '/configuracion';
  dataConfig: AngularFireList<any>;

  constructor(private db: AngularFireDatabase) {
    this.dataConfig = db.list(this.dbPath);
  }


  getAll(): AngularFireList<any> {
    return this.db.list(this.dbPath + '/interpretaciones/');
  }

  getTipo(idInterp: string): any {
    return this.db.list(this.dbPath + '/interpretaciones/' + idInterp);
  }

  create(idInterp:string, interpretacion: any): any {
    return this.db.list(this.dbPath + '/interpretaciones/').set(idInterp, interpretacion);
  }

  update(idInterp:string, interpretacion: any): any {
    return this.dataConfig.set(idInterp, interpretacion);
  }

  delete(idInterp:string): any {
    return this.db.list(this.dbPath).remove(idInterp);
  }

}
