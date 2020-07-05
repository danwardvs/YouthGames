"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WriteLog = void 0;
class WriteLog {
    static hasSubmission(user, submissions) {
        if (submissions.find((elem) => elem.author === user.name))
            return "(✓";
        return "(X";
    }
    static hasGuess(user, userGuessed) {
        if (userGuessed.find((elem) => elem === user.name))
            return ",✓)";
        return ",X)";
    }
    static log(message, users, submissions, userGuessed) {
        this.lastMessage = message;
        console.clear();
        console.log("Connected users(" +
            users.length +
            "): " +
            users.map((value) => {
                return (value.name +
                    this.hasSubmission(value, submissions) +
                    this.hasGuess(value, userGuessed));
            }));
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
        console.log("results - shows the results of the round                  (state 6)");
        console.log("end - shows the final results, ends game                  (state 7)");
        console.log("test - populates the game with some test data");
        console.log("help - how you got here");
        process.stdout.write(": ");
    }
    static updateUsers(users, newUser, submissions, userGuessed) {
        console.clear();
        console.log("Connected users(" +
            users.length +
            "): " +
            users.map((value) => {
                return (value.name +
                    this.hasSubmission(value, submissions) +
                    this.hasGuess(value, userGuessed));
            }));
        console.log("User " + newUser + " joined");
        console.log(this.lastMessage);
        process.stdout.write(": ");
    }
}
exports.WriteLog = WriteLog;
//# sourceMappingURL=WriteLog.js.map