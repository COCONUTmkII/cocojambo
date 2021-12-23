import { Injectable } from '@angular/core';

const constraints = {
  audio: true,
  video: {width: 780, height: 540},
}

@Injectable({
  providedIn: 'root'
})
export class RTCConstraintsService {
  private basicStream?: MediaStream;

  public async requestMediaDevices() {
    this.basicStream = await navigator.mediaDevices.getUserMedia(constraints);
    return this.basicStream;
  }

}
