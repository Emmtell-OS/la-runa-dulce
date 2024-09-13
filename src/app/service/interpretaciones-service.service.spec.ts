import { TestBed } from '@angular/core/testing';

import { InterpretacionesServiceService } from './interpretaciones-service.service';

describe('InterpretacionesServiceService', () => {
  let service: InterpretacionesServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InterpretacionesServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
