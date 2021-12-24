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

  public async requestMediaDevices(): Promise<MediaStream> {
    this.basicStream = await navigator.mediaDevices.getUserMedia(constraints);
    return this.basicStream;
  }

  public pauseVideoCall(): void {
    this.basicStream?.getTracks().forEach(track => track.enabled = false);
  }

  public continueVideoCall(): void {
    this.basicStream?.getTracks().forEach(track => track.enabled = true);
  }
}
