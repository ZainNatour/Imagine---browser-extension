import { TRY_ON_API_URL } from '../../shared/constants.js';

// Send a request to the backend service to virtually "try on" a clothing item
// identified by `clothingUrl` on the photo with id `photoId`.
// Returns the URL of the processed image on success and throws on failure.
export async function requestTryOn(photoId, clothingUrl, backendUrl = TRY_ON_API_URL) {
  try {
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photoId, clothingUrl })
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`Server error ${response.status}${text ? `: ${text}` : ''}`);
    }

    const data = await response.json();
    if (!data || !data.imageUrl) {
      throw new Error('Invalid response from server');
    }
    return data.imageUrl;
  } catch (err) {
    console.error('Try On request failed', err);
    throw new Error(err.message || 'Failed to process try on');
  }
}
