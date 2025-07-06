// Currently returns a static placeholder image until the API is provided.

// Send a request to the backend service to virtually "try on" a clothing item
// identified by `clothingUrl` on the photo with id `photoId`.
// Returns the URL of the processed image on success and throws on failure.
export async function requestTryOn() {
  console.warn('Try On API not yet configured. Returning static image.');
  return chrome.runtime.getURL('src/assets/images/models/clothing1.jpg');
}
