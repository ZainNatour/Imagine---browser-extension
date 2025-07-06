export const STORES_DATA_PATH = 'src/assets/data/stores.json';

// Base URL for the backend that processes "try on" requests.  Consumers can
// override this via chrome.storage or by passing a different URL to the
// requestTryOn function.
// Default HTTPS endpoint for the try on API. The value can be overridden in the
// extension's Options page via the `apiEndpoint` setting.
export const TRY_ON_API_URL = 'https://localhost:3000/api/try-on';
