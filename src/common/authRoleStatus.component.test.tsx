import { render, RenderResult, screen, waitFor } from '@testing-library/react';
import AuthRoleStatus from './authRoleStatus.component';
import userEvent, { UserEvent } from '@testing-library/user-event';
import * as parseTokens from '../parseTokens';

describe('AuthRoleStatus', () => {
  let user: UserEvent;

  const renderComponent = (): RenderResult => render(<AuthRoleStatus />);

  // only mock relevant setting
  vi.mock('./settings', () => ({
    settings: Promise.resolve({
      privilegedRoles: ['admin'],
    }),
  }));

  beforeEach(() => {
    user = userEvent.setup();
    vi.spyOn(parseTokens, 'getUserRole').mockReturnValue('Admin');
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

    const infoIcon = screen.getByLabelText('admin-status-tooltip');

    await user.hover(infoIcon);

    await waitFor(() => {
      expect(
        screen.getByText(
          'As a privileged user, you can create/edit settings, and bypass moving rules for items.'
        )
      ).toBeInTheDocument();
    });
  });
});
