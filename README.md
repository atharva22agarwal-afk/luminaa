# Lumina - Your Sacred Sanctuary

A minimalist, serene digital sanctuary for journaling, meditation, and self-reflection.

## Features

- **Sacred Journaling** - Capture thoughts in a private, serene space with mood tracking
- **Binaural Beats** - Scientifically-tuned frequencies (432Hz, 528Hz, 963Hz) for focus and meditation
- **AI Oracle** - Receive gentle, insightful reflections powered by AI
- **Focus Timer** - Pomodoro-style timer with ambient soundscapes
- **Dark/Light Mode** - Toggle between themes with the Zen Lamp switcher

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Start the Vite dev server
npm run dev
```

Then open `http://localhost:5173` in your browser.

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## File Structure

```
lumina/
├── landing.html      # Landing page (standalone, no build required)
├── index.html        # React app entry point (requires build)
├── src/
│   ├── App.jsx       # Main React application
│   ├── main.jsx      # React entry point
│   ├── index.css     # Global styles
│   ├── audioEngine.js # Audio/frequency engine
│   └── components/   # React components
├── dist/             # Production build output
└── package.json
```

## Usage

1. **Landing Page**: Open `landing.html` directly in your browser (no server needed)
2. **Main App**: Run `npm run dev` and visit `http://localhost:5173`

## Technologies

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Framer Motion** - Animations
- **Lucide React** - Icon library
- **Web Audio API** - Binaural beats generation

## License

MIT
