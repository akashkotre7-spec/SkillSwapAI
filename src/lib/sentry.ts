import * as Sentry from "@sentry/react";

export function initSentry() {
  const dsn = (import.meta as any).env.VITE_SENTRY_DSN;
  
  if (!dsn) {
    return;
  }

  Sentry.init({
    dsn,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
    // Performance Monitoring
    tracesSampleRate: 1.0, 
    // Session Replay
    replaysSessionSampleRate: 0.1, 
    replaysOnErrorSampleRate: 1.0, 
    environment: (import.meta as any).env.MODE,
  });
}

export function captureException(error: any) {
  if (!(import.meta as any).env.VITE_SENTRY_DSN) return;
  Sentry.captureException(error);
}

export function logMessage(message: string) {
  if (!(import.meta as any).env.VITE_SENTRY_DSN) return;
  Sentry.captureMessage(message);
}
