import { TRY_ON_API_URL } from '../../shared/constants.js';

async function getStoredApiUrl() {
  return new Promise((resolve) => {
    chrome.storage.sync.get('apiEndpoint', ({ apiEndpoint }) => {
      if (chrome.runtime.lastError) {
        resolve(undefined);
      } else {
        resolve(apiEndpoint);
      }
    });
  });
}

// Send a request to the backend service to virtually "try on" a clothing item
// identified by `clothingUrl` on the photo with id `photoId`. Consumers can
// override the API URL by passing `options.apiUrl` or setting the value in the
// Options page. Returns the URL of the processed image on success and throws on
// failure. If the request fails, a placeholder image is returned.
export async function requestTryOn(photoId, clothingUrl, options = {}) {
  const storedUrl = await getStoredApiUrl();
  const apiUrl = options.apiUrl || storedUrl || TRY_ON_API_URL;
  const placeholder = chrome.runtime.getURL(
    'src/assets/images/models/clothing1.jpg'
  );

  if (!apiUrl) {
    return placeholder;
  }

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photoId, clothingUrl }),
    });
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }
    const data = await response.json();
    return data.imageUrl;
  } catch (err) {
    console.warn('Try On API request failed, using placeholder image.', err);
    return placeholder;
  }
}
