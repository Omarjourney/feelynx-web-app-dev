import fs from 'node:fs';
import process from 'node:process';

const apiBase = process.env.SYNTHETIC_API_BASE ?? 'https://app.feelynx.com';
const username = process.env.SYNTHETIC_USER;
const password = process.env.SYNTHETIC_PASSWORD;
const outputLines = [];

const log = (message) => {
  const line = `${new Date().toISOString()} ${message}`;
  outputLines.push(line);
  console.log(line);
};

const assertStatus = async (response, expected, label) => {
  if (response.status !== expected) {
    const body = await response.text();
    throw new Error(`${label} expected status ${expected} received ${response.status}: ${body}`);
  }
};

try {
  log('Starting synthetic journey');
  const loginResponse = await fetch(`${apiBase}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  await assertStatus(loginResponse, 200, 'Login');
  const loginPayload = await loginResponse.json();
  const token = loginPayload?.token ?? loginPayload?.sessionToken;

  if (!token) {
    throw new Error('Missing session token');
  }
  log('Login successful');

  const liveResponse = await fetch(`${apiBase}/live/start`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ region: 'auto', title: 'Synthetic Check' })
  });
  await assertStatus(liveResponse, 200, 'Go live');
  const livePayload = await liveResponse.json();
  log(`Go live response ${JSON.stringify(livePayload)}`);

  const tipResponse = await fetch(`${apiBase}/api/tip`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount: 1, currency: 'GEM', recipientId: 'synthetic' })
  });
  await assertStatus(tipResponse, 200, 'Tip');
  const tipPayload = await tipResponse.json();
  log(`Tip success ${JSON.stringify(tipPayload)}`);

  const ledgerResponse = await fetch(`${apiBase}/api/ledger/last`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  await assertStatus(ledgerResponse, 200, 'Ledger');
  const ledgerPayload = await ledgerResponse.json();
  log(`Ledger entry ${JSON.stringify(ledgerPayload)}`);

  fs.mkdirSync('artifacts', { recursive: true });
  fs.writeFileSync('artifacts/synthetic-output.md', outputLines.join('\n'));
  log('Synthetic journey completed');
} catch (error) {
  fs.mkdirSync('artifacts', { recursive: true });
  fs.writeFileSync('artifacts/synthetic-output.md', `${error.stack ?? error.message}`);
  console.error(error);
  process.exitCode = 1;
}
