import { Injectable } from '@angular/core';
import QRCodeStyling from 'qr-code-styling-node';
import { QrValoresConfig } from '../models/QrValoresConfig';

@Injectable({
  providedIn: 'root'
})
export class QrGeneratorService {

  // Color oficial de marca por defecto
  private readonly DEFAULT_COLOR = '#2B2118';

  /**
   * Genera el DataURL (PNG) de un QR personalizado.
   * Soporta runas, logos personalizados o QR limpios si no se pasa imagen.
   */
  async generateQr(options: QrValoresConfig): Promise<string> {
    const {
      data,
      runaCode,
      logoPathCustom,
      size = 300,
      dotsColor = this.DEFAULT_COLOR
    } = options;

    // Determinar la ruta de la imagen según los parámetros pasados
    let imagePath: string | undefined = undefined;
    if (logoPathCustom) {
      imagePath = logoPathCustom;
    } else if (runaCode) {
      imagePath = `assets/img/runas/${runaCode}.png`;
    }

    const qrCode = new QRCodeStyling({
      width: size,
      height: size,
      data: data,
      image: imagePath,
      margin: 2,
      qrOptions: {
        errorCorrectionLevel: 'H' // 30% de tolerancia a fallos
      },
      imageOptions: {
        hideBackgroundDots: false, //agrega un 'fondo' blanco a la imagen
        imageSize: 0.30,
        margin: 0 //si quieres añadir un 'fondo' blanco el valor debe ser 2 sino 0
      },
      dotsOptions: {
        color: dotsColor,
        type: 'rounded' // Puntos circulares
      },
      backgroundOptions: {
        color: '#FFFFFF'
      },
      cornersSquareOptions: {
        color: dotsColor,
        type: 'extra-rounded'
      },
      cornersDotOptions: {
        color: dotsColor,
        type: 'dot'
      }
    });

    try {
      const blob = await qrCode.getRawData('png');
      if (!blob) throw new Error('Blob nulo al generar el QR');
      
      return await this.blobToDataUrl(blob as Blob);
    } catch (error) {
      console.warn(`[QrGeneratorService] Error cargando logo/runa (${imagePath}). Generando QR sin logo.`, error);
      
      // FALLBACK ROBUSTO: Si la imagen/runa falla o no existe, genera el QR estilizado pero sin logo
      return this.generateFallbackQr(data, size, dotsColor);
    }
  }

  /**
   * Convierte un Blob a DataURL mediante FileReader (Promise)
   */
  private blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Genera el QR estilizado de respaldo si la imagen falla
   */
  private async generateFallbackQr(data: string, size: number, dotsColor: string): Promise<string> {
    const qrCode = new QRCodeStyling({
      width: size,
      height: size,
      data: data,
      margin: 2,
      qrOptions: { errorCorrectionLevel: 'M' },
      dotsOptions: { color: dotsColor, type: 'dots' },
      backgroundOptions: { color: '#FFFFFF' },
      cornersSquareOptions: { color: dotsColor, type: 'extra-rounded' },
      cornersDotOptions: { color: dotsColor, type: 'dot' }
    });

    const blob = await qrCode.getRawData('png');
    return this.blobToDataUrl(blob as Blob);
  }
}
