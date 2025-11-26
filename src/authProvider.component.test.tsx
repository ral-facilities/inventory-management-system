import { render, RenderResult, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuthorisationState } from './authProvider.component';
import React from 'react';
import { ADMIN_ROLE_TOKEN, DEFAULT_ROLE_TOKEN } from './testUtils';
import { setLocalStorageToken } from './utils';

const localStorageGetItemMock = vi.spyOn(
  window.localStorage.__proto__,
  'getItem'
);

const ConfigTest: React.FC = (): React.ReactElement => {
  const authorisationState = useAuthorisationState();

  // return authorisationState as a string to inspect later in tests
  return (
    <div data-testid="authorisationState">
      Authorised: {JSON.stringify(authorisationState)}
    </div>
  );
};

describe('AuthProvider', () => {
  // Create wrapper for authorisation tests
  const renderComponent = (): RenderResult =>
    render(
      <AuthProvider>
        <ConfigTest />
      </AuthProvider>
    );

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns correct authorisation state for admin user', async () => {
    localStorageGetItemMock.mockImplementationOnce(() => ADMIN_ROLE_TOKEN);

    renderComponent();

    await waitFor(() => {
      expect(
        screen.getByText(`Authorised: {"role":"admin","isPrivilegedUser":true}`)
      ).toBeInTheDocument();
    });
  });

  it('provides false when user is not admin role', async () => {
    localStorageGetItemMock.mockImplementationOnce(() => DEFAULT_ROLE_TOKEN);

    renderComponent();

    await waitFor(() => {
      expect(
        screen.getByText(
          `Authorised: {"role":"default","isPrivilegedUser":false}`
        )
      ).toBeInTheDocument();
    });
  });

  it('recalculates auth state on token update', async () => {
    localStorageGetItemMock.mockImplementationOnce(() => DEFAULT_ROLE_TOKEN);
    renderComponent();

    await waitFor(() => {
      expect(
        screen.getByText(
          `Authorised: {"role":"default","isPrivilegedUser":false}`
        )
      ).toBeInTheDocument();
    });

    setLocalStorageToken(true);

    await waitFor(() => {
      expect(
        screen.getByText(`Authorised: {"role":"admin","isPrivilegedUser":true}`)
      ).toBeInTheDocument();
    });
  });
});
