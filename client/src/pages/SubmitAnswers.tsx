import React from "react";
import { Chatbox } from "../Chatbox";
import { ChatMessage } from "../types";

export const SubmitAnswers: React.FC<{
  messages: ChatMessage[];
  answers: string[];
  submittedAnswer: boolean;
  updateAnswers: (input: string, target: number) => void;
  handleGameSubmit: () => void;
}> = ({
  messages,
  submittedAnswer,
  answers,
  updateAnswers,
  handleGameSubmit
}) => {
  return (
    <div className="App">
      {submittedAnswer ? (
        <>
          Thanks for your submission! Waiting until everybody has submitted and
          the Director moves onto the next section
          <Chatbox messages={messages} />
        </>
      ) : (
        <>
          <input
            className="App-Textarea"
            placeholder="Type your truth #1 here..."
            onChange={(event) => updateAnswers(event.target.value, 0)}
            value={answers[0]}
          />
          <input
            className="App-Textarea"
            placeholder="Type your truth #2 here..."
            onChange={(event) => updateAnswers(event.target.value, 1)}
            value={answers[1]}
          />
          <input
            className="App-Textarea"
            placeholder="Type your lie here..."
            onChange={(event) => updateAnswers(event.target.value, 2)}
            value={answers[2]}
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
            Note: Answers must be non-blank and must not be equal to each other.
          </p>
        </>
      )}
    </div>
  );
};
