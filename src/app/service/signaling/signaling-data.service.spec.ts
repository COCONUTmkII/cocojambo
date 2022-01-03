import { TestBed } from '@angular/core/testing';

import { SignalingDataService } from './signaling-data.service';

describe('SignalingDataService', () => {
  let service: SignalingDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SignalingDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
