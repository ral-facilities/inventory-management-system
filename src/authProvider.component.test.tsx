import { render, RenderResult, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuthorised } from './authProvider.component';
import * as parseTokens from './parseTokens';
import React from 'react';

const ConfigTest: React.FC = (): React.ReactElement => {
  const authorised = useAuthorised();

  // return authorised as a string to inspect later in tests
  return (
    <div data-testid="authorisationState">
      Authorised: {authorised.toString()}
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

  it('auth state is loaded', async () => {
    renderComponent();

    // Preloader is in a loading state when ConfigProvider is
    // loading the configuration.
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('authorisationState')).toBeInTheDocument();
    expect(screen.getByTestId('authorisationState')).toHaveTextContent(
      'Authorised: false'
    );
  });

  it('provides true when user is authorised', async () => {
    vi.spyOn(parseTokens, 'isUserAuthorised').mockResolvedValue(true);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Authorised: true')).toBeInTheDocument();
    });
  });

  it('provides false when user is not authorised', async () => {
    vi.spyOn(parseTokens, 'isUserAuthorised').mockResolvedValue(false);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Authorised: false')).toBeInTheDocument();
    });
  });
});
