import { TestBed } from '@angular/core/testing';

import { PuntosVentaService } from './puntos-venta.service';

describe('PuntosVentaService', () => {
  let service: PuntosVentaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PuntosVentaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
