import { screen, waitFor } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { renderComponentWithRouterProvider } from '../testUtils';
import ItemSystemHistory from './itemSystemHistoryTable.component';

describe('ItemSystemHistory', () => {
  let user: UserEvent;
  const createView = (path: string) => {
    return renderComponentWithRouterProvider(
      <ItemSystemHistory />,
      'itemSystemsHistory',
      path
    );
  };
  beforeEach(() => {
    user = userEvent.setup();
  });

  it('renders table headers correctly', async () => {
    createView('/catalogue/4/items/1/items/KvT2Ox7n/systems-history');

    await waitFor(() => {
      expect(screen.getByText('System')).toBeInTheDocument();
    });
    expect(screen.getByText('Entered At')).toBeInTheDocument();
    expect(screen.getByText('Entered By')).toBeInTheDocument();
    expect(screen.getByText('Entered Comment')).toBeInTheDocument();
    expect(screen.getByText('Removed At')).toBeInTheDocument();
  });

  it('renders table data correctly', async () => {
    const view = createView(
      '/catalogue/4/items/1/items/KvT2Ox7n/systems-history'
    );
    await waitFor(() => {
      expect(screen.getByText('Giant laser')).toBeInTheDocument();
    });

    //also unhide entered at column
    await user.click(screen.getByRole('button', { name: 'Show/Hide columns' }));
    await user.click(screen.getAllByText('Entered At')[1]);

    // Ripples sometimes appear here, they seem to only be present on WSL and not on VMs & CI - wait for them to go
    // away so local tests don't interfere
    await waitFor(() =>
      // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
      expect(view.container.querySelector('.MuiTouchRipple-child')).toBeNull()
    );

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('renders no results correctly', async () => {
    const view = createView(
      '/catalogue/5/items/6/items/80IuBMnl/systems-history'
    );
    await waitFor(() => {
      expect(
        screen.getByText('No results found: Refresh to try again')
      ).toBeInTheDocument();
    });

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('system url has a href so therefore links to new webpage', async () => {
    createView('/catalogue/4/items/1/items/KvT2Ox7n/systems-history');
    await waitFor(() => {
      expect(screen.getByText('Giant laser')).toBeInTheDocument();
    });
    const url = await screen.findByText('Laser Xpress');
    expect(url).toHaveAttribute('href', '/systems/65328f34a40ff5301575a4e8');
  });

  it('sets the table filters and clears the table filters', async () => {
    createView('/catalogue/4/items/1/items/KvT2Ox7n/systems-history');

    await waitFor(() => {
      expect(screen.getByText('Giant laser')).toBeInTheDocument();
    });
    const clearFiltersButton = screen.getByRole('button', {
      name: 'Clear Filters',
    });

    expect(clearFiltersButton).toBeDisabled();

    await user.click(screen.getByLabelText('Filter by System'));

    await user.click(screen.getByText('Laser Xpress (1)'));

    await waitFor(() => {
      expect(screen.queryByText('Giant laser')).not.toBeInTheDocument();
    });

    await user.click(clearFiltersButton);

    await waitFor(() => {
      expect(screen.getByText('Giant laser')).toBeInTheDocument();
    });
  }, 10000);
});
