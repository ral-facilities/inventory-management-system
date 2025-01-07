import { screen, waitFor } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { paths } from '../App';
import { renderComponentWithRouterProvider } from '../testUtils';
import Items from './items.component';

const mockedUseNavigate = vi.fn();

vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: () => mockedUseNavigate,
}));

describe('Items', () => {
  let user: UserEvent;
  const createView = (path: string, urlPathKey?: keyof typeof paths) => {
    return renderComponentWithRouterProvider(
      <Items />,
      urlPathKey || 'items',
      path
    );
  };

  beforeEach(() => {
    user = userEvent.setup();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders no item page correctly', async () => {
    createView('/catalogue/4/items/1fghj/items');
    await waitFor(() => {
      expect(
        screen.getByText(
          `These items don't exist. Please click the Home button on the top left of your screen to navigate to the catalogue home.`
        )
      ).toBeInTheDocument();
    });
  });

  it('renders item page correctly', async () => {
    createView('/catalogue/4/items/1/items');
    await waitFor(() =>
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    );

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Add Item' })
      ).toBeInTheDocument();
    });
  });
});
