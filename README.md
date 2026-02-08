# 1 More Comment

A daily, Reddit-native word game that turns real Reddit comments into fast, addictive puzzles.

## Overview

Every day, 1 More Comment pulls live Reddit threads and distills top comments into short, meaningful word tokens. Players are challenged to reconstruct the original comment by selecting words in the correct sequence. Build a streak by solving comments successfully—but make a mistake and your run ends.

## How It Works

1. **Daily Fresh Content**: The game pulls new Reddit comments each day, ensuring no two puzzles feel the same
2. **Word Token Reconstruction**: Comments are broken into tokens and shuffled. Arrange them back to their original order
3. **Three Attempts**: Each round gives you three attempts with strict ordering checks
4. **Scoring System**: After your final attempt, guesses are evaluated for closeness—reward near-correct logic, not just perfect answers
5. **Streak Gameplay**: Keep your run alive by solving consecutive comments. One mistake and it's game over
6. **End-of-Run Summary**: See your final score, view the original comments you decoded, and jump to the source Reddit thread to spark discussion

## Features

- 🎮 Quick, engaging daily gameplay
- 🔄 Streak-based challenge system
- 💬 Real Reddit comments as puzzle content
- 🧠 Intelligent scoring that rewards partial correctness
- 🔗 Links back to original Reddit threads for discussion
- 🌙 Dark mode support
- 📱 Touch and keyboard-friendly drag-and-drop interface
- ⚡ Lightweight and fast

## Project Structure

```
src/
├── client/              # Frontend React application
│   ├── game/            # Main game component
│   │   ├── App.tsx      # Core game logic and UI
│   │   ├── reducer.ts   # Game state management
│   │   ├── types.ts     # TypeScript types
│   │   └── DnD/         # Drag-and-drop components
│   ├── game.html        # Game entry point
│   ├── splash.html      # Splash screen
│   └── vite.config.ts   # Vite configuration
├── server/              # Backend API
│   ├── index.ts         # Server entry point
│   └── core/
│       └── post.ts      # Post/comment handling
└── shared/              # Shared utilities and types
    ├── data-gen.ts      # Token generation logic
    └── types/
        └── api.ts       # API type definitions
```

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Drag & Drop**: @dnd-kit
- **Icons**: Lucide React
- **Backend**: Devvit
- **Build Tool**: TypeScript, ESLint

## Setup & Installation

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Start development server
npm run dev
```

### Available Commands

- `npm run dev`: Starts a development server where you can develop your application live on Reddit
- `npm run build`: Builds your client and server projects
- `npm run deploy`: Uploads a new version of your app
- `npm run launch`: Publishes your app for review
- `npm run login`: Logs your CLI into Reddit
- `npm run check`: Type checks, lints, and prettifies your app

## Game Mechanics

### Scoring

- **Perfect Match**: 100% accuracy
- **Close Calls**: 50%+ accuracy triggers "You were close!" feedback
- **Word Overlap**: Score is calculated as 70% position accuracy + 30% word overlap

### Attempts

- Start with 3 attempts per comment
- First 2 attempts: Exact ordering required
- Final attempt: Evaluated for closeness even if order isn't perfect
- No score penalty for using multiple attempts

## License

See [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to open issues or submit pull requests.

---

Built with ❤️ for Reddit and word game enthusiasts.
