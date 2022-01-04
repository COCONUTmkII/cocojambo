import {AfterViewInit, Component, ElementRef, OnDestroy, ViewChild} from '@angular/core';
import { RTCConstraintsService } from "../../service/rtc/rtcconstraints.service";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss']
})
export class MainPageComponent implements AfterViewInit, OnDestroy {
  @ViewChild('local_video') private localVideo!: ElementRef;
  @ViewChild('remote_video') private remoteVideo!: ElementRef;

  private remoteVideoSubscription?: Subscription;
  private localVideoSubscription?: Subscription;

  constructor(private rtc: RTCConstraintsService) { }

  private initMediaStream(){
    this.rtc.requestMediaDevices().then(r => this.localVideo.nativeElement.srcObject = r);
  }

  ngAfterViewInit(): void {
    this.rtc.addIncomingMessagesHandler();
    this.initMediaStream();
    this.remoteVideoSubscription = this.rtc.RTCTrackEventSubject.subscribe(value => this.remoteVideo.nativeElement.srcObject = value.streams[0]);
    this.localVideoSubscription = this.rtc.localVideoSubject.subscribe(value => this.localVideo.nativeElement.srcObject = value);
  }

  public continueVideo() {
    this.rtc.continueVideoCall();
    this.localVideo.nativeElement.srcObject = this.rtc.getBasicStream;
  }

  public pauseVideo() {
    this.rtc.pauseVideoCall();
    this.localVideo.nativeElement.srcObject = undefined;
  }

  ngOnDestroy(): void {
    this.remoteVideoSubscription?.unsubscribe();
  }

  public call() {
    this.rtc.call();
  }

  public hangUp() {
    this.rtc.hangUp();
  }
}
