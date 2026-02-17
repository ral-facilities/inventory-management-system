import { screen, waitFor } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { URLPathKeyType } from '../../paths';
import { RootState } from '../../state/store';
import { renderComponentWithRouterProvider } from '../../testUtils';
import CatalogueItemLayout from './catalogueItemLayout.component';

describe('Catalogue Item Layout', () => {
  let user: UserEvent;

  beforeEach(() => {
    user = userEvent.setup();
  });
  const createView = (
    path: string,
    urlPathKey: URLPathKeyType,
    preloadedState?: Partial<RootState>
  ) => {
    return renderComponentWithRouterProvider(
      <CatalogueItemLayout />,
      urlPathKey,
      path,
      preloadedState
    );
  };

  it('renders catalogue items landing page title correctly', async () => {
    createView('/catalogue/5/items/89', 'catalogueItem');
    await waitFor(() => {
      expect(screen.getByText('Energy Meters 26')).toBeInTheDocument();
    });
  });

  it('renders catalogue items landing page title correctly (critical mode)', async () => {
    createView('/catalogue/6/items/10', 'catalogueItem', {
      criticality: { isCriticalMode: true },
    });
    await waitFor(() => {
      expect(screen.getByText('Wavefront Sensors 31')).toBeInTheDocument();
    });

    expect(screen.getByTestId('WarningIcon')).toBeInTheDocument();

    await user.hover(screen.getByTestId('WarningIcon'));

    expect(
      await screen.findByText('Items are running low in this catalogue item')
    ).toBeInTheDocument();
  });

  it('renders the items page correctly', async () => {
    createView('/catalogue/4/items/1/items', 'items');

    await waitFor(() => {
      expect(screen.getByText('Cameras 1')).toBeInTheDocument();
    });
    expect(screen.getByText('(Items)')).toBeInTheDocument();
  });

  it('renders the item landing page page correctly', async () => {
    createView('/catalogue/4/items/1/items/KvT2Ox7n', 'item');

    await waitFor(() => {
      expect(screen.getByText('Cameras 1')).toBeInTheDocument();
    });
    expect(screen.getByText('(Item Details)')).toBeInTheDocument();
  });
});
