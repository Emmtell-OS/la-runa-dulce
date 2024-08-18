import { PaqueteModel } from "./PaqueteModel";


export interface LoteModel {
    
    lote: string;
    activo: boolean;
    creacion: string;
    paquetes: PaqueteModel[];

}