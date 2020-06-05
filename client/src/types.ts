export interface ChatMessage {
  author: string;
  message: string;
}

export interface ChatState {
  truth_1: string;
  truth_2: string;
  lie: string;
  nameInput: string;
  author: string;
  messages: ChatMessage[];
  started: number;
  submittedAnswer: boolean;
}
