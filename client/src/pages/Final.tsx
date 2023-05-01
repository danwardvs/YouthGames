import React from "react";
import { User } from "../types";
import logo from "../logan.png";

export const Final: React.FC<{
  results: User[];
}> = ({ results }) => {
  const sorted_results = results.sort(function (a, b) {
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
        {results
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
      <div>{"*"}</div>I didn't program any logic for ties, so if there's a tie I
      think the winner will be whoever joined first.
      <div>{"*"}</div>
      <div>{"*"}</div>
      <div>{"*"}</div>
      <div>{"*"}</div>
      <div>{"*"}</div>
      <div>{"*"}</div>
      This game was brought to you by Danny Van Stemp. I hope you enjoyed!
    </div>
  );
};
