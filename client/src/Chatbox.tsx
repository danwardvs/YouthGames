import React from "react";
import "./App.css";
import ScrollToBottom from "react-scroll-to-bottom";
import { ChatMessage } from "./types";

export const Chatbox: React.FC<{
  messages: ChatMessage[];
}> = ({ messages }) => {
  return (
    <ScrollToBottom className="App-chatbox">
      {messages.slice(0, 5).map((msg: ChatMessage, index) => {
        return (
          <div key={index} className="App-chatbox-elem">
            <p>{msg.author}</p>
            <p>{msg.message}</p>
          </div>
        );
      })}
    </ScrollToBottom>
  );
};
