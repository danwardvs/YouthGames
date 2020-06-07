"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatServer = void 0;
const express = require("express");
const socketIo = require("socket.io");
const constants_1 = require("./constants");
const http_1 = require("http");
const WriteLog_1 = require("./WriteLog");
var cors = require("cors");
let ChatServer = /** @class */ (() => {
    class ChatServer {
        constructor() {
            this.users = [];
            this.submissions = [];
            this.boundInputListener = this.inputListener.bind(this);
            this._app = express();
            this.port = process.env.PORT || ChatServer.PORT;
            this._app.use(cors());
            this._app.options("*", cors());
            this.server = http_1.createServer(this._app);
            this.initSocket();
            this.listen();
        }
        inputListener(d) {
            const input = d.toString().trim();
            if (input.startsWith("message ")) {
                const messageBody = input.substring(7, input.length);
                WriteLog_1.WriteLog.log("Sending message: " + messageBody, this.users);
                this.io.emit("message", {
                    author: "Director",
                    message: messageBody
                });
            }
            else if (input === "start") {
                WriteLog_1.WriteLog.log("Director: Game started", this.users);
                this.io.emit("message", {
                    author: "Director",
                    message: "Starting the game!"
                });
            }
            else if (input === "answer") {
                WriteLog_1.WriteLog.log("Director: Start answer portion", this.users);
                this.io.emit("message", {
                    author: "Director",
                    message: "Moving to answers."
                });
            }
            else {
                WriteLog_1.WriteLog.log("Invalid command: " + input, this.users);
            }
        }
        listenCommand() {
            var stdin = process.openStdin();
            stdin.addListener("data", this.boundInputListener);
        }
        initSocket() {
            this.io = socketIo(this.server);
        }
        listen() {
            this.listenCommand();
            this.server.listen(this.port, () => {
                WriteLog_1.WriteLog.log("Server: Running on port " + String(this.port), this.users);
            });
            this.io.on(constants_1.ChatEvent.CONNECT, (socket) => {
                //console.log('Connected client on port %s.', this.port);
                socket.on(constants_1.ChatEvent.MESSAGE, (m) => {
                    //console.log('[server](message): %s', JSON.stringify(m));
                    if (m.message) {
                        if (m.message === "has arrived!") {
                            this.users.push(m.author);
                            WriteLog_1.WriteLog.updateUsers(this.users, m.author);
                            this.io.emit("message", m);
                        }
                        else if (m.message.startsWith("**")) {
                            this.io.emit("message", {
                                author: m.author,
                                message: "has submitted their answer..."
                            });
                            const trimmedMessage = m.message.substring(1, m.message.length);
                            const answers = trimmedMessage.split("|");
                            this.submissions.push({
                                author: m.author,
                                truth_1: answers[0],
                                truth_2: answers[1],
                                lie: answers[2]
                            });
                        }
                    }
                });
                socket.on(constants_1.ChatEvent.DISCONNECT, () => {
                    //console.log('Client disconnected');
                });
            });
        }
        get app() {
            return this._app;
        }
    }
    ChatServer.PORT = 8080;
    return ChatServer;
})();
exports.ChatServer = ChatServer;
//# sourceMappingURL=ChatServer.js.map