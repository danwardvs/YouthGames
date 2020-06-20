import React from "react";
import logo from "./logo.svg";
import "./App.css";
import { ChatMessage, ChatState } from "./types";
import { ChatContext } from "./ChatContext";
import ScrollToBottom from "react-scroll-to-bottom";

// ** submitting user's truths and lies
// << receiving users truths and lies to guess
// ## submitting guess
// ^^ recieve stats

interface user {
  author: string;
  score: number;
}

class App extends React.Component {
  static contextType = ChatContext;
  test = [
    { author: "Allan", score: 321 },
    { author: "Danny", score: 999 },
    { author: "Zllan", score: 1 },
    { author: "An", score: 21 }
  ];
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
    submittedAnswer: false
  };

  private setAnswers = (m: ChatMessage) => {
    console.log(m.message);
    const split_answers = m.message.split("<<");
    this.setState({ answerAuthor: split_answers[1] });
    console.log(split_answers);

    console.log(split_answers.slice(2, 5));
    this.setState({ answers: split_answers.slice(2, 5) });
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
          const finalResults: user[] = [];
          const newResults = m.message.substring(2).split("|");
          newResults.forEach((elem) => {
            if (elem) {
              const val = elem.split("$");
              const user = { author: val[0], score: parseInt(val[1]) };
              finalResults.push(user);
            }
          });
          this.setState({ results: finalResults });
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
    if (this.state.gameState === 2) {
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
    } else if (this.state.gameState === 0) {
      return (
        <div className="App">
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
    } else if (this.state.gameState === 5) {
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
    } else if (this.state.gameState === 6) {
      return (
        <div className="App">
          Here's the results!
          {this.state.results
            .sort(function (a, b) {
              return b.score - a.score;
            })
            .map((elem) => {
              return <div>{elem.author + ": " + elem.score}</div>;
            })}
        </div>
      );
    } else if (this.state.gameState === 3) {
      return (
        <div className="App">
          <img src={logo} className="App-logo" alt="logo" />
          Get ready to guess the answer that you think is a lie.
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
    } else if (this.state.gameState === 4) {
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
            This is your truth and lies! I wonder what the others think about
            you...
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
    } else if (this.state.gameState === 1) {
      return (
        <div className="App">
          <img src={logo} className="App-logo" alt="logo" />
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
    }
  }
}

export default App;
