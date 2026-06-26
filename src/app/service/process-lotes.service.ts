import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/compat/database';
import { PaqueteModel } from '../models/PaqueteModel';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProcessLotesService {

  // Definimos los nuevos nodos planos
  private lotesPath = '/lotes';
  private paquetesPath = '/paquetes';

  private dbPath = '/dataJsonLP';
  dataLP: AngularFireList<any>;

  constructor(private db: AngularFireDatabase) {
    this.dataLP = db.list(this.dbPath);
  }

  /**
   * Obtiene la lista plana de todos los paquetes.
   * Al devolver AngularFireList, le permite al componente usar .valueChanges()
   */
  getPaquetes(): AngularFireList<any> {
    return this.db.list(this.paquetesPath);
  }

  /**
   * Obtiene la lista plana de todos los lotes (metadatos)
   */
  getLotes(): AngularFireList<any> {
    return this.db.list(this.lotesPath);
  }

  /**
   * REGISTRO ATÓMICO (Multi-path update):
   * Guarda el paquete e inicializa su lote en una sola operación sin descargar nada.
   */
  async registrarPaquete(paquete: PaqueteModel, loteId: string): Promise<void> {
    const updates: any = {};

    // 1. Guardamos el paquete en su propio nodo independiente con la referencia del lote
    updates[`${this.paquetesPath}/${paquete.codigo}`] = {
      ...paquete,
      loteId: loteId
    };

    // 2. Creamos o actualizamos los metadatos del lote
    updates[`${this.lotesPath}/${loteId}/activo`] = true;
    updates[`${this.lotesPath}/${loteId}/lote`] = loteId;
    updates[`${this.lotesPath}/${loteId}/ultimaModificacion`] = paquete.creacion;

    // Ejecutamos la actualización simultánea en el root de la base de datos
    return this.db.database.ref().update(updates);
  }

  /**
   * ACTUALIZACIÓN DE ESTATUS INDEPENDIENTE:
   * Cambia el estado de un paquete directamente usando su ID (código QR)
   */
  updateEstatusProduccion(paqueteId: string, nuevoEstatus: string): Promise<void> {
    return this.db.object(`${this.paquetesPath}/${paqueteId}`).update({
      estatusProduccion: nuevoEstatus
    });
  }

  /**
   * ACTUALIZACIÓN DE ESTATUS ACTIVO:
   * Cambia el estado activo de un paquete directamente usando su ID (código QR)
   */
  updatePaqueteEstatusActivo(paqueteId: string, nuevoEstatus: string): Promise<void> {
    return this.db.object(`${this.paquetesPath}/${paqueteId}`).update({
      activo: nuevoEstatus
    });
  }

  /**
   * ACTUALIZACIÓN DE ESTATUS ACTIVO:
   * Cambia el estado activo de un lote directamente usando su ID (código QR)
   */
  updateLoteEstatusActivo(loteId: string, nuevoEstatus: string): Promise<void> {
    return this.db.object(`${this.lotesPath}/${loteId}`).update({
      activo: nuevoEstatus
    });
  }

  /**
   * CONSULTA DIRECTA DE UN UNICO PAQUETE:
   * Trae los datos de un paquete en específico usando su ID (código QR) en tiempo real.
   */
  getPaqueteByCodi(paqueteId: string): Observable<any> {
    return this.db.object(`${this.paquetesPath}/${paqueteId}`).valueChanges();
  }

  /**
   * ELIMINAR UN PAQUETE INDIVIDUAL:
   * Borra el paquete directamente usando su ID (código QR).
   */
  deletePaquete(paqueteId: string): Promise<void> {
    return this.db.object(`${this.paquetesPath}/${paqueteId}`).remove();
  }

  /**
   * ELIMINAR UN LOTE (Y opcionalmente sus paquetes):
   * Borra el metadato del lote de forma directa.
   */
  deleteLote(loteId: string): Promise<void> {
    return this.db.object(`${this.lotesPath}/${loteId}`).remove();
  }

  /**
 * ELIMINACIÓN EN CASCADA COMPLETA (Atómica):
 * Borra el lote y todos los paquetes que le pertenecen en una sola operación en el servidor.
 */
  async deleteLoteCascada(loteId: string, paquetesDelLote: any[]): Promise<void> {
    const updates: any = {};
    
    updates[`${this.lotesPath}/${loteId}`] = null;

    paquetesDelLote.forEach(paquete => {
      if (paquete.loteId === loteId) {
        updates[`${this.paquetesPath}/${paquete.codigo}`] = null;
      }
    });

    return this.db.database.ref().update(updates);
  }

  // =========================================================================
  // --- MÉTODOS LEGACY (Compatibilidad con tu código actual) ---
  // =========================================================================

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
