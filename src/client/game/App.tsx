import { context, showToast } from '@devvit/web/client';
import { useEffect, useState } from 'react';
import { buildTokenRound } from '../../shared/data-gen';
import { GamePostData } from '../../shared/types/api';
import { ChevronRight, Lightbulb, RotateCcw } from 'lucide-react';
import Droppable from './DnD/Droppable';
import { DndContext } from '@dnd-kit/core';
import Draggable from './DnD/Draggable';

export const App = () => {
  const { postData } = context;
  const [round, setRound] = useState(0);
  const [totalRounds, setTotalRounds] = useState(30);
  const [attempts, setAttempts] = useState(3);
  const [tokens, setTokens] = useState({
    correctTokens: [] as string[],
    shuffledTokens: [] as string[],
  });
  const [darkMode, setDarkMode] = useState(false);

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
    if (!postData) {
      showToast('No post data found.');
      return;
    }
    const { data, seed } = postData as { data: GamePostData[]; seed: number };
    setTotalRounds(data.length);
    const comment = data[round]!;
    fetch(`/api/comment/${comment.id}`)
      .then((res) => res.json())
      .then((data) => {
        const { correctTokens, shuffledTokens } = buildTokenRound(
          data.comment.body || '',
          seed + comment.i
        )!;
        setTokens({ correctTokens, shuffledTokens });
      })
      .catch((err) => {
        showToast('Error fetching comment data.');
        console.error(err);
      });
  }, [postData, round]);

  return (
    <div className="flex relative flex-col justify-center min-h-screen gap-2 p-2 w-full max-w-2xl mx-auto">
      <div className="mb-6">
        <div className="text-xs text-secondary uppercase tracking-widest font-bold mb-3">
          Round {round + 1} of {totalRounds}
        </div>
        <h1 className="text-3xl bungee-shade-regular font-black text-primary">1 More Comment</h1>
      </div>

      {/* Attempts display */}
      <div className="mb-6 pb-8 border-b-4 border-secondary flex items-center justify-between">
        <div>
          <div className="text-xs text-secondary uppercase tracking-widest font-bold mb-2">
            Attempts left
          </div>
          <div className="flex gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className={`w-4 h-4 border-2 border-secondary ${i < attempts ? 'bg-secondary' : 'bg-transparent'}`}
                style={{ boxShadow: i < attempts ? '2px 2px 0px rgba(0,0,0,0.1)' : 'none' }}
              />
            ))}
          </div>
        </div>
        <button
          // onClick={handleHint}
          // disabled={hintUsed}
          className={`flex items-center gap-2 px-4 py-2 border-3 font-bold text-sm transition-all ${
            // hintUsed
            //   ? 'border-muted bg-muted text-muted-foreground cursor-not-allowed opacity-50'
            //   :
            'border-accent bg-card text-accent hover:scale-105 active:scale-95'
          }`}
          // style={{boxShadow: hintUsed ? 'none' : '2px 2px 0px rgba(0,0,0,0.1)'}}
          style={{
            boxShadow:
              // hintUsed ? 'none' :
              darkMode ? '2px 2px 0px rgba(255,255,255,0.2)' : '2px 2px 0px rgba(0,0,0,0.1)',
          }}
          // title={hintUsed ? 'Hint already used' : 'Reveal the target sentence'}
        >
          <Lightbulb className="w-4 h-4" />
          Hint
        </button>
      </div>

      <DndContext>
        <div className="mb-8">
          <Droppable>
            <div
              className="min-h-20 bg-card border-4 border-dashed border-primary flex items-center justify-center rounded-none"
              style={{
                boxShadow: darkMode
                  ? '4px 4px 0px rgba(255, 255, 255, 0.2)'
                  : '4px 4px 0px rgba(167, 139, 250, 0.3)',
              }}
            >
              <span className="text-muted-foreground text-xs font-medium text-center">
                Drag and arrange the words below to guess a comment
              </span>
            </div>
          </Droppable>
          <div className="flex flex-wrap gap-3 mt-4">
            {tokens.shuffledTokens.map((token, index) => (
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

      {/* Actions */}
      <div className="flex gap-4 flex-1 items-end">
        <button
          // onClick={handleReset}
          // disabled={showResult === 'correct'}
          className="px-4 py-2 bg-card border-4 border-foreground text-foreground font-bold hover:bg-secondary hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ boxShadow: getShadow() }}
        >
          <RotateCcw className="w-4 h-4 mr-2 inline" />
          Reset
        </button>
        <button
          // onClick={handleSubmit}
          // disabled={arranged.length !== round.words.length || showResult === 'correct'}
          className="flex-1 bg-primary text-white border-4 border-primary font-bold py-2 hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          style={{ boxShadow: getShadow() }}
        >
          Check Answer
          <ChevronRight className="w-4 h-4 ml-2 inline" />
        </button>
      </div>
    </div>
  );
};
