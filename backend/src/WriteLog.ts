interface User {
  name: string;
  score: number;
}

interface Submission {
  author: string;
  truth_1: string;
  truth_2: string;
  lie: string;
}

export class WriteLog {
  private static lastMessage: string;

  private static hasSubmission(user: User, submissions: Submission[]) {
    if (submissions.find((elem) => elem.author === user.name)) return "(✓";
    return "(X";
  }
  private static hasGuess(user: User, userGuessed: string[]) {
    if (userGuessed.find((elem) => elem === user.name)) return ",✓)";
    return ",X)";
  }
  public static log(
    message: string,
    users: User[],
    submissions: Submission[],
    userGuessed: string[]
  ) {
    this.lastMessage = message;
    console.clear();
    console.log(
      "Connected users(" +
        users.length +
        "): " +
        users.map((value) => {
          return (
            value.name +
            this.hasSubmission(value, submissions) +
            this.hasGuess(value, userGuessed)
          );
        })
    );
    console.log(message);

    process.stdout.write(": ");
  }
  public static help() {
    console.clear();
    console.log("Available commands:");
    console.log(
      "start   - starts the game                                 (state 0)"
    );
    console.log(
      "restart - clears the game data and returns to home screen (state 0)"
    );
    console.log(
      "start - promps the user to enter their truths and lies    (state 1)"
    );
    console.log(
      "answer - the intro to beginning of choosing answers       (state 3)"
    );
    console.log(
      "next - promps the user to choose answers                  (state 4)"
    );
    console.log(
      "results - shows the results of the round                  (state 6)"
    );
    console.log(
      "end - shows the final results, ends game                  (state 7)"
    );
    console.log("test - populates the game with some test data");
    console.log("help - how you got here");
    process.stdout.write(": ");
  }

  public static updateUsers(
    users: User[],
    newUser: string,
    submissions: Submission[],
    userGuessed: string[]
  ) {
    console.clear();
    console.log(
      "Connected users(" +
        users.length +
        "): " +
        users.map((value) => {
          return (
            value.name +
            this.hasSubmission(value, submissions) +
            this.hasGuess(value, userGuessed)
          );
        })
    );
    console.log("User " + newUser + " joined");
    console.log(this.lastMessage);

    process.stdout.write(": ");
  }
}
