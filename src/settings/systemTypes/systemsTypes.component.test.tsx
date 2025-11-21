import { screen, waitFor } from '@testing-library/react';
import { userEvent, type UserEvent } from '@testing-library/user-event';
import APIConfigProvider from '../../apiConfigProvider.component';
import { renderComponentWithRouterProvider } from '../../testUtils';
import SystemTypes from './systemTypes.component';

describe('SystemTypes', () => {
  let user: UserEvent;
  const createView = () => {
    return renderComponentWithRouterProvider(
      <APIConfigProvider>
        <SystemTypes />
      </APIConfigProvider>
    );
  };

  beforeEach(() => {
    user = userEvent.setup();
  });

  it('renders table correctly', async () => {
    const view = createView();

    await waitFor(() => {
      expect(screen.getByText('Storage')).toBeInTheDocument();
    });

    await waitFor(
      () => {
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      },
      { timeout: 10000 }
    );
    expect(view.asFragment()).toMatchSnapshot();
  });

  it('sets and clears the table filters', async () => {
    createView();

    await waitFor(() => {
      expect(screen.getByText('Storage')).toBeInTheDocument();
    });

    const clearFiltersButton = screen.getByRole('button', {
      name: 'Clear Filters',
    });

    expect(clearFiltersButton).toBeDisabled();

    const valueInput = screen.getByLabelText('Filter by Value');

    await user.type(valueInput, 'oper');

    await waitFor(() => {
      expect(screen.queryByText('Storage')).not.toBeInTheDocument();
    });

    await user.click(clearFiltersButton);

    await waitFor(() => {
      expect(screen.getByText('Storage')).toBeInTheDocument();
    });

    expect(clearFiltersButton).toBeDisabled();
  }, 10000);

  it('sets and clears the spares definition filter', async () => {
    createView();

    await waitFor(() => {
      expect(screen.getByText('Storage')).toBeInTheDocument();
    });

    const sparesDefinitionButton = screen.getByRole('button', {
      name: 'Show Spares Definition',
    });

    expect(sparesDefinitionButton).not.toBeDisabled();

    await user.click(sparesDefinitionButton);

    await waitFor(() => {
      expect(screen.queryByText('Operational')).not.toBeInTheDocument();
    });

    expect(sparesDefinitionButton).toBeDisabled();

    expect(
      await screen.findByText('Spares Definition Filter Applied')
    ).toBeInTheDocument();

    const clearFiltersButton = screen.getByRole('button', {
      name: 'Clear Filters',
    });

    await user.click(clearFiltersButton);

    await waitFor(() => {
      expect(screen.getByText('Operational')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(
        screen.queryByText('Spares Definition Filter Applied')
      ).not.toBeInTheDocument();
    });

    expect(clearFiltersButton).toBeDisabled();
  }, 10000);
});
