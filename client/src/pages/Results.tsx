import React from "react";
import { User } from "../types";
import logo from "../logan.png";

export const Results: React.FC<{
  author: string;
  correctAnswer: string;
  results: User[];
}> = ({ author, correctAnswer, results }) => {
  const renderCorrectResponse = (results: User[]) => {
    let type = 0;
    if (
      results.filter((elem) => elem.author === author && elem.correct === "1")
        .length > 0
    )
      type = 1;
    else if (
      results.filter((elem) => elem.author === author && elem.correct === "2")
        .length > 0
    )
      type = 2;
    else if (
      results.filter((elem) => elem.author === author && elem.correct === "3")
        .length > 0
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

  const renderBox = (correct: string) => {
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

  return (
    <div className="App">
      <img src={logo} className="App-logo" alt="logo" />
      {renderCorrectResponse(results)}
      The correct answer was "{correctAnswer}"
      <table className="results-table">
        {results
          .sort(function (a, b) {
            return b.score - a.score;
          })
          .map((elem, index) => {
            return (
              <tr>
                <td>{index + 1}</td> <td>{elem.author}</td>{" "}
                <td>{elem.score}</td>
                <td>{renderBox(elem.correct)}</td>
              </tr>
            );
          })}
      </table>
    </div>
  );
};
