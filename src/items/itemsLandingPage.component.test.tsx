import { screen, waitFor } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { renderComponentWithRouterProvider } from '../testUtils';
import ItemsLandingPage from './itemsLandingPage.component';

const mockedUseNavigate = vi.fn();

vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: () => mockedUseNavigate,
}));

describe('Items Landing Page', () => {
  let user: UserEvent;
  const createView = (path: string) => {
    return renderComponentWithRouterProvider(
      <ItemsLandingPage />,
      'item',
      path
    );
  };

  beforeEach(() => {
    user = userEvent.setup();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders text correctly (only basic details given)', async () => {
    createView('/catalogue/4/items/1/items/KvT2Ox7n');

    await waitFor(() => {
      expect(screen.getByText('Cameras 1')).toBeInTheDocument();
    });

    expect(screen.getByText('Description:')).toBeInTheDocument();
    expect(
      screen.getByText('High-resolution cameras for beam characterization. 1')
    ).toBeInTheDocument();

    expect(screen.getByText('Resolution (megapixels)')).toBeInTheDocument();

    expect(screen.getByText('Asset Number')).toBeInTheDocument();

    expect(screen.getByText('System')).toBeInTheDocument();
  });

  it('renders text correctly (Notes)', async () => {
    createView('/catalogue/4/items/1/items/KvT2Ox7n');

    await waitFor(() => {
      expect(screen.getByText('Cameras 1')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Notes'));

    expect(screen.getByText('6Y5XTJfBrNNx8oltI9HE')).toBeInTheDocument();
  });

  it('navigates to the system when the system id is clicked', async () => {
    createView('/catalogue/4/items/1/items/KvT2Ox7n');
    await waitFor(() => {
      expect(screen.getByText('Cameras 1')).toBeInTheDocument();
    });

    const systemName = screen.getByText('Giant laser');
    expect(systemName).toHaveAttribute(
      'href',
      '/systems/65328f34a40ff5301575a4e3'
    );
  });

  it('renders no item page correctly', async () => {
    createView('/catalogue/4/items/1/items/KvT2');
    await waitFor(() => {
      expect(
        screen.getByText(
          `This item doesn't exist. Please click the Home button to navigate to the catalogue home`
        )
      ).toBeInTheDocument();
    });
  });

  it('shows the loading indicator', async () => {
    createView('/catalogue/4/items/1/items/KvT2Ox7n');

    await waitFor(() => {
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });

  it('prints when the button is clicked', async () => {
    const spy = vi.spyOn(window, 'print').mockImplementation(() => {});
    createView('/catalogue/4/items/1/items/KvT2Ox7n');

    await waitFor(() => {
      expect(screen.getByText('Cameras 1')).toBeInTheDocument();
    });

    await user.click(
      screen.getByRole('button', { name: 'items landing page actions menu' })
    );

    const printButton = screen.getByText('Print');

    await user.click(printButton);
    // Assert that the window.print() function was called
    expect(spy).toHaveBeenCalled();

    // Clean up the mock
    spy.mockRestore();
  });

  it('landing page renders data correctly when optional values are null', async () => {
    createView('/catalogue/4/items/33/items/I26EJNJ0');

    await waitFor(() => {
      expect(screen.getByText('Cameras 14')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Manufacturer D')).toBeInTheDocument();
    });
    expect(screen.getByText('URL')).toBeInTheDocument();
    expect(screen.getAllByText('None')[0]).toBeInTheDocument();
    expect(screen.getByText('Telephone number')).toBeInTheDocument();
    expect(screen.getAllByText('None')[1]).toBeInTheDocument();
  });

  it('opens the edit item dialog', async () => {
    createView('/catalogue/4/items/1/items/KvT2Ox7n');

    const serialNumber = '5YUQDDjKpz2z';
    await waitFor(() => {
      expect(screen.getByText(serialNumber)).toBeInTheDocument();
    });

    await user.click(
      screen.getByRole('button', { name: 'items landing page actions menu' })
    );

    const editButton = screen.getByText('Edit');
    await user.click(editButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('navigates to manufacturer landing page', async () => {
    createView('/catalogue/4/items/1/items/KvT2Ox7n');
    await waitFor(() => {
      expect(screen.getByText('Cameras 1')).toBeInTheDocument();
    });

    const url = await screen.findByText('Manufacturer A');
    expect(url).toHaveAttribute('href', '/manufacturers/1');
  });
});
