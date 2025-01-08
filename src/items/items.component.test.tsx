import { screen, waitFor } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { renderComponentWithRouterProvider } from '../testUtils';
import Items from './items.component';

const mockedUseNavigate = vi.fn();

vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: () => mockedUseNavigate,
}));

describe('Items', () => {
  let user: UserEvent;
  const createView = (path: string) => {
    return renderComponentWithRouterProvider(<Items />, 'items', path);
  };

  beforeEach(() => {
    user = userEvent.setup();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('navigates to catalogue category table view', async () => {
    createView('/catalogue/item/1/items');

    await waitFor(() => {
      expect(
        screen.getByRole('link', {
          name: 'Cameras',
        })
      ).toBeInTheDocument();
    });

    const breadcrumb = screen.getByRole('link', {
      name: 'Cameras',
    });
    await user.click(breadcrumb);

    expect(mockedUseNavigate).toHaveBeenCalledTimes(1);
    expect(mockedUseNavigate).toHaveBeenCalledWith('/catalogue/4');
  });

  it('navigates to catalogue item landing page', async () => {
    createView('/catalogue/item/1/items');
    await waitFor(() => {
      expect(
        screen.getByRole('link', { name: 'Cameras 1' })
      ).toBeInTheDocument();
    });

    const breadcrumb = screen.getByRole('link', {
      name: 'Cameras 1',
    });
    await user.click(breadcrumb);

    expect(mockedUseNavigate).toHaveBeenCalledTimes(1);
    expect(mockedUseNavigate).toHaveBeenCalledWith('/catalogue/item/1');
  });

  it('navigates back to the root directory', async () => {
    createView('/catalogue/item/1/items');

    await waitFor(() => {
      expect(
        screen.getByRole('link', { name: 'Cameras 1' })
      ).toBeInTheDocument();
    });

    const homeButton = screen.getByRole('button', {
      name: 'navigate to catalogue home',
    });

    await user.click(homeButton);

    expect(mockedUseNavigate).toHaveBeenCalledTimes(1);
    expect(mockedUseNavigate).toHaveBeenCalledWith('/catalogue');
  });

  it('renders no item page correctly', async () => {
    createView('/catalogue/item/1fghj/items');
    await waitFor(() => {
      expect(
        screen.getByText(
          `These items don't exist. Please click the Home button on the top left of your screen to navigate to the catalogue home.`
        )
      ).toBeInTheDocument();
    });
  });
});
