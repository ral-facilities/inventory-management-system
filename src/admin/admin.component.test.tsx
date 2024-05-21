import { renderComponentWithRouterProvider } from '../testUtils';
import { screen, waitFor } from '@testing-library/react';
import AdminPage from './admin.component';

const mockedUseNavigate = vi.fn();

vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: () => mockedUseNavigate,
}));

describe('AdminPage', () => {
  const createView = (path: string) => {
    return renderComponentWithRouterProvider(<AdminPage />, 'admin', path);
  };

  it('renders admin page correctly', async () => {
    createView('/admin-ims');

    await waitFor(() => {
      expect(screen.getByText('Units')).toBeInTheDocument();
    });
    expect(screen.getByText('Usage Statuses')).toBeInTheDocument();
  });

  it('renders no results page for invalid url', async () => {
    createView('/admin-ims/testFake');

    await waitFor(() => {
      expect(screen.getByText('No results found')).toBeInTheDocument();
    });
    expect(
      screen.getByText(
        'The admin function you searched for does not exist. Please navigate home by pressing the home button at the top left of your screen.'
      )
    ).toBeInTheDocument();
  });
});
