import { screen, waitFor } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { paths } from '../App';
import { renderComponentWithRouterProvider } from '../testUtils';
import AdminContainer from './adminContainer.component';

const mockedUseNavigate = vi.fn();

vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: () => mockedUseNavigate,
}));

describe('AdminPage', () => {
  let user: UserEvent;

  beforeEach(() => {
    user = userEvent.setup();
  });
  const createView = (path: string, urlPathKey: keyof typeof paths) => {
    return renderComponentWithRouterProvider(
      <AdminContainer />,
      urlPathKey,
      path
    );
  };

  it('renders admin home page correctly', async () => {
    const view = createView('/admin-ims', 'admin');

    await waitFor(() => {
      expect(
        screen.getByRole('button', {
          name: 'navigate to admin home',
        })
      ).toBeInTheDocument();
    });

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('renders units breadcrumbs correctly', async () => {
    const view = createView('/admin-ims/units', 'adminUnits');

    await waitFor(() => {
      expect(screen.getByText('Units')).toBeInTheDocument();
    });

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('renders usage statuses breadcrumbs correctly', async () => {
    const view = createView('/admin-ims/usage-statuses', 'adminUsageStatuses');

    await waitFor(() => {
      expect(screen.getByText('Usage statuses')).toBeInTheDocument();
    });

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('calls useNavigate when the home button is clicked', async () => {
    createView('/admin-ims/usage-statuses', 'adminUsageStatuses');

    await waitFor(() => {
      expect(screen.getByText('Usage statuses')).toBeInTheDocument();
    });

    const homeButton = screen.getByRole('button', {
      name: 'navigate to admin home',
    });

    await user.click(homeButton);

    expect(mockedUseNavigate).toHaveBeenCalledTimes(1);
    expect(mockedUseNavigate).toHaveBeenCalledWith('/admin-ims');
  });
});
