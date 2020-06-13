"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WriteLog = void 0;
class WriteLog {
    static log(message, users) {
        this.lastMessage = message;
        console.clear();
        console.log("Connected users(" +
            users.length +
            "): " +
            users.map((value) => value.name));
        console.log(message);
        process.stdout.write(": ");
    }
    static help() {
        console.clear();
        console.log("Available commands:");
        console.log("start   - starts the game                                 (state 0)");
        console.log("restart - clears the game data and returns to home screen (state 0)");
        console.log("start - promps the user to enter their truths and lies    (state 1)");
        console.log("answer - the intro to beginning of choosing answers       (state 3)");
        console.log("next - promps the user to choose answers                  (state 4)");
        console.log("help - how you got here");
        process.stdout.write(": ");
    }
    static updateUsers(users, newUser) {
        console.clear();
        console.log("Connected users(" +
            users.length +
            "): " +
            users.map((value) => value.name));
        console.log("User " + newUser + " joined");
        console.log(this.lastMessage);
        process.stdout.write(": ");
    }
}
exports.WriteLog = WriteLog;
//# sourceMappingURL=WriteLog.js.map