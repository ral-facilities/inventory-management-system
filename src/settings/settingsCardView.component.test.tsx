import { screen, waitFor } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import APIConfigProvider from '../apiConfigProvider.component';
import { renderComponentWithRouterProvider } from '../testUtils';
import SettingsCardView from './settingsCardView.component';

describe('SettingsCardView', () => {
  let user: UserEvent;

  const createView = () => {
    return renderComponentWithRouterProvider(
      <APIConfigProvider>
        <SettingsCardView />
      </APIConfigProvider>
    );
  };

  beforeEach(() => {
    user = userEvent.setup();
  });
  it('renders settings card view correctly', async () => {
    const view = createView();

    await waitFor(() => {
      expect(screen.getByText('Units')).toBeInTheDocument();
    });

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('opens and close criticality dialog', async () => {
    createView();

    await waitFor(() => {
      expect(screen.getByText('Criticality')).toBeInTheDocument();
    });

    const addButton = screen.getByRole('button', {
      name: 'Criticality',
    });
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const closeButton = screen.getByRole('button', { name: 'Close' });
    await user.click(closeButton);
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});
