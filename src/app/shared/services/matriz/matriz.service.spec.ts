import { TestBed } from '@angular/core/testing';

import { MatrizService } from './matriz.service';

describe('MatrizService', () => {
  let service: MatrizService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MatrizService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
