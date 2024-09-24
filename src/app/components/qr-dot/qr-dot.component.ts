import { ChangeDetectionStrategy, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import QRCodeStyling  from 'qr-code-styling';

@Component({
  selector: 'qr-styles-dot',
  templateUrl: './qr-dot.component.html',
  styleUrl: './qr-dot.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QrDotComponent implements OnInit{

  qrCode = null;

  @Input() path: string;
  @Input() img: string;
  @ViewChild('canvas', { static: true }) canvas: ElementRef;

  constructor() {
  }

  ngOnInit(): void {

    this.qrCode = new QRCodeStyling({
      width: 160,
      height: 160,
      type: 'canvas',
      data: this.path,
      image: this.img,
      margin: 4,
      qrOptions: {
        typeNumber: 0,
        mode: 'Byte',
        errorCorrectionLevel: 'L'
      },
      imageOptions: {
        hideBackgroundDots: false,
        imageSize: 10,
      },
      dotsOptions: {
        type: 'dots',
        color: "#2E2B2B",
      },
      cornersSquareOptions: {
        color: '#46B4646',
        type: 'extra-rounded',
      },
      cornersDotOptions: {
        color: '#46B4646',
        type: 'dot',
      },
      backgroundOptions: {
        color: '#ffffff',
      }
    });
    this.qrCode.append(this.canvas.nativeElement);

  }

}
