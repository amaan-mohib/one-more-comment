export interface GameState {
  round: number;
  totalRounds: number;
  attempts: number;
  tokens: {
    correctTokens: string[];
    shuffledTokens: string[];
  };
  arranged: string[];
  availableTokens: string[];
  data: {
    body: string;
    subreddit: string;
    url: string;
    postId: string;
    id: string;
  } | null;
  hintUsed: boolean;
  loading: boolean;
  score: number;
  endScreen: {
    show: boolean;
    isClose: boolean;
    score: number;
  };
  gameOver: boolean;
  highScore: number;
  initialized: boolean;
}

export type GameAction =
  | { type: 'INIT'; payload: { highScore: number; round: number; score: number } }
  | { type: 'SET_TOTAL_ROUNDS'; payload: number }
  | { type: 'SET_GAME_OVER'; payload: boolean }
  | { type: 'SET_LOADING'; payload: boolean }
  | {
      type: 'SET_ROUND_DATA';
      payload: {
        tokens: { correctTokens: string[]; shuffledTokens: string[] };
        data: GameState['data'];
      };
    }
  | { type: 'ADD_ARRANGED'; payload: string }
  | { type: 'SET_ARRANGED'; payload: string[] }
  | { type: 'SET_AVAILABLE_TOKENS'; payload: string[] }
  | { type: 'SET_HINT_USED'; payload: boolean }
  | { type: 'RESET_ROUND' }
  | { type: 'SUBMIT_GUESS'; payload: { calcScore: number; isClose: boolean; newScore: number } }
  | { type: 'CONTINUE_ROUND' }
  | { type: 'DECREMENT_ATTEMPTS' }
  | { type: 'RESET_GAME' };
