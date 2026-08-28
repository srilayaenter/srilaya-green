// Pre-seeds the CookieConsent banner's localStorage flag so the fixed
// bottom-of-viewport banner never renders during tests — it otherwise
// intercepts pointer events on buttons near the bottom of the page
// (e.g. "Create Product", cart quantity controls).
// Must match the STORAGE_KEY in components/CookieConsent.tsx.
const STORAGE_KEY = "srilayagreen_privacy_accepted";

export function cookieConsentStorageState(baseURL: string) {
  return {
    cookies: [],
    origins: [
      {
        origin: baseURL,
        localStorage: [{ name: STORAGE_KEY, value: "1" }],
      },
    ],
  };
}
