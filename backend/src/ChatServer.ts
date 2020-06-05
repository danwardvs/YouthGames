import * as express from "express";
import * as socketIo from "socket.io";
import { ChatEvent } from "./constants";
import { ChatMessage } from "./types";
import { createServer, Server } from "http";
import { WriteLog } from "./WriteLog";

var cors = require("cors");

export class ChatServer {
  public static readonly PORT: number = 8080;
  private _app: express.Application;
  private server: Server;
  private io: SocketIO.Server;
  private port: string | number;
  private users: string[] = [];

  constructor() {
    this._app = express();
    this.port = process.env.PORT || ChatServer.PORT;
    this._app.use(cors());
    this._app.options("*", cors());
    this.server = createServer(this._app);
    this.initSocket();
    this.listen();
  }

  private inputListener(d: any) {
    const input = d.toString().trim();
    if (input.startsWith("message ")) {
      const messageBody = input.substring(7, input.length);
      WriteLog.log("Sending message: " + messageBody, this.users);
      this.io.emit("message", {
        author: "Director",
        message: messageBody
      });
    } else if (input === "start") {
      WriteLog.log("Director: Game started", this.users);
      this.io.emit("message", {
        author: "Director",
        message: "Starting the game!"
      });
    } else {
      WriteLog.log("Invalid command: " + input, this.users);
    }
  }
  private boundInputListener = this.inputListener.bind(this);

  private listenCommand(): void {
    var stdin = process.openStdin();

    stdin.addListener("data", this.boundInputListener);
  }
  private initSocket(): void {
    this.io = socketIo(this.server);
  }

  private listen(): void {
    this.listenCommand();
    this.server.listen(this.port, () => {
      WriteLog.log("Server: Running on port " + String(this.port), this.users);
    });

    this.io.on(ChatEvent.CONNECT, (socket: any) => {
      //console.log('Connected client on port %s.', this.port);

      socket.on(ChatEvent.MESSAGE, (m: ChatMessage) => {
        //console.log('[server](message): %s', JSON.stringify(m));
        this.io.emit("message", m);

        if (m.message) {
          if (m.message === "has arrived!") {
            this.users.push(m.author);
            WriteLog.updateUsers(this.users, m.author);
          }
        }
      });

      socket.on(ChatEvent.DISCONNECT, () => {
        //console.log('Client disconnected');
      });
    });
  }

  get app(): express.Application {
    return this._app;
  }
}
