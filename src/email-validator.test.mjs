import test from 'node:test';
import assert from 'node:assert/strict';

import { isValidEmailFormat } from './email-validator.mjs';

test('returns true and a boolean for a minimally valid email format', () => {
  const validationResult = isValidEmailFormat('usuario@empresa.com');

  assert.equal(validationResult, true);
  assert.equal(typeof validationResult, 'boolean');
});

test('returns false and a boolean when required components are missing', () => {
  const invalidEmails = [
    'usuario.empresa.com',
    '@empresa.com',
    'usuario@',
    'usuario@empresa',
  ];

  for (const invalidEmail of invalidEmails) {
    const validationResult = isValidEmailFormat(invalidEmail);

    assert.equal(validationResult, false);
    assert.equal(typeof validationResult, 'boolean');
  }
});

test('returns false for invalid separators or domain components', () => {
  const invalidEmails = ['usuario@@empresa.com', 'usuario@.com'];

  for (const invalidEmail of invalidEmails) {
    assert.equal(isValidEmailFormat(invalidEmail), false);
  }
});

test('throws TypeError for every non-string argument', () => {
  const nonStringArguments = [null, undefined, 123, true, {}, []];

  for (const nonStringArgument of nonStringArguments) {
    assert.throws(
      () => isValidEmailFormat(nonStringArgument),
      TypeError,
    );
  }
});
