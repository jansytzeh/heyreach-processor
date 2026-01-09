// Sentry initialization - MUST be imported first in index.js
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN || "https://4dba44e6852533512af1fbbadf465d3d@o4509690008567808.ingest.us.sentry.io/4510681047302144",
  environment: process.env.NODE_ENV || "development",

  // Send structured logs to Sentry
  enableLogs: true,

  // Send default PII data (IP addresses, etc.)
  sendDefaultPii: true,

  // Sample rate for performance monitoring
  tracesSampleRate: 1.0,
});

export default Sentry;
