import React from "react";
import { Chatbox } from "../Chatbox";
import { ChatMessage } from "../types";

export const SubmitGuess: React.FC<{
  answerAuthor: string;
  author: string;
  answers: string[];
  messages: ChatMessage[];
  handleChoiceSubmit: (answer: string) => void;
}> = ({ answerAuthor, author, messages, handleChoiceSubmit, answers }) => {
  if (answerAuthor !== author)
    return (
      <div className="App">
        These two truths and one lie are brought to you by: {answerAuthor}
        <p>
          <div
            className="App-button"
            onClick={() => handleChoiceSubmit(answers[0])}
          >
            <button>{answers[0]}</button>
          </div>
          <div
            className="App-button"
            onClick={() => handleChoiceSubmit(answers[1])}
          >
            <button>{answers[1]}</button>
          </div>

          <div
            className="App-button"
            onClick={() => handleChoiceSubmit(answers[2])}
          >
            <button>{answers[2]}</button>
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
        <Chatbox messages={messages} />
      </div>
    );
};
