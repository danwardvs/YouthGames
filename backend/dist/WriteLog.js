"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WriteLog = void 0;
class WriteLog {
    static log(message, users) {
        this.lastMessage = message;
        console.clear();
        console.log("Connected users(" + users.length + "): " + users);
        console.log(message);
        process.stdout.write(": ");
    }
    static updateUsers(users, newUser) {
        console.clear();
        console.log("Connected users(" + users.length + "): " + users);
        console.log("User " + newUser + " joined");
        console.log(this.lastMessage);
        process.stdout.write(": ");
    }
}
exports.WriteLog = WriteLog;
//# sourceMappingURL=WriteLog.js.map