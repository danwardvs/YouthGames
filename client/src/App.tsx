import React from "react";
import "./App.css";
import { ChatMessage, ChatState, User } from "./types";
import { ChatContext } from "./ChatContext";
import { Home } from "./pages/Home";
import { EnteredName } from "./pages/EnteredName";
import { SubmitAnswers } from "./pages/SubmitAnswers";
import { IntroGuess } from "./pages/IntroGuess";
import { SubmitGuess } from "./pages/SubmitGuess";
import { AfterGuess } from "./pages/AfterGuess";
import { Results } from "./pages/Results";
import { Final } from "./pages/Final";

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
      const answers = [
        this.state.answers[0].trim(),
        this.state.answers[1].trim(),
        this.state.answers[2].trim()
      ];

      this.context.send({
        message: "**" + answers[0] + "|" + answers[1] + "|" + answers[2],
        author: this.state.author
      });
      this.setState({
        answers: ["", "", ""],
        submittedAnswer: true
      });
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

    if (this.state.gameState === GameState.Home) {
      return (
        <Home
          handleName={handleName}
          nameInput={this.state.nameInput}
          updateInput={updateInput}
        />
      );
    } else if (this.state.gameState === GameState.EnteredName) {
      return (
        <EnteredName
          messages={this.state.messages}
          author={this.state.author}
        />
      );
    } else if (this.state.gameState === GameState.SubmitAnswers) {
      return (
        <SubmitAnswers
          answers={this.state.answers}
          messages={this.state.messages}
          submittedAnswer={this.state.submittedAnswer}
          updateAnswers={updateAnswers}
          handleGameSubmit={handleGameSubmit}
        />
      );
    } else if (this.state.gameState === GameState.IntroGuess) {
      return <IntroGuess />;
    } else if (this.state.gameState === GameState.SubmitGuess) {
      return (
        <SubmitGuess
          answerAuthor={this.state.answerAuthor}
          author={this.state.author}
          answers={this.state.answers}
          messages={this.state.messages}
          handleChoiceSubmit={handleChoiceSubmit}
        />
      );
    } else if (this.state.gameState === GameState.AfterGuess) {
      return <AfterGuess messages={this.state.messages} />;
    } else if (this.state.gameState === GameState.Results) {
      return (
        <Results
          author={this.state.author}
          correctAnswer={this.state.correctAnswer}
          results={this.state.results}
        />
      );
    } else if (this.state.gameState === GameState.Final) {
      return <Final results={this.state.results} />;
    }
  }
}

export default App;
