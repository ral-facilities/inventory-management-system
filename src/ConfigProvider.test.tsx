import type { RenderResult } from '@testing-library/react';
import { render, screen, waitFor } from '@testing-library/react';
import * as React from 'react';
import ConfigProvider, {
  InventoryManagementSystemSettingsContext,
} from './ConfigProvider';

const ConfigTest: React.FC = (): React.ReactElement => {
  const settings = React.useContext(InventoryManagementSystemSettingsContext);

  // Return the settings as a string to inspect later in tests.
  return <div data-testid="settings">{JSON.stringify(settings)}</div>;
};

jest.mock('./settings', () => ({
  settings: Promise.resolve({
    apiUrl: '',
    routes: [
      {
        section: 'homepage',
        link: '/ims',
        displayName: 'Homepage',
        order: 0,
      },
      {
        section: 'Inventory Management System',
        link: '/catalogue',
        displayName: 'Catalogue',
        order: 1,
      },
      {
        section: 'Inventory Management System',
        link: '/systems',
        displayName: 'Systems',
        order: 2,
      },
      {
        section: 'Inventory Management System',
        link: '/manufacturer',
        displayName: 'Manufacturer',
        order: 3,
      },
    ],
    pluginHost: 'http://localhost:3000',
  }),
}));

describe('ConfigProvider', () => {
  beforeEach(() => {
    global.document.dispatchEvent = vi.fn();
    global.CustomEvent = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // Create a wrapper for our settings tests.
  const renderComponent = (): RenderResult =>
    render(
      <ConfigProvider>
        <ConfigTest />
      </ConfigProvider>
    );

  it('settings are loaded', async () => {
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
        apiUrl: '',
        routes: [
          {
            section: 'homepage',
            link: '/ims',
            displayName: 'Homepage',
            order: 0,
          },
          {
            section: 'Inventory Management System',
            link: '/catalogue',
            displayName: 'Catalogue',
            order: 1,
          },
          {
            section: 'Inventory Management System',
            link: '/systems',
            displayName: 'Systems',
            order: 2,
          },
          {
            section: 'Inventory Management System',
            link: '/manufacturer',
            displayName: 'Manufacturer',
            order: 3,
          },
        ],
        pluginHost: 'http://localhost:3000',
      })
    );
  });
});
