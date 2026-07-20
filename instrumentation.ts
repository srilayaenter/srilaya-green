// Sentry is optional — only initialises when SENTRY_DSN is set and @sentry/nextjs is installed.
export async function register() {
  if (!process.env.SENTRY_DSN) return;

  try {
    if (process.env.NEXT_RUNTIME === "nodejs") {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const Sentry = require("@sentry/nextjs");
      Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV,
        tracesSampleRate: 0.1,
        debug: false,
      });
    }
    if (process.env.NEXT_RUNTIME === "edge") {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const Sentry = require("@sentry/nextjs");
      Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV,
        tracesSampleRate: 0.1,
      });
    }
  } catch {
    // @sentry/nextjs not installed — skip silently
  }
}
