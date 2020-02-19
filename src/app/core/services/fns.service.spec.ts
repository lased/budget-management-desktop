import { TestBed } from '@angular/core/testing';

import { FnsService } from './fns.service';

describe('FnsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FnsService = TestBed.get(FnsService);
    expect(service).toBeTruthy();
  });
});
