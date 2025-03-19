import { screen, waitFor } from '@testing-library/react';
import { userEvent, type UserEvent } from '@testing-library/user-event';
import { renderComponentWithRouterProvider } from '../testUtils';
import AdminCardView from './adminCardView.component';

describe('AdminCardView', () => {
  let user: UserEvent;
  const createView = () => {
    return renderComponentWithRouterProvider(<AdminCardView />);
  };

  beforeEach(() => {
    user = userEvent.setup();
  });

  it('renders admin card view correctly', async () => {
    const view = createView();

    await waitFor(() => {
      expect(screen.getByText('Units')).toBeInTheDocument();
    });

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('should open and close spares definition dialog', async () => {
    createView();

    await waitFor(() => {
      expect(screen.getByText('Spares definition')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Spares definition'));

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
