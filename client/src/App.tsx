import React from "react";
import logo from "./logo.svg";
import "./App.css";
import { ChatMessage, ChatState } from "./types";
import { ChatContext } from "./ChatContext";
import ScrollToBottom from "react-scroll-to-bottom";

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
    truth_1: "",
    truth_2: "",
    lie: "",
    author: "newUser",
    started: 0,
    submittedAnswer: false
  };

  componentDidMount() {
    //initiate socket connection
    this.context.init();

    const observable = this.context.onMessage();

    observable.subscribe((m: ChatMessage) => {
      let messages = this.state.messages;

      messages.push(m);
      this.setState({ messages: messages });
      if (m.author === "Director") {
        if (m.message === "Starting the game!") this.setState({ started: 2 });
      }
    });
  }

  componentWillUnmount() {
    this.context.disconnect();
  }

  render() {
    const updateInput = (e: React.ChangeEvent<HTMLInputElement>): void => {
      this.setState({ nameInput: e.target.value });
    };
    const updateTruth1 = (e: React.ChangeEvent<HTMLInputElement>): void => {
      this.setState({ truth_1: e.target.value });
    };
    const updateTruth2 = (e: React.ChangeEvent<HTMLInputElement>): void => {
      this.setState({ truth_2: e.target.value });
    };
    const updateLie = (e: React.ChangeEvent<HTMLInputElement>): void => {
      this.setState({ lie: e.target.value });
    };

    const handleGameSubmit = (): void => {
      if (
        this.state.truth_1 !== "" &&
        this.state.truth_2 !== "" &&
        this.state.lie !== ""
      ) {
        this.context.send({
          message:
            "**" +
            this.state.truth_1 +
            "|" +
            this.state.truth_2 +
            "|" +
            this.state.lie,
          author: this.state.author
        });
        this.setState({
          truth_1: "",
          truth_2: "",
          lie: "",
          submittedAnswer: true
        });
      }
    };

    const handleName = (): void => {
      if (this.state.nameInput !== "" && this.state.nameInput !== "Director") {
        this.context.send({
          message: "has arrived!",
          author: this.state.nameInput
        });
        this.setState({ input: "" });
        this.setState({ started: 1 });
        this.setState({ author: this.state.nameInput });
      }
    };

    let msgIndex = 0;
    if (this.state.started === 2) {
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
                onChange={updateTruth1}
                value={this.state.truth_1}
              />
              <input
                className="App-Textarea"
                placeholder="Type your truth #2 here..."
                onChange={updateTruth2}
                value={this.state.truth_2}
              />
              <input
                className="App-Textarea"
                placeholder="Type your lie here..."
                onChange={updateLie}
                value={this.state.lie}
              />
              <p>
                <button
                  onClick={() => {
                    handleGameSubmit();
                  }}
                >
                  Send Message
                </button>
              </p>
            </>
          )}
        </div>
      );
    } else if (this.state.started === 0) {
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
            <button
              onClick={() => {
                handleName();
              }}
            >
              Enter Name
            </button>
          </p>
        </div>
      );
    } else if (this.state.started === 1) {
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
