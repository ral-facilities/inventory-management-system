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
        `The admin URL route you're trying to access doesn't exist. Please return to the homepage by clicking the home button at the top left of your screen.`
      )
    ).toBeInTheDocument();
  });
});
