import { screen, waitFor } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { RootState } from '../../state/store';
import { renderComponentWithRouterProvider } from '../../testUtils';
import UsageStatusComponent from './usageStatuses.component';

describe('Usage statuses', () => {
  let user: UserEvent;
  const createView = (preloadedState?: Partial<RootState>) => {
    return renderComponentWithRouterProvider(
      <UsageStatusComponent />,
      undefined,
      undefined,
      preloadedState ?? {
        authorisation: {
          role: 'admin',
          isPrivilegedUser: true,
          adminMode: true,
        },
      }
    );
  };
  beforeEach(() => {
    user = userEvent.setup();
  });

  it('renders table correctly', async () => {
    const view = createView();

    await waitFor(() => {
      expect(screen.getByText('New')).toBeInTheDocument();
    });
    // Ensure no loading bars visible
    await waitFor(() =>
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    );

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('renders table for non privileged user without add or delete buttons', async () => {
    createView({
      authorisation: {
        role: 'default',
        isPrivilegedUser: false,
        adminMode: false,
      },
    });

    await waitFor(() => {
      expect(screen.getByText('New')).toBeInTheDocument();
    });
    // Ensure no loading bars visible
    await waitFor(() =>
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    );

    // assert there is no add button or row actions
    expect(
      screen.queryByRole('button', { name: 'Add Usage Status' })
    ).not.toBeInTheDocument();
    expect(screen.queryAllByLabelText('Row Actions')).toHaveLength(0);
  });

  it('opens and closes the add usage status dialog', async () => {
    createView();

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Add Usage Status' })
      ).toBeInTheDocument();
    });

    const addButton = screen.getByRole('button', { name: 'Add Usage Status' });

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

  it('opens and closes the delete usage status dialog', async () => {
    createView();

    await waitFor(() => {
      expect(screen.getByText('New')).toBeInTheDocument();
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
