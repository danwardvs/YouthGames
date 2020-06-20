export interface ChatMessage {
  author: string;
  message: string;
}
interface user {
  author: string;
  score: number;
}

export interface ChatState {
  answerAuthor: string;
  answers: string[];
  nameInput: string;
  author: string;
  messages: ChatMessage[];
  gameState: number;
  results: user[];
  submittedAnswer: boolean;
}
