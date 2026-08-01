export interface QrValoresConfig {
    data: string; //url
    runaCode?: string;
    logoPathCustom?: string; // Para cuando crees QR de otros módulos que usen íconos distintos
    size?: number;
    dotsColor?: string;
}