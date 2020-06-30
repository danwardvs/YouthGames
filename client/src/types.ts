export interface ChatMessage {
  author: string;
  message: string;
}
interface User {
  author: string;
  score: number;
  correct: boolean;
}

export interface ChatState {
  answerAuthor: string;
  answers: string[];
  nameInput: string;
  author: string;
  messages: ChatMessage[];
  gameState: number;
  results: User[];
  correctAnswer: string;
  submittedAnswer: boolean;
}
