import Admin from './admin.component';
import { renderComponentWithRouterProvider } from '../testUtils';
import { screen, waitFor } from '@testing-library/react';

const mockedUseNavigate = vi.fn();

vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: () => mockedUseNavigate,
}));

describe('AdminPage', () => {
  const createView = () => {
    return renderComponentWithRouterProvider(<Admin />);
  };

  it('renders admin page correctly', async () => {
    createView();

    await waitFor(() => {
      expect(screen.getByText('Units')).toBeInTheDocument();
    });
    expect(screen.getByText('Usage Status')).toBeInTheDocument();
  });
});
