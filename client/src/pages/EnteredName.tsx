import React from "react";
import { Chatbox } from "../Chatbox";
import logo from "../logan.png";
import { ChatMessage } from "../types";

export const EnteredName: React.FC<{
  messages: ChatMessage[];
  author: string;
}> = ({ messages, author }) => {
  return (
    <div className="App">
      <img src={logo} className="App-logo" alt="logo" />
      Howdy there {author}!
      <Chatbox messages={messages} />
    </div>
  );
};
