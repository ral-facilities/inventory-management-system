import { screen, waitFor } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { renderComponentWithRouterProvider } from '../testUtils';
import AdminPage from './admin.component';

const mockedUseNavigate = vi.fn();

vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: () => mockedUseNavigate,
}));

describe('AdminPage', () => {
  let user: UserEvent;
  const createView = (path: string) => {
    return renderComponentWithRouterProvider(<AdminPage />, 'admin', path);
  };

  beforeEach(() => {
    user = userEvent.setup();
  });
  it('renders admin page correctly', async () => {
    createView('/admin-ims');

    await waitFor(() => {
      expect(screen.getByText('Units')).toBeInTheDocument();
    });
    expect(screen.getByText('Usage Statuses')).toBeInTheDocument();
  });

  it('should open and close spares definition dialog', async () => {
    createView('/admin-ims');

    await waitFor(() => {
      expect(screen.getByText('Spares definition')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Spares definition'));

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('renders no results page for invalid url', async () => {
    createView('/admin-ims/testFake');

    await waitFor(() => {
      expect(screen.getByText('No results found')).toBeInTheDocument();
    });
    expect(
      screen.getByText(
        `The admin URL route you're trying to access doesn't exist. Please return to the homepage by clicking the home button at the top left of your screen.`
      )
    ).toBeInTheDocument();
  });
});
