import { TestBed } from '@angular/core/testing';

import { RTCConstraintsService } from './rtcconstraints.service';

describe('RTCConstraintsService', () => {
  let service: RTCConstraintsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RTCConstraintsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
