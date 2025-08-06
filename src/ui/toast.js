/**
 * Displays a toast notification if the UI libraries are available.
 * Falls back silently when executed in non-UI environments such as the
 * background service worker where React based libraries are unavailable.
 */
export const notify = (msg) => {
  try {
    // Dynamically import to avoid bundling React/DOM dependant code
    import('sonner')
      .then(({ toast }) => toast.success(msg))
      .catch(() => {
        /* ignore outside browser environments */
      });
  } catch {
    // ignore outside browser environments
  }
};
