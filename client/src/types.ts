export interface ChatMessage {
  author: string;
  message: string;
}

export interface ChatState {
  input: string;
  author: string;
  messages: ChatMessage[];
  started:number;

}
