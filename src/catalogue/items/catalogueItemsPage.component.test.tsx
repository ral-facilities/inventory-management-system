import { screen, waitFor } from '@testing-library/react';
import { URLPathKeyType } from '../../paths';
import { renderComponentWithRouterProvider } from '../../testUtils';
import CatalogueItemsPage from './catalogueItemsPage.component';

describe('CatalogueItemsPage', () => {
  const createView = (path: string, urlPathKey: URLPathKeyType) => {
    return renderComponentWithRouterProvider(
      <CatalogueItemsPage />,
      urlPathKey,
      path
    );
  };

  it('renders a catalogue items page correctly', async () => {
    const view = createView('/catalogue/4/items', 'catalogueItems');

    await waitFor(
      () => expect(screen.queryByRole('progressbar')).not.toBeInTheDocument(),
      { timeout: 10000 }
    );

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Add Catalogue Item' })
      ).toBeInTheDocument();
    });

    expect(view.asFragment()).toMatchSnapshot();
  }, 15000);

  it('redirects to the catalogue catalogue page if isLeaf is false', async () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const consoleWarnSpy = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => {});
    const { router } = createView('/catalogue/1/items', 'catalogueItems');

    await waitFor(() =>
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    );

    await waitFor(
      () => {
        expect(router.state.location.pathname).toBe('/catalogue/1');
      },
      { timeout: 10000 }
    );
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  }, 15000);
});
