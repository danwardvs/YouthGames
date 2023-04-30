import io from "socket.io-client";
import { ChatMessage } from "./types";
import { fromEvent, Observable } from "rxjs";

export class SocketService {
  private socket: SocketIOClient.Socket = {} as SocketIOClient.Socket;

  public init(): SocketService {
    console.log("Initiating socket service");
    console.log(process.env);
    if (process.env.REACT_APP_SERVER_URL) {
      console.log("Remote URL is " + process.env.REACT_APP_SERVER_URL);
      this.socket = io(process.env.REACT_APP_SERVER_URL);
      return this;
    }

    console.log("No remote URL found in environment variables.");
    throw new Error("No remote URL found in environment variables.");
  }

  // send a message for the server to broadcast
  public send(message: ChatMessage): void {
    console.log("emitting message: " + message);
    this.socket.emit("message", message);
  }

  // link message event to rxjs data source
  public onMessage(): Observable<ChatMessage> {
    return fromEvent(this.socket, "message");
  }

  // disconnect - used when unmounting
  public disconnect(): void {
    this.socket.disconnect();
  }
}
