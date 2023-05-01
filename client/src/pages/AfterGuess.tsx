import React from "react";
import { Chatbox } from "../Chatbox";
import { ChatMessage } from "../types";

export const AfterGuess: React.FC<{
  messages: ChatMessage[];
}> = ({ messages }) => {
  const randomMessage = () => {
    const replies = [
      "Thanks for your guess! Let's see how you did.",
      "I hope you're as confident in that answer as I am.",
      "There's no way that isn't right! Let's find out.",
      "Did you take time to think about it?",
      "I believe in you! Your answer, that's a different story.",
      "Wowza! What a reply. Let's see how you stack up.",
      "I hope they're not offended by your answer.",
      "Sending these off to a server somewhere far away.",
      'Fun fact, while we\'re waiting: A baby puffin is called a "puffling".',
      "Fun fact, while we're waiting: Baby sea otters can't swim.",
      "Yee haw!"
    ];
    return replies[Math.round(Math.random() * replies.length)];
  };

  return (
    <div className="App">
      {randomMessage()}
      <Chatbox messages={messages} />
    </div>
  );
};
