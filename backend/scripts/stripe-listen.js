import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env');
const forwardUrl = process.env.STRIPE_FORWARD_URL || 'http://localhost:3001/api/stripe/webhook';

function upsertEnvValue(filePath, key, value) {
  const existing = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '';
  const line = `${key}=${value}`;

  if (!existing.trim()) {
    fs.writeFileSync(filePath, `${line}\n`, 'utf8');
    return;
  }

  const pattern = new RegExp(`^${key}=.*$`, 'm');
  const next = pattern.test(existing)
    ? existing.replace(pattern, line)
    : `${existing.replace(/\s*$/, '\n')}${line}\n`;

  fs.writeFileSync(filePath, next, 'utf8');
}

console.log(`Forwarding Stripe webhooks to ${forwardUrl}`);
console.log('When the signing secret appears, it will be saved to backend/.env automatically.\n');

const child = spawn('stripe', ['listen', '--forward-to', forwardUrl], {
  shell: true,
  stdio: ['inherit', 'pipe', 'pipe'],
});

let savedSecret = null;

const handleOutput = (chunk, writer) => {
  const text = chunk.toString();
  writer.write(text);

  if (savedSecret) return;

  const match = text.match(/whsec_[A-Za-z0-9]+/);
  if (!match) return;

  savedSecret = match[0];
  upsertEnvValue(envPath, 'STRIPE_WEBHOOK_SECRET', savedSecret);
  console.log(`\nSaved STRIPE_WEBHOOK_SECRET to ${envPath}\n`);
};

child.stdout.on('data', (chunk) => handleOutput(chunk, process.stdout));
child.stderr.on('data', (chunk) => handleOutput(chunk, process.stderr));

child.on('error', (error) => {
  console.error('Failed to start Stripe CLI. Make sure `stripe` is installed and on your PATH.');
  console.error(error.message);
  process.exit(1);
});

child.on('close', (code) => {
  if (!savedSecret) {
    console.log('\nNo signing secret was captured. If Stripe prompted for login, finish that first and rerun this command.');
  }
  process.exit(code ?? 0);
});

