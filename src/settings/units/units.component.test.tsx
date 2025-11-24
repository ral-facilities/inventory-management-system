import { screen, waitFor } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { renderComponentWithRouterProvider } from '../../testUtils';
import Units from './units.component';
import * as authProvider from '../../authProvider.component';

describe('Units', () => {
  let user: UserEvent;
  const createView = () => {
    return renderComponentWithRouterProvider(<Units />);
  };
  beforeEach(() => {
    user = userEvent.setup();
    vi.spyOn(authProvider, 'useAuthorisationState').mockReturnValue({
      role: 'admin',
      isPrivilegedUser: true,
    });
  });

  it('renders table correctly', async () => {
    const view = createView();

    await waitFor(
      () => {
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      },
      { timeout: 10000 }
    );

    await waitFor(() => {
      expect(screen.getByText('megapixels')).toBeInTheDocument();
    });
    expect(view.asFragment()).toMatchSnapshot();
  });

  it('renders table for non privileged user without add or delete buttons', async () => {
    vi.spyOn(authProvider, 'useAuthorisationState').mockReturnValue({
      role: 'default',
      isPrivilegedUser: false,
    });
    createView();

    await waitFor(() =>
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    );

    // assert there is no add button or row actions
    expect(
      screen.queryByRole('button', { name: 'Add Unit' })
    ).not.toBeInTheDocument();
    expect(screen.queryAllByLabelText('Row Actions')).toHaveLength(0);
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

  it('sets and clears the table filters', async () => {
    createView();

    await waitFor(() => {
      expect(screen.getByText('megapixels')).toBeInTheDocument();
    });

    const clearFiltersButton = screen.getByRole('button', {
      name: 'Clear Filters',
    });

    expect(clearFiltersButton).toBeDisabled();

    const valueInput = screen.getByLabelText('Filter by Value');

    await user.type(valueInput, 'k');

    await waitFor(() => {
      expect(screen.queryByText('megapixels')).not.toBeInTheDocument();
    });

    await user.click(clearFiltersButton);

    await waitFor(() => {
      expect(screen.getByText('megapixels')).toBeInTheDocument();
    });

    expect(clearFiltersButton).toBeDisabled();
  }, 10000);
});
