import { renderComponentWithRouterProvider } from '../../testUtils';
import Units from './units.component';
import { screen, waitFor } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';

describe('Units', () => {
  let user: UserEvent;
  const createView = () => {
    return renderComponentWithRouterProvider(<Units />);
  };
  beforeEach(() => {
    user = userEvent.setup();
    window.ResizeObserver = vi.fn().mockImplementation(() => ({
      disconnect: vi.fn(),
      observe: vi.fn(),
      unobserve: vi.fn(),
    }));
  });

  it('renders table correctly', async () => {
    const view = createView();

    await waitFor(() => {
      expect(screen.getByText('megapixels')).toBeInTheDocument();
    });
    expect(view.asFragment()).toMatchSnapshot();
  });

  it('opens and closes the add unit dialog', async () => {
    createView();

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Add Unit' })
      ).toBeInTheDocument();
    });

    const addButton = screen.getByRole('button', { name: 'Add Unit' });

    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('opens and closes the delete unit dialog', async () => {
    createView();

    await waitFor(() => {
      expect(screen.getByText('megapixels')).toBeInTheDocument();
    });

    const rowActionsButton = screen.getAllByLabelText('Row Actions');
    await user.click(rowActionsButton[0]);

    await waitFor(() => {
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    const deleteButton = screen.getByText('Delete');

    await user.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});
