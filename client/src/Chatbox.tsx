import React from "react";
import "./App.css";
import { ChatMessage } from "./types";

export const Chatbox: React.FC<{
  messages: ChatMessage[];
}> = ({ messages }) => {
  return (
    <div className="App-chatbox">
      {messages
        .slice(Math.max(messages.length - 4, 0))
        .map((msg: ChatMessage, index) => {
          return (
            <div key={index} className="App-chatbox-elem">
              <p>{msg.author}</p>
              <p>{msg.message}</p>
            </div>
          );
        })}
    </div>
  );
};
