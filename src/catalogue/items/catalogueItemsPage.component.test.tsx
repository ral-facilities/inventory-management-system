import { screen, waitFor } from '@testing-library/react';
import { paths } from '../../App';
import { renderComponentWithRouterProvider } from '../../testUtils';
import CatalogueItemsPage from './catalogueItemsPage.component';

describe('CatalogueItemsPage', () => {
  const createView = (path: string, urlPathKey: keyof typeof paths) => {
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
});
