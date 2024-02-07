import { TestBed } from '@angular/core/testing';

import { StateControllerService } from './state-controller.service';

describe('StateControllerService', () => {
  let service: StateControllerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StateControllerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
