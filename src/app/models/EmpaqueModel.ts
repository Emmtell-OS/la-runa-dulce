export interface EmpaqueModel {
    runaId: string;           // Ejemplo: "PE00", "JE01"
    timestamp: string;        // Fecha de primer escaneo (vacío al inicio: "")
    consultas: number;        // Contador de escaneos
    interpretacionId: number;
}