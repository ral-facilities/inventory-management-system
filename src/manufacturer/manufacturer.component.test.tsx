import { screen, waitFor } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { renderComponentWithRouterProvider } from '../testUtils';
import Manufacturer from './manufacturer.component';

const mockedUseNavigate = vi.fn();

vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: () => mockedUseNavigate,
}));

describe('Manufacturer', () => {
  let user: UserEvent;
  const createView = (path: string, isLandingPage?: boolean) => {
    return renderComponentWithRouterProvider(
      <Manufacturer />,
      isLandingPage ? 'manufacturer' : 'manufacturers',
      path
    );
  };
  beforeEach(() => {
    user = userEvent.setup();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('navigates back to the root directory', async () => {
    createView('/manufacturers');

    await waitFor(() => {
      expect(screen.queryByText('Manufacturer A')).not.toBeInTheDocument();
    });

    const homeButton = screen.getByRole('button', {
      name: 'navigate to manufacturers home',
    });

    await user.click(homeButton);

    expect(mockedUseNavigate).toHaveBeenCalledTimes(1);
    expect(mockedUseNavigate).toHaveBeenCalledWith('/manufacturers');
  });
  it('navigates back to the root directory', async () => {
    createView('/manufacturers/1', true);

    await waitFor(() => {
      expect(screen.queryByText('Manufacturer A')).not.toBeInTheDocument();
    });

    const homeButton = screen.getByRole('button', {
      name: 'navigate to manufacturers home',
    });

    await user.click(homeButton);

    expect(mockedUseNavigate).toHaveBeenCalledTimes(1);
    expect(mockedUseNavigate).toHaveBeenCalledWith('/manufacturers');
  });
});
