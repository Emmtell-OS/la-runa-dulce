import { TestBed } from '@angular/core/testing';

import { ProcessLotesService } from './process-lotes.service';

describe('ProcessLotesService', () => {
  let service: ProcessLotesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProcessLotesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
