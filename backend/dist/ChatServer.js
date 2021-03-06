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
            this.correctAnswer = {
                name: "Jim",
                answer: "I quite dislike bananas"
            };
            this.correctUsers = [];
            this.incorrectUsers = [];
            this.boundInputListener = this.inputListener.bind(this);
            this._app = express();
            this.port = process.env.PORT || ChatServer.PORT;
            this._app.use(cors());
            this._app.options("*", cors());
            this.server = http_1.createServer(this._app);
            this.initSocket();
            this.listen();
        }
        shuffle(array) {
            var currentIndex = array.length, temporaryValue, randomIndex;
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
        getCorrectUser(user) {
            if (this.correctAnswer.name === user.name)
                return "2";
            if (this.correctUsers.includes(user.name))
                return "1";
            if (!this.incorrectUsers.includes(user.name))
                return "3";
            return "0";
        }
        getUserGuesses() {
            return this.correctUsers.concat(this.incorrectUsers);
        }
        sendResults(final) {
            let message = final ? "FF" : "^^";
            this.users.map((user) => (message +=
                user.name + "$" + user.score + "%" + this.getCorrectUser(user) + "|"));
            message += "#" + this.correctAnswer.answer.substring(2);
            this.io.emit("message", { author: "Director", message: message });
        }
        generateQuestion() {
            const currentSub = this.submissions[this.submissionIndex];
            let answers = [currentSub.truth_1, currentSub.truth_2, currentSub.lie];
            this.shuffle(answers);
            this.correctAnswer.answer = "##" + currentSub.lie;
            this.correctAnswer.name = currentSub.author;
            const message = "<<" +
                currentSub.author +
                "<<" +
                answers[0] +
                "<<" +
                answers[1] +
                "<<" +
                answers[2];
            this.io.emit("message", { author: "Director", message: message });
        }
        inputListener(d) {
            const input = d.toString().trim();
            if (input.startsWith("message ")) {
                const messageBody = input.substring(7, input.length);
                WriteLog_1.WriteLog.log("Director: Sending message: " + messageBody, this.users, this.submissions, this.getUserGuesses());
                this.io.emit("message", {
                    author: "Director",
                    message: messageBody
                });
            }
            else if (input === "start") {
                WriteLog_1.WriteLog.log("Director: Game started", this.users, this.submissions, this.getUserGuesses());
                this.io.emit("message", {
                    author: "Director",
                    message: "Starting the game!"
                });
            }
            else if (input === "answer") {
                WriteLog_1.WriteLog.log("Director: Start answer portion", this.users, this.submissions, this.getUserGuesses());
                this.correctAnswer = { answer: "I quite like bananas", name: "Jimbo" };
                this.submissionIndex = 0;
                this.io.emit("message", {
                    author: "Director",
                    message: "Moving to the first question. Get ready!"
                });
            }
            else if (input === "next") {
                if (this.submissionIndex < this.submissions.length) {
                    this.correctUsers = [];
                    this.incorrectUsers = [];
                    this.generateQuestion();
                    WriteLog_1.WriteLog.log("Director: Asking users for a question.", this.users, this.submissions, this.getUserGuesses());
                    this.submissionIndex++;
                }
                else {
                    WriteLog_1.WriteLog.log("Error: No more submissions.", this.users, this.submissions, this.getUserGuesses());
                }
            }
            else if (input === "results") {
                if (this.submissions.length > 0) {
                    this.sendResults(false);
                    WriteLog_1.WriteLog.log("Director: Sending results.", this.users, this.submissions, this.getUserGuesses());
                }
                else {
                    WriteLog_1.WriteLog.log("Error: No submissions to give results for.", this.users, this.submissions, this.getUserGuesses());
                }
            }
            else if (input === "restart") {
                this.users = [];
                this.submissions = [];
                this.submissionIndex = 0;
                this.correctAnswer = null;
                this.incorrectUsers = [];
                this.correctUsers = [];
                WriteLog_1.WriteLog.log("Server: Restarting server", this.users, this.submissions, this.getUserGuesses());
                this.io.emit("message", {
                    author: "Director",
                    message: "Restarting the game!"
                });
            }
            else if (input === "test") {
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
                WriteLog_1.WriteLog.log("Server: Populating test data.", this.users, this.submissions, this.getUserGuesses());
            }
            else if (input === "end") {
                WriteLog_1.WriteLog.log("Director: Ending the game.", this.users, this.submissions, this.getUserGuesses());
                this.sendResults(true);
            }
            else if (input === "help") {
                WriteLog_1.WriteLog.help();
            }
            else {
                WriteLog_1.WriteLog.log("Invalid command: " + input, this.users, this.submissions, this.getUserGuesses());
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
                WriteLog_1.WriteLog.log("Server: Running on port " + String(this.port), this.users, this.submissions, this.getUserGuesses());
            });
            this.io.on(constants_1.ChatEvent.CONNECT, (socket) => {
                //console.log('Connected client on port %s.', this.port);
                socket.on(constants_1.ChatEvent.MESSAGE, (m) => {
                    //console.log('[server](message): %s', JSON.stringify(m));
                    if (m.message) {
                        if (m.message === "has arrived!") {
                            if (!this.users.find((elem) => elem.name === m.author)) {
                                this.users.push({ name: m.author, score: 0 });
                                WriteLog_1.WriteLog.updateUsers(this.users, m.author, this.submissions, this.getUserGuesses());
                                this.io.emit("message", m);
                            }
                            else {
                                WriteLog_1.WriteLog.log(m.author + " has reconnected.", this.users, this.submissions, this.getUserGuesses());
                            }
                        }
                        else if (m.message.startsWith("**")) {
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
                            WriteLog_1.WriteLog.log(m.author + " has submitted their answer.", this.users, this.submissions, this.getUserGuesses());
                        }
                        else if (m.message.startsWith("##")) {
                            if (m.message === this.correctAnswer.answer) {
                                this.users = this.users.map((elem) => elem.name === m.author
                                    ? Object.assign(Object.assign({}, elem), { score: elem.score + 1 }) : elem);
                                this.correctUsers.push(m.author);
                            }
                            else {
                                this.incorrectUsers.push(m.author);
                            }
                            this.io.emit("message", {
                                author: m.author,
                                message: "has submitted their guess..."
                            });
                            WriteLog_1.WriteLog.log(m.author + " has submitted their guess.", this.users, this.submissions, this.getUserGuesses());
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