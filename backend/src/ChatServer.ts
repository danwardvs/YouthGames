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
interface CorrectAnswer {
  name: string;
  answer: string;
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
  private correctAnswer: CorrectAnswer = {
    name: "Jim",
    answer: "I quite dislike bananas"
  };
  private correctUsers: string[] = [];
  private incorrectUsers: string[] = [];

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

  private getCorrectUser(user: User) {
    if (this.correctAnswer.name === user.name) return "2";
    if (this.correctUsers.includes(user.name)) return "1";
    if (!this.incorrectUsers.includes(user.name)) return "3";

    return "0";
  }
  private getUserGuesses() {
    return this.correctUsers.concat(this.incorrectUsers);
  }

  private sendResults(final: boolean) {
    let message = final ? "FF" : "^^";
    this.users.map(
      (user) =>
        (message +=
          user.name + "$" + user.score + "%" + this.getCorrectUser(user) + "|")
    );
    message += "#" + this.correctAnswer.answer.substring(2);
    this.io.emit("message", { author: "Director", message: message });
  }

  private generateQuestion() {
    const currentSub = this.submissions[this.submissionIndex];
    let answers = [currentSub.truth_1, currentSub.truth_2, currentSub.lie];
    this.shuffle(answers);
    this.correctAnswer.answer = "##" + currentSub.lie;
    this.correctAnswer.name = currentSub.author;
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
      WriteLog.log(
        "Director: Sending message: " + messageBody,
        this.users,
        this.submissions,
        this.getUserGuesses()
      );
      this.io.emit("message", {
        author: "Director",
        message: messageBody
      });
    } else if (input === "start") {
      WriteLog.log(
        "Director: Game started",
        this.users,
        this.submissions,
        this.getUserGuesses()
      );
      this.io.emit("message", {
        author: "Director",
        message: "Starting the game!"
      });
    } else if (input === "answer") {
      WriteLog.log(
        "Director: Start answer portion",
        this.users,
        this.submissions,
        this.getUserGuesses()
      );
      this.correctAnswer = { answer: "I quite like bananas", name: "Jimbo" };
      this.submissionIndex = 0;
      this.io.emit("message", {
        author: "Director",
        message: "Moving to the first question. Get ready!"
      });
    } else if (input === "next") {
      if (this.submissionIndex < this.submissions.length) {
        this.correctUsers = [];
        this.incorrectUsers = [];
        this.generateQuestion();
        WriteLog.log(
          "Director: Asking users for a question.",
          this.users,
          this.submissions,
          this.getUserGuesses()
        );
        this.submissionIndex++;
      } else {
        WriteLog.log(
          "Error: No more submissions.",
          this.users,
          this.submissions,
          this.getUserGuesses()
        );
      }
    } else if (input === "results") {
      if (this.submissions.length > 0) {
        this.sendResults(false);
        WriteLog.log(
          "Director: Sending results.",
          this.users,
          this.submissions,
          this.getUserGuesses()
        );
      } else {
        WriteLog.log(
          "Error: No submissions to give results for.",
          this.users,
          this.submissions,
          this.getUserGuesses()
        );
      }
    } else if (input === "restart") {
      this.users = [];
      this.submissions = [];
      this.submissionIndex = 0;
      this.correctAnswer = null;
      this.incorrectUsers = [];
      this.correctUsers = [];
      WriteLog.log(
        "Server: Restarting server",
        this.users,
        this.submissions,
        this.getUserGuesses()
      );
      this.io.emit("message", {
        author: "Director",
        message: "Restarting the game!"
      });
    } else if (input === "test") {
      this.users = [
        { name: "Danny", score: 99 },

        { name: "Allan", score: 99 },
        { name: "Miriam", score: 99 }
      ];
      this.submissions = [
        { author: "Allan", truth_1: "1", truth_2: "2", lie: "3" },
        { author: "Miriam", truth_1: "1", truth_2: "2", lie: "3" },
        { author: "Danny", truth_1: "1", truth_2: "2", lie: "3" }
      ];

      this.submissionIndex = 0;
      this.correctAnswer = { answer: "3", name: "Allan" };
      WriteLog.log(
        "Server: Populating test data.",
        this.users,
        this.submissions,
        this.getUserGuesses()
      );
    } else if (input === "end") {
      WriteLog.log(
        "Director: Ending the game.",
        this.users,
        this.submissions,
        this.getUserGuesses()
      );
      this.sendResults(true);
    } else if (input === "help") {
      WriteLog.help();
    } else {
      WriteLog.log(
        "Invalid command: " + input,
        this.users,
        this.submissions,
        this.getUserGuesses()
      );
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
      WriteLog.log(
        "Server: Running on port " + String(this.port),
        this.users,
        this.submissions,
        this.getUserGuesses()
      );
    });

    this.io.on(ChatEvent.CONNECT, (socket: any) => {
      //console.log('Connected client on port %s.', this.port);

      socket.on(ChatEvent.MESSAGE, (m: ChatMessage) => {
        //console.log('[server](message): %s', JSON.stringify(m));

        if (m.message) {
          if (m.message === "has arrived!") {
            if (!this.users.find((elem) => elem.name === m.author)) {
              this.users.push({ name: m.author, score: 0 });
              WriteLog.updateUsers(
                this.users,
                m.author,
                this.submissions,
                this.getUserGuesses()
              );

              this.io.emit("message", m);
            } else {
              WriteLog.log(
                m.author + " has reconnected.",
                this.users,
                this.submissions,
                this.getUserGuesses()
              );
            }
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
            WriteLog.log(
              m.author + " has submitted their answer.",
              this.users,
              this.submissions,
              this.getUserGuesses()
            );
          } else if (m.message.startsWith("##")) {
            if (m.message === this.correctAnswer.answer) {
              this.users = this.users.map((elem) =>
                elem.name === m.author
                  ? { ...elem, score: elem.score + 1 }
                  : elem
              );
              this.correctUsers.push(m.author);
            } else {
              this.incorrectUsers.push(m.author);
            }
            this.io.emit("message", {
              author: m.author,
              message: "has submitted their guess..."
            });
            WriteLog.log(
              m.author + " has submitted their guess.",
              this.users,
              this.submissions,
              this.getUserGuesses()
            );
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
