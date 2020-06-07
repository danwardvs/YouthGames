export interface ChatMessage {
  author: string;
  message: string;
}
export interface ChatQuestion {
  author: string;
  truth_1: string;
  truth_2: string;
  lie: string;
}
