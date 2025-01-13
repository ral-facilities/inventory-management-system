import { screen, waitFor } from '@testing-library/react';
import { paths } from '../App';
import { renderComponentWithRouterProvider } from '../testUtils';
import Items from './items.component';

const mockedUseNavigate = vi.fn();

vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useNavigate: () => mockedUseNavigate,
}));

describe('Items', () => {
  const createView = (path: string, urlPathKey?: keyof typeof paths) => {
    return renderComponentWithRouterProvider(
      <Items />,
      urlPathKey || 'items',
      path
    );
  };

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
