import { render, RenderResult, screen, waitFor } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import * as authProvider from '../authProvider.component';
import AuthRoleStatus from './authRoleStatus.component';

describe('AuthRoleStatus', () => {
  let user: UserEvent;

  const createView = (): RenderResult => render(<AuthRoleStatus />);

  beforeEach(() => {
    user = userEvent.setup();
    vi.spyOn(authProvider, 'useAuthorisationState').mockReturnValue({
      role: 'admin',
      isPrivilegedUser: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render role status', async () => {
    const view = createView();

    await waitFor(() => {
      expect(
        screen.getByRole('heading', {
          name: 'Admin',
        })
      ).toBeInTheDocument();
    });

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('tooltip should render explanation of role', async () => {
    createView();

    await waitFor(() => {
      expect(
        screen.getByRole('heading', {
          name: 'Admin',
        })
      ).toBeInTheDocument();
    });

    const infoIcon = screen.getByLabelText('auth-role-status-tooltip');

    await user.hover(infoIcon);

    await waitFor(() => {
      expect(
        screen.getByText(
          'The admin role enables extra functionality. You can create/delete units and usage statuses, and bypass rules when creating, deleting, editing, or moving items.'
        )
      ).toBeInTheDocument();
    });
  });
});
