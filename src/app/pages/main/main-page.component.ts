import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import {RTCConstraintsService} from "../../service/rtcconstraints.service";

const constraints = {
  audio: true,
  video: {width: 780, height: 540},
}
@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.scss']
})
export class MainPageComponent implements AfterViewInit {

  private localStream?: MediaStream;
  @ViewChild('local_video') private localVideo!: ElementRef;

  //TODO change implementation
  private async setSomething(): Promise<void> {
    this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
    this.localVideo.nativeElement.srcObject = this.localStream;
  }

  //TODO empty promise return
  ngAfterViewInit(): void {
    this.setSomething();
  }

}
