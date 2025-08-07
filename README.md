# Imagine – Online Apparel Shopping Assistant Monorepo

This repository uses [npm workspaces](https://docs.npmjs.com/cli/v9/using-npm/workspaces) to manage three separate projects:

- **extension/** – Chromium extension built with Vite.
- **frontend/** – Next.js web application.
- **backend/** – Express.js API server.

## Getting Started

```bash
npm install
npm run build:extension
npm run build:frontend
npm run build:backend
```

### Running

1. **Extension** – `npm run serve:extension` then load the `dist/extension` folder via "Load unpacked" in Chrome.
2. **Frontend** – `npm run dev:frontend` to start the Next.js dev server.
3. **Backend** – `npm run start:backend` to start the Express.js server.

Each project can be developed and deployed independently.
