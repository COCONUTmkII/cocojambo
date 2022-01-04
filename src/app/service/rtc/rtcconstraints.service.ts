import { ElementRef, Injectable } from '@angular/core';
import { SignalingDataService } from "../signaling/signaling-data.service";
import {Subject} from "rxjs";
import {Message} from "../signaling/message";

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

  public RTCTrackEventSubject: Subject<RTCTrackEvent> = new Subject<RTCTrackEvent>();
  public localVideoSubject: Subject<MediaStream> = new Subject<MediaStream>();
  public isCallExists: boolean = false;

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

  public async call(): Promise<void> {
    this.isCallExists = true;
    this.createPeerConnection();
    this.basicStream?.getTracks().forEach(track => this.peerConnection?.addTrack(track, <MediaStream>this.basicStream));
    try {
      const offer = await this.peerConnection?.createOffer(offerOptions);
      await this.peerConnection?.setLocalDescription(offer);
      this.signalingService.sendMessage({type: 'offer', data: offer});
    } catch (error) {
      this.handleGetUserMediaError(error);
    }
  }

  public hangUp(): void {
    this.signalingService.sendMessage({type: "hangup", data: ""})
    this.closeVideoCall();
  }

  private createPeerConnection(): void {
    this.peerConnection = new RTCPeerConnection({
      iceServers: [
        {
          urls: ['stun:stun.kudenserver.de:3478']
        }
      ]
    });
    this.peerConnection.onicecandidate = this.handleICECandidateEvent;
    this.peerConnection.oniceconnectionstatechange = this.handleICEConnectionStateChangeEvent;
    this.peerConnection.onsignalingstatechange = this.handleSignalingStateEvent;
    this.peerConnection.ontrack = this.createTrackEventHandler;
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

  private createTrackEventHandler (event: RTCTrackEvent) {
    this.RTCTrackEventSubject.next(event);
  }

  public addIncomingMessagesHandler() {
    this.signalingService.connect();
    this.signalingService.message.subscribe({
      next: msg => {
        switch (msg.type) {
          case "offer":
            this.handleOfferMessage(msg.data);
            break;
          case "answer":
            this.handleAnswerMessage(msg.data);
            break;
          case "hangup":
            this.handleHangupMessage(msg);
            break;
          case "ice-candidate":
            this.handleICECandidateMessageHandler(msg.data);
            break;
          default:
            console.log("unknown message of type " + msg.type);
        }
      },
      error: err => console.log(err),
    });
  }

  private handleOfferMessage(message: RTCSessionDescriptionInit): void {
    if (!this.peerConnection) {
      this.createPeerConnection();
    }
    if (!this.isCallExists) {
      this.continueVideoCall();
    }
    this.peerConnection?.setRemoteDescription(new RTCSessionDescription(message))
      .then(() => {
        this.localVideoSubject.next(<MediaStream>this.basicStream);
        this.basicStream?.getTracks().forEach(track => this.peerConnection?.addTrack(track, <MediaStream>this.basicStream));
      }).then(() => {
        return this.peerConnection?.createAnswer();
    }).then((answer) => {
      return this.peerConnection?.setLocalDescription(answer);
    }).then(() => {
      this.signalingService.sendMessage({type: "answer", data: this.peerConnection?.localDescription});
    }).catch(this.handleGetUserMediaError);
  }

  private handleAnswerMessage(data: RTCSessionDescriptionInit): void {
    this.peerConnection?.setRemoteDescription(data);
  }

  private handleHangupMessage(message: Message) {
    this.closeVideoCall();
  }

  private handleICECandidateMessageHandler(ice: RTCIceCandidateInit | RTCIceCandidate) {
    this.peerConnection?.addIceCandidate(ice).catch(this.reportError)
  }

  private reportError = (e: Error) => {
    console.log('error ' + e.name);
    console.log(e);
  }
}
