import { ElementRef, Injectable } from '@angular/core';
import { SignalingDataService } from "../signaling/signaling-data.service";

const constraints = {
  audio: true,
  video: { width: 780, height: 540 },
};

const offerOptions = {
  offerToReceiveAudio: true,
  offerToReceiveVideo: true,
};

@Injectable({
  providedIn: 'root'
})
export class RTCConstraintsService {
  private basicStream?: MediaStream;
  private peerConnection?: RTCPeerConnection;

  constructor(private signalingService: SignalingDataService) {
  }

  get getBasicStream(): MediaStream {
    return <MediaStream>this.basicStream;
  }

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

  private closeVideoCall() : void {
    if (this.peerConnection) {
      this.peerConnection.onicecandidate = null;
      this.peerConnection.onicegatheringstatechange = null;
      this.peerConnection.onsignalingstatechange = null;
      this.peerConnection.ontrack = null;
    }
    this.peerConnection?.getTransceivers().forEach(transceiver => transceiver.stop());
    this.peerConnection?.close();
    this.peerConnection = undefined;
  }

  public async call(element: ElementRef): Promise<void> {
    this.createPeerConnection(element);
    this.basicStream?.getTracks().forEach(track => this.peerConnection?.addTrack(track, <MediaStream>this.basicStream));
    try {
      const offer = await this.peerConnection?.createOffer(offerOptions);
      await this.peerConnection?.setLocalDescription(offer);
      this.signalingService.sendMessage({type: 'offer', data: offer});
    } catch (error) {
      this.handleGetUserMediaError(error);
    }
  }

  private createPeerConnection(element: ElementRef): void {
    this.peerConnection = new RTCPeerConnection({
      iceServers: [
        {
          urls: ['stun:kudenserver.de:3478']
        }
      ]
    });
    this.peerConnection.onicecandidate = this.handleICECandidateEvent;
    this.peerConnection.oniceconnectionstatechange = this.handleICEConnectionStateChangeEvent;
    this.peerConnection.onsignalingstatechange = this.handleSignalingStateEvent;
    this.peerConnection.ontrack = this.createTrackEventHandler(element);
  }

  private handleGetUserMediaError(error: any): void {
    switch (error.name) {
      case 'NotFoundError':
        alert('unable to open your call because no camera and/or mic were found');
        break;
      case 'SecurityError':
      case 'PermissionDeniedError':
        //Do nothing
        break;
      default:
        console.log(error);
        alert('Error opening your camera ' + error.getMessage());
    }
    this.closeVideoCall();
  }

  private handleICECandidateEvent = (event: RTCPeerConnectionIceEvent) => {
    console.log(event);
    if (event.candidate) {
      this.signalingService.sendMessage({
        type: 'ice-candidate',
        data: event.candidate,
      });
    }
  }

  private handleICEConnectionStateChangeEvent = (event: Event) => {
    console.log(event);
    switch (this.peerConnection?.iceConnectionState) {
      case "closed":
      case "failed":
      case "disconnected":
        this.closeVideoCall();
        break;
    }
  }

  private handleSignalingStateEvent = (event: Event) => {
    console.log(event);
    switch (this.peerConnection?.signalingState) {
      case "closed":
        this.closeVideoCall();
        break;
    }
  }

  //FIXME refactor this because this is bad implementation
  private createTrackEventHandler(element: ElementRef): (event: RTCTrackEvent) => void {
    return (event: RTCTrackEvent) => {
      element.nativeElement.srcObject = event.streams[0];
    };
  }

}
