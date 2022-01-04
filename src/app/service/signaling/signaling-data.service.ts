import {Injectable} from '@angular/core';
import {webSocket, WebSocketSubject} from "rxjs/webSocket";
import {Message} from "./message";
import {Subject} from "rxjs";

const WS_ENDPOINT = 'ws://localhost:8081';

@Injectable({
  providedIn: 'root'
})
export class SignalingDataService {
  private socket?: WebSocketSubject<Message>;
  private messageSubject = new Subject<Message>();

  public message = this.messageSubject.asObservable();

  constructor() {
    this.socket = this.getNewWebSocket();
  }

  private getNewWebSocket(): WebSocketSubject<any> {
    return webSocket({
      url: WS_ENDPOINT,
      openObserver: {
        next: () => {
          console.log('SignalingService: connection OK');
        }
      },
      closeObserver: {
        next: () => {
          console.log('SignalingService: connection CLOSED');
          this.socket = undefined;
          this.connect();
        }
      }
    });
  }

  public connect(): void {
    this.getNewWebSocket();
    this.socket?.subscribe({
        next: msg => {
          console.log('Received message of type ' + msg.type);
          this.messageSubject.next(msg);
        },
      error: error => console.warn(error),
      }
    )
  }

  public sendMessage(message: Message): void {
    console.log('sending message: ' + message.type);
    this.socket?.next(message);
  }


}
