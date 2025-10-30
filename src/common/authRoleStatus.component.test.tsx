import { render, RenderResult, screen, waitFor } from '@testing-library/react';
import AuthRoleStatus from './authRoleStatus.component';
import userEvent, { UserEvent } from '@testing-library/user-event';
import * as parseTokens from '../parseTokens';

describe('AuthRoleStatus', () => {
  let user: UserEvent;

  const renderComponent = (): RenderResult => render(<AuthRoleStatus />);

  beforeEach(() => {
    user = userEvent.setup();
    vi.spyOn(parseTokens, 'getUserRole').mockReturnValue('admin');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render role status', async () => {
    const view = renderComponent();

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
    renderComponent();

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
