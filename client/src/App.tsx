import React from "react";
import logo from "./logan.png";
import "./App.css";
import { ChatMessage, ChatState } from "./types";
import { ChatContext } from "./ChatContext";
import ScrollToBottom from "react-scroll-to-bottom";

enum GameState {
  Home = 0,
  EnteredName,
  SubmitAnswers,
  IntroGuess,
  SubmitGuess,
  AfterGuess,
  Results,
  Final
}

// ** submitting user's truths and lies
// << receiving users truths and lies to guess
// ## submitting guess
// ^^ recieve stats
// FF final stats

interface User {
  author: string;
  score: number;
  correct: string;
}

class App extends React.Component {
  static contextType = ChatContext;

  state: ChatState = {
    messages: [
      {
        message: "Welcome! Please wait for the director to start the game.",
        author: "Director"
      }
    ],
    nameInput: "",
    answerAuthor: "",
    answers: ["", "", ""],
    author: "newUser",
    results: [],
    gameState: 0,
    correctAnswer: "",
    submittedAnswer: false
  };

  private setStats(statMessage: string) {
    console.log(statMessage);
    const finalResults: User[] = [];
    const splitAnswers = statMessage.split("#");
    this.setState({ correctAnswer: splitAnswers[1] });
    let newResults = splitAnswers[0].substring(2).split("|");

    newResults.forEach((elem) => {
      if (elem) {
        const val = elem.split("$");
        const correct = val[1].split("%");
        const user = {
          author: val[0],
          score: parseInt(correct[0]),
          correct: correct[1]
        };
        finalResults.push(user);
      }
    });
    this.setState({ results: finalResults });
  }

  private setAnswers = (m: ChatMessage) => {
    const split_answers = m.message.split("<<");
    this.setState({ answerAuthor: split_answers[1] });

    this.setState({ answers: split_answers.slice(2, 5) });
  };

  private renderCorrectResponse = (results: User[]) => {
    let type = 0;
    if (
      results.filter(
        (elem) => elem.author === this.state.author && elem.correct === "1"
      ).length > 0
    )
      type = 1;
    else if (
      results.filter(
        (elem) => elem.author === this.state.author && elem.correct === "2"
      ).length > 0
    )
      type = 2;
    else if (
      results.filter(
        (elem) => elem.author === this.state.author && elem.correct === "3"
      ).length > 0
    )
      type = 3;

    if (type === 1)
      return (
        <div className="headline">
          You are correct!! <span className="boxCorrect">✓</span>
        </div>
      );
    if (type === 0)
      return (
        <div className="headline">
          You are incorrect... <span className="boxIncorrect">X</span>
        </div>
      );

    if (type === 3)
      return (
        <div className="headline">
          You didn't submit an answer (or were disconnected...){" "}
          <span className="boxDisconnected">?</span>
        </div>
      );
    return (
      <div className="headline">
        Let's see how the others guessed your lies.
        <span className="boxSelf">0</span>
      </div>
    );
  };

  private renderBox = (correct: string) => {
    if (correct === "0")
      return (
        <>
          <span className="boxIncorrect">X</span>
        </>
      );

    if (correct === "1") return <span className="boxCorrect">✓</span>;
    if (correct === "3") return <span className="boxDisconnect">?</span>;

    return <span className="boxSelf">0</span>;
  };

  private randomMessage = () => {
    const replies = [
      "Thanks for your guess! Let's see how you did.",
      "I hope you're as confident in that answer as I am.",
      "There's no way that isn't right! Let's find out.",
      "Did you take time to think about it?",
      "I believe in you! Your answer, that's a different story.",
      "Wowza! What a reply. Let's see how you stack up.",
      "I hope they're not offended by your answer.",
      "Sending these off to a server somewhere far away.",
      'Fun fact, while we\'re waiting: A baby puffin is called a "puffling".',
      "Fun fact, while we're waiting: Baby sea otters can't swim."
    ];
    return replies[Math.round(Math.random() * replies.length)];
  };

  componentDidMount() {
    //initiate socket connection
    this.context.init();

    const observable = this.context.onMessage();

    observable.subscribe((m: ChatMessage) => {
      let messages = this.state.messages;
      this.setState({ messages: messages });

      let push = true;
      if (m.author === "Director") {
        if (m.message === "Starting the game!") this.setState({ gameState: 2 });
        if (m.message === "Ending the game.") this.setState({ gameState: 7 });

        if (m.message === "Restarting the game!") {
          this.setState({
            messages: [],
            answerAuthor: "",
            answers: ["", "", ""],
            author: "newUser",
            results: [],
            gameState: 0,
            submittedAnswer: false
          });
          this.setState({ gameState: 0 });
        }
        if (m.message === "Moving to the first question. Get ready!")
          this.setState({ gameState: 3 });
        if (m.message.startsWith("<<")) {
          push = false;
          this.setState({ gameState: 4 });
          this.setAnswers(m);
        }
        if (m.message.startsWith("^^")) {
          this.setState({ gameState: 6 });
          this.setStats(m.message);
          push = false;
        }
        if (m.message.startsWith("FF")) {
          this.setStats(m.message);

          this.setState({ gameState: 7 });
          push = false;
        }
      }
      if (push) messages.push(m);

      this.setState({ messages: messages });
    });
  }

  componentWillUnmount() {
    this.context.disconnect();
  }

  render() {
    const updateInput = (e: React.ChangeEvent<HTMLInputElement>): void => {
      this.setState({ nameInput: e.target.value });
    };
    const updateAnswers = (input: string, target: number): void => {
      const newAnswers = this.state.answers;
      newAnswers[target] = input;
      this.setState({ answers: newAnswers });
    };

    const handleGameSubmit = (): void => {
      if (
        this.state.answers[0] !== "" &&
        this.state.answers[1] !== "" &&
        this.state.answers[2] !== "" &&
        this.state.answers[1] !== this.state.answers[2] &&
        this.state.answers[1] !== this.state.answers[3] &&
        this.state.answers[2] !== this.state.answers[3]
      ) {
        this.context.send({
          message:
            "**" +
            this.state.answers[0] +
            "|" +
            this.state.answers[1] +
            "|" +
            this.state.answers[2],
          author: this.state.author
        });
        this.setState({
          answers: ["", "", ""],
          submittedAnswer: true
        });
      }
    };
    const handleChoiceSubmit = (choice: string) => {
      this.setState({ gameState: 5 });
      this.context.send({
        author: this.state.author,
        message: "##" + choice
      });
    };

    const handleName = (): void => {
      if (this.state.nameInput !== "" && this.state.nameInput !== "Director") {
        this.context.send({
          message: "has arrived!",
          author: this.state.nameInput
        });
        this.setState({ input: "" });
        this.setState({ gameState: 1 });
        this.setState({ author: this.state.nameInput });
      }
    };

    let msgIndex = 0;

    if (this.state.gameState === GameState.Home) {
      return (
        <div className="App">
          <img src={logo} className="App-logo" alt="logo" />
          Welcome to Danny's (probably broken) online youth games.
          <input
            className="App-Textarea"
            placeholder="Please enter your (real) name!"
            onChange={updateInput}
            value={this.state.nameInput}
          />
          <p>
            <div
              className="App-button"
              onClick={() => {
                handleName();
              }}
            >
              <button>Enter Name</button>
            </div>
          </p>
        </div>
      );
    } else if (this.state.gameState === GameState.EnteredName) {
      return (
        <div className="App">
          <img src={logo} className="App-logo" alt="logo" />
          Howdy there {this.state.author}!
          <ScrollToBottom className="App-chatbox">
            {this.state.messages.map((msg: ChatMessage) => {
              msgIndex++;
              return (
                <div key={msgIndex} className="App-chatbox-elem">
                  <p>{msg.author}</p>
                  <p>{msg.message}</p>
                </div>
              );
            })}
          </ScrollToBottom>
        </div>
      );
    } else if (this.state.gameState === GameState.SubmitAnswers) {
      return (
        <div className="App">
          <ScrollToBottom className="App-chatbox">
            {this.state.messages.map((msg: ChatMessage) => {
              msgIndex++;
              return (
                <div key={msgIndex} className="App-chatbox-elem">
                  <p>{msg.author}</p>
                  <p>{msg.message}</p>
                </div>
              );
            })}
          </ScrollToBottom>
          {this.state.submittedAnswer ? (
            <>
              Thanks for your submission! Waiting until everybody has submitted
              and the Director moves onto the next section
            </>
          ) : (
            <>
              <input
                className="App-Textarea"
                placeholder="Type your truth #1 here..."
                onChange={(event) => updateAnswers(event.target.value, 0)}
                value={this.state.answers[0]}
              />
              <input
                className="App-Textarea"
                placeholder="Type your truth #2 here..."
                onChange={(event) => updateAnswers(event.target.value, 1)}
                value={this.state.answers[1]}
              />
              <input
                className="App-Textarea"
                placeholder="Type your lie here..."
                onChange={(event) => updateAnswers(event.target.value, 2)}
                value={this.state.answers[2]}
              />
              <p>
                <div
                  className="App-button"
                  onClick={() => {
                    handleGameSubmit();
                  }}
                >
                  <button>Submit Answers</button>
                </div>
                Note: Answers must be non-blank and must not be equal to each
                other.
              </p>
            </>
          )}
        </div>
      );
    } else if (this.state.gameState === GameState.IntroGuess) {
      return (
        <div className="App">
          <img src={logo} className="App-logo" alt="logo" />
          Get ready to guess the answer that you think is a lie.
        </div>
      );
    } else if (this.state.gameState === GameState.SubmitGuess) {
      if (this.state.answerAuthor !== this.state.author)
        return (
          <div className="App">
            These two truths and one lie are brought to you by:{" "}
            {this.state.answerAuthor}
            <p>
              <div
                className="App-button"
                onClick={() => handleChoiceSubmit(this.state.answers[0])}
              >
                <button>{this.state.answers[0]}</button>
              </div>
              <div
                className="App-button"
                onClick={() => handleChoiceSubmit(this.state.answers[1])}
              >
                <button>{this.state.answers[1]}</button>
              </div>

              <div
                className="App-button"
                onClick={() => handleChoiceSubmit(this.state.answers[2])}
              >
                <button>{this.state.answers[2]}</button>
              </div>
            </p>
          </div>
        );
      else
        return (
          <div className="App">
            <div className="headline">
              This is your truth and lies! I wonder what the others think about
              you...
            </div>
            <ScrollToBottom className="App-chatbox">
              {this.state.messages.map((msg: ChatMessage) => {
                msgIndex++;
                return (
                  <div key={msgIndex} className="App-chatbox-elem">
                    <p>{msg.author}</p>
                    <p>{msg.message}</p>
                  </div>
                );
              })}
            </ScrollToBottom>
          </div>
        );
    } else if (this.state.gameState === GameState.AfterGuess) {
      return (
        <div className="App">
          {this.randomMessage()}
          <ScrollToBottom className="App-chatbox">
            {this.state.messages.map((msg: ChatMessage) => {
              msgIndex++;
              return (
                <div key={msgIndex} className="App-chatbox-elem">
                  <p>{msg.author}</p>
                  <p>{msg.message}</p>
                </div>
              );
            })}
          </ScrollToBottom>
        </div>
      );
    } else if (this.state.gameState === GameState.Results) {
      return (
        <div className="App">
          <img src={logo} className="App-logo" alt="logo" />
          {this.renderCorrectResponse(this.state.results)}
          The correct answer was "{this.state.correctAnswer}"
          <table className="results-table">
            {this.state.results
              .sort(function (a, b) {
                return b.score - a.score;
              })
              .map((elem, index) => {
                return (
                  <tr>
                    <td>{index + 1}</td> <td>{elem.author}</td>{" "}
                    <td>{elem.score}</td>
                    <td>{this.renderBox(elem.correct)}</td>
                  </tr>
                );
              })}
          </table>
        </div>
      );
    } else if (this.state.gameState === GameState.Final) {
      const sorted_results = this.state.results.sort(function (a, b) {
        return b.score - a.score;
      });
      return (
        <div className="App">
          <img src={logo} className="App-logo" alt="logo" />
          Game has ended...
          {sorted_results.length > 0 && (
            <>
              <div className="headline">
                Congratulations to {sorted_results[0].author}!
              </div>
              <div className="headline">
                Placed 1st with {sorted_results[0].score} correct guesses!
              </div>
            </>
          )}
          {sorted_results.length > 2 && (
            <>
              Also a shoutout to {sorted_results[1].author} for 2nd and{" "}
              {sorted_results[2].author} for 3rd.
            </>
          )}
          <div>{"*"}</div>
          <div>{"*"}</div>
          <div>{"*"}</div>
          <table className="results-table">
            {this.state.results
              .sort(function (a, b) {
                return b.score - a.score;
              })
              .map((elem, index) => {
                return (
                  <tr>
                    <td>{index + 1}</td> <td>{elem.author}</td>{" "}
                    <td>{elem.score}</td>
                  </tr>
                );
              })}
          </table>
          <div>{"*"}</div>
          <div>{"*"}</div>I didn't program any logic for ties, so if there's a
          tie I think the winner will be whoever joined first.
          <div>{"*"}</div>
          <div>{"*"}</div>
          <div>{"*"}</div>
          <div>{"*"}</div>
          <div>{"*"}</div>
          <div>{"*"}</div>
          This game was brought to you by Danny Van Stemp. I hope you enjoyed!
        </div>
      );
    }
  }
}

export default App;
