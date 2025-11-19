import type { RenderResult } from '@testing-library/react';
import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import * as React from 'react';
import APIConfigProvider, {
  APISettingsContext,
} from './apiConfigProvider.component';
import { server } from './mocks/server';
import { renderComponentWithRouterProvider } from './testUtils';

const APIConfigTest: React.FC = (): React.ReactElement => {
  const settings = React.useContext(APISettingsContext);

  // Return the settings as a string to inspect later in tests.
  return <div data-testid="settings">{JSON.stringify(settings)}</div>;
};

describe('APIConfigProvider', () => {
  beforeEach(() => {
    global.document.dispatchEvent = vi.fn();
    global.CustomEvent = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // Create a wrapper for our settings tests.
  const renderComponent = (): RenderResult =>
    renderComponentWithRouterProvider(
      <APIConfigProvider>
        <APIConfigTest />
      </APIConfigProvider>
    );

  it('settings are loaded (with spares)', async () => {
    renderComponent();

    // Preloader is in a loading state when ConfigProvider is
    // loading the configuration.
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    expect(screen.getByTestId('settings')).toBeInTheDocument();
    expect(screen.getByTestId('settings')).toHaveTextContent(
      JSON.stringify({
        spares: {
          sparesFilterState:
            '?state=N4IgxgYiBcDaoEsAmMQGcCeaAuBTAtgHTYYAOuhAbgIYA2ArriADQg0NNygnmo4BOCAHYBzFmzqNUAZWwB7ftRFMAvgF11KoA',
          sparesColumnsFilters: {
            cF: [
              {
                id: 'system.type.value',
                value: [{ type: 'string', value: 'Storage' }],
              },
            ],
          },
          isLoading: false,
          sparesDefinition: { system_types: [{ id: '1', value: 'Storage' }] },
        },
      })
    );
  });

  it('settings are loaded (without spares)', async () => {
    server.use(
      http.get('/v1/settings/spares-definition', () => {
        return HttpResponse.json(undefined, { status: 204 });
      })
    );
    renderComponent();

    // Preloader is in a loading state when ConfigProvider is
    // loading the configuration.
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });
    expect(screen.getByTestId('settings')).toBeInTheDocument();
    expect(screen.getByTestId('settings')).toHaveTextContent(
      JSON.stringify({})
    );
  });
});
