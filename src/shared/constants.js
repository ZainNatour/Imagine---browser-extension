// Path to the store metadata JSON bundled with the extension.  The build copies
// everything from `src/assets` into the extension root, so the JSON lives under
// `/data/stores.json` in the packaged extension.
export const STORES_DATA_PATH = 'data/stores.json';

// Base URL for the backend that processes "try on" requests.  Consumers can
// override this via chrome.storage or by passing a different URL to the
// requestTryOn function.
// Default HTTPS endpoint for the try on API. The value can be overridden in the
// extension's Options page via the `apiEndpoint` setting.
// Default production API endpoint. Leave blank to disable network calls by
// default. Users can provide a value in the extension's Options page.
export const TRY_ON_API_URL = '';
