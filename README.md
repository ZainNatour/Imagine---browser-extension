# Imagine Browser Extension

A Chrome extension for the Imagine service.

## Features

- **Marketplace** – browse every detected product, filter by store, category, price & rating, with instant virtualised scrolling.
- *Price-Drop Alerts – background polling notifies you when any saved item gets cheaper.*

## Development

Install dependencies (Node.js v18 or later is required) and run linting:

```bash
npm install
npm run lint
```

The lint script checks the `src` and `test` directories using ESLint.

## Building and Packaging

Compile the TypeScript sources before packaging the extension:

```bash
npm run build
```

This writes the compiled JavaScript next to the `.ts`/`.tsx` files under `src/`.

To create a production zip that can be uploaded to the Chrome Web Store:

1. Run `npm run build`.
2. Copy `manifest.json` and the `src` directory into a clean folder (for example `dist/`).
3. Remove the TypeScript source files from that folder:
   ```bash
   find dist -name '*.ts' -o -name '*.tsx' -delete
   ```
4. From inside the `dist` directory, create the archive:
   ```bash
   zip -r ../imagine-extension.zip .
   ```
5. Upload `imagine-extension.zip` to the Chrome Web Store.

## React Filter Components

The `src/react-filters` directory contains a modern React implementation of the
"Stores › Filters" panel. Components are written in TypeScript and styled with
Tailwind. See `src/react-filters/README.md` for usage details.

## Try-On Feature

The virtual try-on API is not yet integrated. Calls to `requestTryOn` currently
return a static placeholder image. Once the backend is available, this module
can be updated to communicate with the service.

### Configuring the API endpoint

If you deploy your own try-on service, open the extension's **Options** page and
enter its URL in the **Try On API Endpoint** field. The extension will use this
value for all future requests. Leaving the field blank disables network calls
unless a URL is provided programmatically.
