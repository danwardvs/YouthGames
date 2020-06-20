interface User {
  name: string;
  score: number;
}

export class WriteLog {
  private static lastMessage: string;

  public static log(message: string, users: User[]) {
    this.lastMessage = message;
    console.clear();
    console.log(
      "Connected users(" +
        users.length +
        "): " +
        users.map((value) => value.name)
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
    console.log("help - how you got here");
    process.stdout.write(": ");
  }

  public static updateUsers(users: User[], newUser: string) {
    console.clear();
    console.log(
      "Connected users(" +
        users.length +
        "): " +
        users.map((value) => value.name)
    );
    console.log("User " + newUser + " joined");
    console.log(this.lastMessage);

    process.stdout.write(": ");
  }
}
