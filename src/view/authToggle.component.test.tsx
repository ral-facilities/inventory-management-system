import { render, RenderResult, waitFor, screen } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import AuthToggle from './authToggle.component';
import { ADMIN_ROLE_TOKEN } from '../testUtils';

describe('Auth Toggle', () => {
  let user: UserEvent;
  const renderComponent = (): RenderResult => render(<AuthToggle />);

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
