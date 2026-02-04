import { context, showToast } from '@devvit/web/client';
import { useEffect, useReducer, useState } from 'react';
import { buildTokenRound } from '../../shared/data-gen';
import { GamePostData } from '../../shared/types/api';
import { ChevronRight, Lightbulb, Loader } from 'lucide-react';
import Droppable from './DnD/Droppable';
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import Draggable from './DnD/Draggable';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import Sortable from './DnD/Sortable';
import { gameReducer, initialGameState } from './reducer';

export function evaluateGuess(correct: string[], guess: string[]) {
  const n = correct.length;

  let pos = 0;
  for (let i = 0; i < n; i++) {
    if (correct[i] === guess[i]) pos++;
  }

  const positionScore = pos / n;

  const set = new Set(correct);
  let overlap = 0;
  for (const g of guess) if (set.has(g)) overlap++;
  const overlapScore = overlap / n;

  const score = positionScore * 0.7 + overlapScore * 0.3;

  return {
    score,
    isClose: score >= 0.5 && score < 1,
  };
}

export const App = () => {
  const { postData } = context;
  const [state, dispatch] = useReducer(gameReducer, initialGameState);
  const [darkMode, setDarkMode] = useState(false);
  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor)
  );

  useEffect(() => {
    // listen to prefers-color-scheme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setDarkMode(mediaQuery.matches);
    const handleChange = (e: MediaQueryListEvent) => {
      setDarkMode(e.matches);
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  const getShadow = (size: string = '3px') => {
    if (darkMode) {
      return `${size} ${size} 0px rgba(255, 255, 255, 0.3)`;
    }
    return `${size} ${size} 0px rgba(0, 0, 0, 0.2)`;
  };

  useEffect(() => {
    fetch('/api/init')
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'error') {
          showToast(data.message || 'Error initializing game.');
          return;
        }
        dispatch({
          type: 'INIT',
          payload: {
            highScore: data.progress.highScore || 0,
            round: data.progress.round || 0,
            score: data.progress.score || 0,
          },
        });
      })
      .catch((err) => {
        showToast('Error initializing game.');
        console.error(err);
      });
  }, [postData]);

  useEffect(() => {
    if (!postData) {
      showToast('No post data found.');
      return;
    }
    if (!state.initialized) return;

    dispatch({ type: 'SET_LOADING', payload: true });
    const { data, seed } = postData as { data: GamePostData[]; seed: number };
    dispatch({ type: 'SET_TOTAL_ROUNDS', payload: data.length });
    if (state.round >= data.length) {
      dispatch({ type: 'SET_GAME_OVER', payload: true });
      dispatch({ type: 'SET_LOADING', payload: false });
      return;
    }
    const comment = data[state.round]!;
    fetch(`/api/comment/${comment.id}`)
      .then((res) => res.json())
      .then((data) => {
        const { correctTokens, shuffledTokens } = buildTokenRound(
          data.comment.body || '',
          seed + comment.i
        )!;
        dispatch({
          type: 'SET_ROUND_DATA',
          payload: {
            tokens: { correctTokens, shuffledTokens },
            data: { ...data.comment, id: comment.id },
          },
        });
      })
      .catch((err) => {
        showToast('Error fetching comment data.');
        dispatch({ type: 'SET_LOADING', payload: false });
        console.error(err);
      });
  }, [postData, state.round, state.initialized]);

  const handleSubmit = () => {
    if (state.arranged.length !== state.tokens.correctTokens.length) {
      showToast('Please arrange all tokens before submitting.');
      return;
    }
    if (state.attempts > 1 && state.arranged.join() !== state.tokens.correctTokens.join()) {
      showToast('Incorrect. Try again.');
      dispatch({ type: 'DECREMENT_ATTEMPTS' });
    } else {
      const { score: calcScore, isClose } = evaluateGuess(
        state.tokens.correctTokens,
        state.arranged
      );
      const newScore = Number(
        (Number(calcScore.toFixed(1)) * state.tokens.correctTokens.length).toFixed(0)
      );
      dispatch({
        type: 'SUBMIT_GUESS',
        payload: { calcScore, isClose, newScore },
      });
      fetch('/api/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          round: state.round + 1,
          score: state.score + newScore,
          highScore: Math.max(state.highScore, state.score + newScore),
        }),
      }).catch((err) => {
        console.error('Error saving progress:', err);
      });
    }
  };

  const handleContinue = () => {
    dispatch({ type: 'CONTINUE_ROUND' });
  };

  const handleReply = async () => {
    fetch('/api/reply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        commentId: state.data?.id,
        accuracy: (state.endScreen.score * 100).toFixed(0),
      }),
    }).catch(console.error);
    handleContinue();
  };

  const attemptsDisplay = (
    <div className="mb-6 pb-8 border-b-4 border-secondary flex items-center justify-between">
      <div>
        <div className="text-xs text-secondary uppercase tracking-widest font-bold mb-2">
          Attempts left
        </div>
        <div className="flex gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className={`w-4 h-4 border-2 border-secondary ${i < state.attempts ? 'bg-secondary' : 'bg-transparent'}`}
              style={{ boxShadow: i < state.attempts ? '2px 2px 0px rgba(0,0,0,0.1)' : 'none' }}
            />
          ))}
        </div>
      </div>
      {state.hintUsed ? (
        <div className="text-xs text-accent font-bold">r/{state.data?.subreddit}</div>
      ) : (
        <button
          disabled={state.loading}
          onClick={() => {
            dispatch({ type: 'SET_HINT_USED', payload: true });
          }}
          className="flex items-center gap-2 px-3 py-1 border-3 font-bold text-sm transition-all border-accent bg-card text-accent hover:scale-105 active:scale-95"
          style={{
            boxShadow: darkMode
              ? '2px 2px 0px rgba(255,255,255,0.2)'
              : '2px 2px 0px rgba(0,0,0,0.1)',
          }}
          title={'Reveal the target sentence'}
        >
          <Lightbulb className="w-4 h-4" />
          Hint
        </button>
      )}
    </div>
  );

  const gameComponent = state.loading ? (
    <div className="flex justify-center items-center h-64">
      <Loader className="w-8 h-8 text-primary animate-spin" />
    </div>
  ) : (
    <DndContext
      sensors={sensors}
      modifiers={[restrictToWindowEdges]}
      onDragEnd={({ over, active }) => {
        if (
          over?.id === 'droppable' &&
          active.id &&
          state.tokens.correctTokens.includes(active.id as string) &&
          !state.arranged.includes(active.id as string)
        ) {
          dispatch({ type: 'ADD_ARRANGED', payload: active.id as string });
        }
      }}
    >
      <div className="mb-8">
        <Droppable darkMode={darkMode}>
          {state.arranged.length > 0 ? (
            <Sortable
              items={state.arranged}
              setItems={(items) => dispatch({ type: 'SET_ARRANGED', payload: items })}
              itemStyle={{ boxShadow: getShadow() }}
            />
          ) : (
            <span className="text-muted-foreground text-xs font-medium text-center">
              Drag and arrange the words below to guess a comment
            </span>
          )}
        </Droppable>
        <div className="flex flex-wrap gap-3 mt-4">
          {state.availableTokens.map((token, index) => (
            <Draggable
              key={index}
              id={token}
              className="px-3 py-1 border-4 border-secondary bg-card text-foreground hover:bg-secondary hover:text-white font-bold text-sm"
              style={{ boxShadow: getShadow() }}
            >
              {token}
            </Draggable>
          ))}
        </div>
      </div>
    </DndContext>
  );

  const actions = (
    <div className="flex gap-4 flex-1 flex-col justify-end">
      {state.endScreen.show && (
        <button
          onClick={handleReply}
          className="bg-card text-foreground border-4 border-primary font-bold py-2 active:scale-95 transition-transform disabled:opacity-50"
          style={{ boxShadow: getShadow() }}
        >
          Reply and continue
          <ChevronRight className="w-4 h-4 ml-2 inline" />
        </button>
      )}
      <button
        onClick={state.endScreen.show ? handleContinue : handleSubmit}
        disabled={state.arranged.length !== state.tokens.correctTokens.length || state.loading}
        className="bg-primary text-white border-4 border-primary font-bold py-2 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ boxShadow: getShadow() }}
      >
        {state.endScreen.show ? 'Continue' : 'Check Answer'}
        <ChevronRight className="w-4 h-4 ml-2 inline" />
      </button>
    </div>
  );

  const nextRoundScreen = state.endScreen.show && (
    <div className="flex flex-col gap-4">
      <div className="bg-card flex items-center justify-center p-3 rounded-xl">
        <iframe
          src={`${state.data?.url?.replace('www.', 'embed.')}?embed=true`}
          scrolling="no"
          height={240}
          style={{ border: 'none', width: '100%', borderRadius: 4 }}
        ></iframe>
      </div>
      <div className="text-secondary text-xs text-center uppercase tracking-widest font-bold">
        Accuracy: {(state.endScreen.score * 100).toFixed(0)}%
      </div>
      {state.endScreen.isClose ? (
        <div className="text-accent font-bold text-center">You were close!</div>
      ) : state.endScreen.score === 1 ? (
        <div className="text-primary font-bold text-center">Correct!</div>
      ) : (
        <div className="text-destructive font-bold text-center">Your guess was too far off!</div>
      )}
    </div>
  );

  const gameOverScreen = (
    <div className="flex flex-col items-center justify-center gap-4 flex-1">
      <h2 className="text-xl font-black text-primary mb-4">You had your run!</h2>
      <div className="text-lg text-foreground mb-6 uppercase tracking-widest font-bold text-center">
        <p>Score</p>
        <p>{state.score}</p>
        <p className="text-base mt-4">HighScore: {Math.max(state.highScore, state.score)}</p>
      </div>
      <button
        onClick={() => {
          dispatch({ type: 'RESET_GAME' });
        }}
        className="bg-primary text-white border-4 border-primary font-bold px-4 py-2 active:scale-95 transition-transform"
        style={{ boxShadow: getShadow() }}
      >
        Play Again
      </button>
    </div>
  );

  return (
    <div className="flex relative flex-col justify-center min-h-screen gap-2 p-2 w-full max-w-2xl mx-auto">
      <div className="mb-6">
        {!state.gameOver && (
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs text-secondary uppercase tracking-widest font-bold">
              Round {state.round + 1} of {state.totalRounds}
            </div>
            <div className="text-xs text-secondary font-bold uppercase tracking-widest">
              Score: {state.score}
            </div>
          </div>
        )}
        <h1
          className={`text-3xl bungee-shade-regular font-black text-primary ${state.gameOver ? 'text-center' : ''}`}
        >
          1 More Comment
        </h1>
      </div>
      {state.gameOver ? (
        gameOverScreen
      ) : (
        <>
          {!state.endScreen.show && attemptsDisplay}
          {state.endScreen.show ? nextRoundScreen : gameComponent}
          {actions}
        </>
      )}
    </div>
  );
};
