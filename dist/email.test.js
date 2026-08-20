import test from 'node:test';
import assert from 'node:assert/strict';

import { isAllowedDomain } from './email.js';

test('allows an exact domain match', () => {
  assert.equal(
    isAllowedDomain('usuario@empresa.com', ['empresa.com']),
    true,
  );
});

test('matches the complete domain without case sensitivity', () => {
  assert.equal(
    isAllowedDomain('usuario@EMPRESA.COM', ['empresa.com']),
    true,
  );
});

test('returns false without throwing for invalid email inputs', () => {
  assert.doesNotThrow(() => {
    assert.equal(isAllowedDomain('usuario@', ['empresa.com']), false);
    assert.equal(isAllowedDomain(42, ['empresa.com']), false);
  });
});

test('rejects a domain that is absent or has no allowed entries', () => {
  assert.equal(
    isAllowedDomain('usuario@externo.com', ['empresa.com']),
    false,
  );
  assert.equal(isAllowedDomain('usuario@empresa.com', []), false);
});

test('does not allow an undeclared subdomain', () => {
  assert.equal(
    isAllowedDomain('usuario@sub.empresa.com', ['empresa.com']),
    false,
  );
});
