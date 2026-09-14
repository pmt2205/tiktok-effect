import { loadEnvFile } from 'node:process';

// Load local development variables before Nest modules are imported. Production
// platforms may inject environment variables directly, so a missing .env is OK.
try {
  loadEnvFile();
} catch {
  // No local .env file is expected in some deployment environments.
}
