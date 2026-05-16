import { config } from 'dotenv';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load the backend env file relative to this package so startup works
// even when the process is launched from the repo root.
config({ path: resolve(__dirname, '../../.env') });
