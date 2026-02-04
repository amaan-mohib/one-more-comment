import { GameAction, GameState } from './types';

export const initialGameState: GameState = {
  round: 0,
  totalRounds: 30,
  attempts: 3,
  tokens: {
    correctTokens: [],
    shuffledTokens: [],
  },
  arranged: [],
  availableTokens: [],
  data: null,
  hintUsed: false,
  loading: true,
  score: 0,
  endScreen: { show: false, isClose: false, score: 0 },
  gameOver: false,
  highScore: 0,
  initialized: false,
};

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'INIT':
      return {
        ...state,
        highScore: action.payload.highScore,
        round: action.payload.round,
        score: action.payload.score,
        initialized: true,
      };
    case 'SET_TOTAL_ROUNDS':
      return { ...state, totalRounds: action.payload };
    case 'SET_GAME_OVER':
      return { ...state, gameOver: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ROUND_DATA':
      return {
        ...state,
        tokens: action.payload.tokens,
        data: action.payload.data,
        availableTokens: action.payload.tokens.shuffledTokens,
        arranged: [],
        hintUsed: false,
        loading: false,
      };
    case 'ADD_ARRANGED':
      return {
        ...state,
        arranged: [...state.arranged, action.payload],
        availableTokens: state.availableTokens.filter((token) => token !== action.payload),
      };
    case 'SET_ARRANGED':
      return { ...state, arranged: action.payload };
    case 'SET_AVAILABLE_TOKENS':
      return { ...state, availableTokens: action.payload };
    case 'SET_HINT_USED':
      return { ...state, hintUsed: action.payload };
    case 'RESET_ROUND':
      return {
        ...state,
        arranged: [],
        availableTokens: state.tokens.shuffledTokens,
        attempts: 3,
        endScreen: { show: false, isClose: false, score: 0 },
      };
    case 'DECREMENT_ATTEMPTS':
      return { ...state, attempts: state.attempts - 1 };
    case 'SUBMIT_GUESS':
      return {
        ...state,
        endScreen: { show: true, isClose: action.payload.isClose, score: action.payload.calcScore },
        score: state.score + action.payload.newScore,
      };
    case 'CONTINUE_ROUND':
      if (state.round + 1 < state.totalRounds) {
        return {
          ...state,
          round: state.round + 1,
          attempts: 3,
          endScreen: { show: false, isClose: false, score: 0 },
        };
      } else {
        return { ...state, gameOver: true };
      }
    case 'RESET_GAME':
      return {
        ...state,
        round: 0,
        score: 0,
        endScreen: { show: false, isClose: false, score: 0 },
        attempts: 3,
        gameOver: false,
      };
    default:
      return state;
  }
}
