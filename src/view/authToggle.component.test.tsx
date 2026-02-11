import { RenderResult, screen, waitFor } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import {
  ADMIN_ROLE_TOKEN,
  renderComponentWithRouterProvider,
} from '../testUtils';
import AuthToggle from './authToggle.component';

describe('Auth Toggle', () => {
  let user: UserEvent;
  const renderComponent = (): RenderResult =>
    renderComponentWithRouterProvider(<AuthToggle />);

  beforeEach(() => {
    user = userEvent.setup();
  });

  it('user can toggle authorisation state and it sets token', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Privileged user')).toBeInTheDocument();
    });

    const checkBox = screen.getByRole('checkbox', { name: 'Privileged user' });

    expect(checkBox).not.toBeChecked();

    await user.click(checkBox);

    expect(localStorage.getItem('scigateway:token')).toBe(ADMIN_ROLE_TOKEN);
  });
});
