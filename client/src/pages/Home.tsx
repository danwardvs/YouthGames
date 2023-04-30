import React from "react";
import logo from "../logan.png";

export const Home: React.FC<{
  updateInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleName: () => void;
  nameInput: string;
}> = ({ updateInput, handleName, nameInput }) => {
  return (
    <div className="App">
      <img src={logo} className="App-logo" alt="logo" />
      Welcome to Danny's (probably broken) online youth games.
      <input
        className="App-Textarea"
        placeholder="Please enter your (real) name!"
        onChange={updateInput}
        value={nameInput}
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
};
