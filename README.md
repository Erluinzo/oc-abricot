# Abricot

Project management app for freelancers (Next.js + TypeScript).

## Getting started

The app reads its data from the Abricot backend, so start the backend first:

```bash
git clone https://github.com/OpenClassrooms-Student-Center/dev-react-P10.git
cd dev-react-P10
```

Follow its README (`.env`, `npm install`, Prisma, `npm run seed`), then run `npm run dev`. It runs on http://localhost:8000.

Then, in a second terminal, start the app:

```bash
npm install
npm run dev
```

The app runs on http://localhost:3000.

## AI task generation

The "IA" button on a project page asks Claude (Anthropic API, model Claude Haiku 5.5) for a list of tasks. It needs an API key from https://console.anthropic.com.

Create a `.env.local` file at the root of the project:

```
ANTHROPIC_API_KEY=your-key
```

The key stays on the server: it is read by a Next.js server action, never sent to the browser, and `.env.local` is ignored by git. Restart `npm run dev` after adding it. Without a key, the rest of the app works and the AI modal shows "La génération IA n'est pas configurée."

## Other commands

- `npm run build`: production build
- `npm start`: serves the build
- `npm run lint`: ESLint check
- `npm run format`: formats the code with Prettier
