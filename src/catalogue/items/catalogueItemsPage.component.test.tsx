import { screen, waitFor } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { paths } from '../../App';
import { renderComponentWithRouterProvider } from '../../testUtils';
import CatalogueItemsPage from './catalogueItemsPage.component';

describe('CatalogueItemsPage', () => {
  let user: UserEvent;

  beforeEach(() => {
    user = userEvent.setup();
  });
  const createView = (path: string, urlPathKey: keyof typeof paths) => {
    return renderComponentWithRouterProvider(
      <CatalogueItemsPage />,
      urlPathKey,
      path
    );
  };

  it('renders a catalogue items page correctly', async () => {
    const view = createView('/catalogue/4/items', 'catalogueItems');

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Add Catalogue Item' })
      ).toBeInTheDocument();
    });

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('renders a catalogue items error page correctly', async () => {
    const view = createView('/catalogue/40/items', 'catalogueItems');

    await waitFor(() => {
      expect(
        screen.getByText(
          'The category you searched for does not exist. Please navigate home by pressing the home button at the top left of your screen.'
        )
      ).toBeInTheDocument();
    });

    expect(view.asFragment()).toMatchSnapshot();
  });
});
