// Runnable check for the retry gating rule: npx tsx src/lib/api.retry-check.ts
// Retrying a non-idempotent write duplicates offers/messages/broadcasts when a
// gateway times out after the backend already committed, so this must hold.
import assert from 'node:assert/strict';
import { shouldRetry } from './api';

// Safe methods retry (the cold-start case worth surviving).
assert.equal(shouldRetry(undefined), true, 'no method (GET default) should retry');
assert.equal(shouldRetry('GET'), true, 'GET should retry');
assert.equal(shouldRetry('get'), true, 'method match must be case-insensitive');
assert.equal(shouldRetry('HEAD'), true, 'HEAD should retry');

// Writes must not retry by default.
for (const m of ['POST', 'PATCH', 'PUT', 'DELETE']) {
  assert.equal(shouldRetry(m), false, `${m} must not retry by default`);
}

// Explicit opt-in wins in both directions.
assert.equal(shouldRetry('POST', true), true, 'POST may opt in (e.g. login)');
assert.equal(shouldRetry('GET', false), false, 'GET may opt out');

console.log('api retry gating: all checks passed');
