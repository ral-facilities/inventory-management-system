import { screen, waitFor } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { paths } from '../App';
import { renderComponentWithRouterProvider } from '../testUtils';
import CatalogueLayout from './catalogueLayout.component';

const mockedUseNavigate = vi.fn();

vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: () => mockedUseNavigate,
}));

describe('Catalogue Layout', () => {
  let user: UserEvent;

  beforeEach(() => {
    user = userEvent.setup();
  });
  const createView = (path: string, urlPathKey: keyof typeof paths) => {
    return renderComponentWithRouterProvider(
      <CatalogueLayout />,
      urlPathKey,
      path
    );
  };

  it('renders catalogue home page correctly', async () => {
    const view = createView('/catalogue', 'catalogue');

    await waitFor(() => {
      expect(
        screen.getByRole('button', {
          name: 'navigate to catalogue home',
        })
      ).toBeInTheDocument();
    });

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('renders a catalogue categories page correctly', async () => {
    const view = createView('/catalogue/1', 'catalogueCategories');

    await waitFor(() => {
      expect(screen.getByText('Beam Characterization')).toBeInTheDocument();
    });

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('renders a catalogue items page correctly', async () => {
    const view = createView('/catalogue/4/items', 'catalogueItems');

    await waitFor(() => {
      expect(screen.getByText('Cameras')).toBeInTheDocument();
    });

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('renders a catalogue items landing page correctly', async () => {
    const view = createView('/catalogue/4/items/1', 'catalogueItem');

    await waitFor(() => {
      expect(screen.getByText('Cameras 1')).toBeInTheDocument();
    });

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('renders the items page correctly', async () => {
    const view = createView('/catalogue/4/items/1/items', 'items');

    await waitFor(() => {
      expect(screen.getByText('Items')).toBeInTheDocument();
    });

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('renders the item landing page page correctly', async () => {
    const view = createView('/catalogue/4/items/1/items/KvT2Ox7n', 'item');

    await waitFor(() => {
      expect(screen.getByText('5YUQDDjKpz2z')).toBeInTheDocument();
    });

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('calls useNavigate when the home button is clicked', async () => {
    createView('/catalogue/4/items/1/items', 'items');

    await waitFor(() => {
      expect(screen.getByText('Items')).toBeInTheDocument();
    });

    const homeButton = screen.getByRole('button', {
      name: 'navigate to catalogue home',
    });

    await user.click(homeButton);

    expect(mockedUseNavigate).toHaveBeenCalledTimes(1);
    expect(mockedUseNavigate).toHaveBeenCalledWith('/catalogue');
  });
});
