import { TestBed } from '@angular/core/testing';

import { TipoPaquetesServiceService } from './tipo-paquetes-service.service';

describe('TipoPaquetesServiceService', () => {
  let service: TipoPaquetesServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TipoPaquetesServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
