import * as express from "express";
import * as socketIo from "socket.io";
import { ChatEvent } from "./constants";
import { ChatMessage } from "./types";
import { createServer, Server } from "http";
import { WriteLog } from "./WriteLog";

interface Submission {
  author: string;
  truth_1: string;
  truth_2: string;
  lie: string;
}

interface User {
  name: string;
  score: number;
}

var cors = require("cors");

export class ChatServer {
  public static readonly PORT: number = 8080;
  private _app: express.Application;
  private server: Server;
  private io: SocketIO.Server;
  private port: string | number;
  private users: User[] = [];
  private submissions: Submission[] = [];
  private submissionIndex: number;
  private correctAnswer: string;
  private correctUsers: string[];

  constructor() {
    this._app = express();
    this.port = process.env.PORT || ChatServer.PORT;
    this._app.use(cors());
    this._app.options("*", cors());
    this.server = createServer(this._app);
    this.initSocket();
    this.listen();
  }
  private shuffle(array: string[]) {
    var currentIndex = array.length,
      temporaryValue,
      randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  }

  private generateQuestion() {
    const currentSub = this.submissions[this.submissionIndex];
    let answers = [currentSub.truth_1, currentSub.truth_2, currentSub.lie];
    this.shuffle(answers);
    this.correctAnswer = ">>" + currentSub.lie;
    const message =
      "<<" +
      currentSub.author +
      "<<" +
      answers[0] +
      "<<" +
      answers[1] +
      "<<" +
      answers[2];
    this.io.emit("message", { author: "Director", message: message });
  }

  private inputListener(d: any) {
    const input = d.toString().trim();
    if (input.startsWith("message ")) {
      const messageBody = input.substring(7, input.length);
      WriteLog.log("Director: Sending message: " + messageBody, this.users);
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
    } else if (input === "answer") {
      WriteLog.log("Director: Start answer portion", this.users);
      this.submissionIndex = 0;
      this.io.emit("message", {
        author: "Director",
        message: "Moving to the first question. Get ready!"
      });
    } else if (input === "next") {
      if (this.submissionIndex < this.submissions.length) {
        this.generateQuestion();
        WriteLog.log("Director: Asking users for a question.", this.users);
        this.submissionIndex++;
      } else {
        WriteLog.log("Error: No more submissions.", this.users);
      }
    } else if (input === "restart") {
      this.users = [];
      this.submissions = [];
      this.submissionIndex = 0;
      this.correctAnswer = "";
      WriteLog.log("Server: Restarting server", this.users);
      this.io.emit("message", {
        author: "Director",
        message: "Restarting the game!"
      });
    } else if (input === "help") {
      WriteLog.help();
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

        if (m.message) {
          if (m.message === "has arrived!") {
            this.users.push({ name: m.author, score: 0 });
            WriteLog.updateUsers(this.users, m.author);
            this.io.emit("message", m);
          } else if (m.message.startsWith("**")) {
            this.io.emit("message", {
              author: m.author,
              message: "has submitted their truth/lies..."
            });
            const trimmedMessage = m.message.substring(2, m.message.length);
            const answers = trimmedMessage.split("|");
            this.submissions.push({
              author: m.author,
              truth_1: answers[0],
              truth_2: answers[1],
              lie: answers[2]
            });
          } else if (m.message.startsWith("##")) {
            this.io.emit("message", {
              author: m.author,
              message: "has submitted their truth/lies..."
            });
            if (
              m.message.substring(2, m.message.length) === this.correctAnswer
            ) {
              this.users = this.users.map((elem) =>
                elem.name === m.author ? { ...elem, score: elem.score++ } : elem
              );
              this.correctUsers.push(m.author);
            }
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
