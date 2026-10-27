import { screen, waitFor } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { renderComponentWithRouterProvider } from '../testUtils';
import HistoryTable from './historyTable.component';

describe('History Table', () => {
  let user: UserEvent;
  beforeEach(() => {
    user = userEvent.setup();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const createView = (path: string) => {
    return renderComponentWithRouterProvider(
      <HistoryTable />,
      'manufacturerHistory',
      path
    );
  };

  it('renders table headers correctly', async () => {
    createView('/manufacturers/1/history');

    await waitFor(() => {
      expect(screen.getAllByText('Comment')).toHaveLength(2);
    });
    expect(screen.getByText('Field')).toBeInTheDocument();
    expect(screen.getByText('Value')).toBeInTheDocument();
    expect(screen.getByText('Modified Time')).toBeInTheDocument();
    expect(screen.getByText('Operation Type')).toBeInTheDocument();
  });

  it('renders table data correctly', async () => {
    const view = createView('/manufacturers/1/history');
    await waitFor(() => {
      expect(screen.getByText('No comment')).toBeInTheDocument();
    });

    // Ripples sometimes appear here, they seem to only be present on WSL and not on VMs & CI - wait for them to go
    // away so local tests don't interfere
    await waitFor(() =>
      // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
      expect(view.container.querySelector('.MuiTouchRipple-child')).toBeNull()
    );

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('renders no results correctly', async () => {
    const view = createView('/manufacturers/4/history');
    await waitFor(() => {
      expect(
        screen.getByText('No results found: Refresh to try again')
      ).toBeInTheDocument();
    });

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('expands grouped row with multiple updated fields', async () => {
    createView('/manufacturers/1/history');
    await waitFor(() => {
      expect(screen.getByText('No comment')).toBeInTheDocument();
    });

    expect(screen.queryByText('url')).not.toBeInTheDocument();
    expect(screen.queryByText('http://example.com')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '8 changes' }));
    expect(screen.getByText('url')).toBeInTheDocument();
    expect(screen.getByText('http://example.com')).toBeInTheDocument();
  });
});
