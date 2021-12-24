import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import {RTCConstraintsService} from "../../service/rtcconstraints.service";

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss']
})
export class MainPageComponent implements AfterViewInit {
  @ViewChild('local_video') private localVideo!: ElementRef;

  constructor(private rtc: RTCConstraintsService) { }

  private initMediaStream(){
    this.rtc.requestMediaDevices().then(r => this.localVideo.nativeElement.srcObject = r);
  }

  ngAfterViewInit(): void {
    this.initMediaStream();
  }

  public continueVideo() {
    this.rtc.continueVideoCall();
  }

  public pauseVideo() {
    this.rtc.pauseVideoCall();
  }
}
