export function isValidEmailFormat(email) {
  if (typeof email !== 'string') {
    throw new TypeError('email must be a string');
  }

  return /^[^@]+@[^@.]+\.[^@.]+$/.test(email);
}
