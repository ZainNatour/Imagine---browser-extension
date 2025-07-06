# Imagine Browser Extension

A Chrome extension for the Imagine service.

## Development

Install dependencies and run linting:

```bash
npm install
npm run lint
```

The lint script checks the `src` and `test` directories using ESLint.

## React Filter Components

The `src/react-filters` directory contains a modern React implementation of the
"Stores › Filters" panel. Components are written in TypeScript and styled with
Tailwind. See `src/react-filters/README.md` for usage details.

## Try-On Feature

The virtual try-on API is not yet integrated. Calls to `requestTryOn` currently
return a static placeholder image. Once the backend is available, this module
can be updated to communicate with the service.
