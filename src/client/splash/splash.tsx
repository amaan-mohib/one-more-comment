import '../index.css';

import { context, requestExpandedMode } from '@devvit/web/client';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

export const Splash = () => {
  return (
    <div className="flex relative flex-col justify-center items-center min-h-screen gap-4">
      <h1 className="text-3xl bungee-shade-regular font-black text-primary text-center mb-4">
        1 More Comment
      </h1>
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-2xl font-bold text-center text-foreground">
          Hey {context.username ?? 'user'} 👋
        </h1>
        <p className="text-base text-center text-muted-foreground">
          Think you read Reddit? Prove it.
        </p>
      </div>
      <div className="flex items-center justify-center mt-5">
        <button
          className="bg-primary text-white border-4 border-primary font-bold px-4 py-2 active:scale-95 transition-transform"
          onClick={(e) => requestExpandedMode(e.nativeEvent, 'game')}
        >
          Tap to Start
        </button>
      </div>
    </div>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Splash />
  </StrictMode>
);
