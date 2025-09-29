// we return the payload as a string rather than JSON.parse-ing it
// so that callers can inform TypeScript the type of their payload

import { MicroFrontendToken } from './app.types';
import { settings } from './settings';

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

export const isUserAuthorised = async (): Promise<boolean> => {
  const token = localStorage.getItem(MicroFrontendToken);
  if (token) {
    const parsedToken = JSON.parse(parseJwt(token));
    const privilegedRoles = await settings.then(
      (imsSettings) => imsSettings?.privilegedRoles ?? []
    );

    if (Array.isArray(parsedToken.roles)) {
      return (parsedToken.roles as Array<string>).some((token_role) =>
        new Set(privilegedRoles).has(token_role)
      );
    }
  }

  return false;
};

export const getUserRole = (): string | undefined => {
  const token = localStorage.getItem(MicroFrontendToken);
  if (token) {
    const parsedToken = JSON.parse(parseJwt(token));
    if (parsedToken.roles?.length > 0) {
      const role =
        parsedToken.roles[0][0].toUpperCase() + parsedToken.roles[0].slice(1);
      return parsedToken.userIsAdmin ? 'Admin' : role; // default to admin even if other roles exist
    }
  }
};
