export interface ChatMessage {
  author: string;
  message: string;
}

export interface ChatState {
  answerAuthor: string;
  answers: string[];
  nameInput: string;
  author: string;
  messages: ChatMessage[];
  gameState: number;
  submittedAnswer: boolean;
}
