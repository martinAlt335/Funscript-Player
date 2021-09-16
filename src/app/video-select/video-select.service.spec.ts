import { TestBed } from '@angular/core/testing';

import { VideoSelectService } from './video-select.service';

describe('VideoSelectService', () => {
  let service: VideoSelectService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VideoSelectService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
