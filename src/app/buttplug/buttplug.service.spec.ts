import {TestBed} from '@angular/core/testing';

import {ButtplugService} from './buttplug.service';

describe('ButtplugService', () => {
  let service: ButtplugService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ButtplugService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
