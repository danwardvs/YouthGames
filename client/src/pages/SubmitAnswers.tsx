import React, { useState } from "react";
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
  const [error, setError] = useState("");

  const handleValidateGameSubmit = () => {
    const trim = [answers[0].trim(), answers[1].trim(), answers[2].trim()];
    if (trim[0] === "" || trim[1] === "" || trim[2] === "") {
      setError("No blank answers are permitted.");
      return;
    }
    if (trim[0] === trim[1] || trim[1] === trim[2] || trim[2] === trim[0]) {
      setError("Answers must be unique.");
      return;
    }
    handleGameSubmit();
    setError("");
  };

  const handleUpdateAnswers = (answer: string, index: number) => {
    setError("");
    updateAnswers(answer, index);
  };

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
          Two truths:
          <input
            className="App-Textarea"
            placeholder="Type your truth #1 here..."
            onChange={(event) => handleUpdateAnswers(event.target.value, 0)}
            value={answers[0]}
          />
          <input
            className="App-Textarea"
            placeholder="Type your truth #2 here..."
            onChange={(event) => handleUpdateAnswers(event.target.value, 1)}
            value={answers[1]}
          />
          Lie:
          <input
            className="App-Textarea"
            placeholder="Type your lie here..."
            onChange={(event) => handleUpdateAnswers(event.target.value, 2)}
            value={answers[2]}
          />
          <p>
            <div
              className="App-button"
              onClick={() => {
                handleValidateGameSubmit();
              }}
            >
              <button>Submit Answers</button>
            </div>
            {error && (
              <div className="App-button" style={{ color: "red" }}>
                {error}
              </div>
            )}
            Note: Answers must be non-blank and must not be equal to each other.
          </p>
        </>
      )}
    </div>
  );
};
