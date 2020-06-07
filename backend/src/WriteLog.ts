export class WriteLog {
  private static lastMessage: string;

  public static log(message: string, users: string[]) {
    this.lastMessage = message;
    console.clear();
    console.log("Connected users(" + users.length + "): " + users);
    console.log(message);

    process.stdout.write(": ");
  }
  public static updateUsers(users: string[], newUser: string) {
    console.clear();
    console.log("Connected users(" + users.length + "): " + users);
    console.log("User " + newUser + " joined");
    console.log(this.lastMessage);

    process.stdout.write(": ");
  }
}
