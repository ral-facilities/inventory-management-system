import { RenderResult, screen, waitFor } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { renderComponentWithRouterProvider } from '../testUtils';
import AuthRoleStatus from './authRoleStatus.component';

describe('AuthRoleStatus', () => {
  let user: UserEvent;

  const createView = (): RenderResult =>
    renderComponentWithRouterProvider(
      <AuthRoleStatus />,
      undefined,
      undefined,
      {
        authorisation: {
          role: 'admin',
          isAdminUser: true,
          isAdminMode: true,
        },
      }
    );

  beforeEach(() => {
    user = userEvent.setup();
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
