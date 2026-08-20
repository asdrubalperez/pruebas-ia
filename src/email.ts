import { isValidEmailFormat } from './email-validator.mjs';

export function isAllowedDomain(email, allowedDomains) {
  try {
    if (!isValidEmailFormat(email)) {
      return false;
    }
  } catch (error) {
    if (error instanceof TypeError) {
      return false;
    }

    throw error;
  }

  const domain = email.slice(email.lastIndexOf('@') + 1).toLowerCase();

  return allowedDomains.some(
    (allowedDomain) => allowedDomain.toLowerCase() === domain,
  );
}
