// we return the payload as a string rather than JSON.parse-ing it
// so that callers can inform TypeScript the type of their payload

import { MicroFrontendToken } from './app.types';

// when they JSON.parse the result of this function
const parseJwt = (token: string): string => {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const payload = decodeURIComponent(
    window.atob(base64).replace(/(.)/g, function (_m, p) {
      const code = p.charCodeAt(0).toString(16).toUpperCase();
      return '%' + ('00' + code).slice(-2);
    })
  );
  return payload;
};

type SciGatewayToken = string | null;

export const readSciGatewayToken = (): SciGatewayToken => {
  const token = localStorage.getItem(MicroFrontendToken);
  if (token) {
    const parsedToken = JSON.parse(parseJwt(token));
    if (parsedToken.username) {
      return token;
    }
  }
  return null;
};

/**
 * Retrieves the user's role from the JWT stored in localStorage.
 *
 * If the user is authenticated, the JWT should contain a `role` claim.
 * In that case, the function returns the role value. If the token is
 * missing or cannot be parsed, the function returns `undefined`.
 *
 * If a token exists but the `role` field is not present in the decoded
 * payload, the function returns the fallback role `"default"`.
 *
 * @returns {string | undefined} The user's role, "default" if no role
 *          exists in the token, or `undefined` if the user is not authenticated.
 */
export const getUserRole = (): string | undefined => {
  const token = localStorage.getItem(MicroFrontendToken);
  if (token) {
    const parsedToken = JSON.parse(parseJwt(token));
    return parsedToken.role ?? 'default';
  }

  return undefined;
};
