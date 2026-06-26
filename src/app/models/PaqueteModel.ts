import { EmpaqueModel } from "./EmpaqueModel";

export interface PaqueteModel {

    codigo: string;
    activo: boolean;
    creacion: any;
    estatusProduccion: 'P' | 'EP' | 'T';
    tipoPaquete: string;
    loteId: string;
    consultados: EmpaqueModel[];

}