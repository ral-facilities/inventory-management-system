import { screen, waitFor } from '@testing-library/react';
import { userEvent, type UserEvent } from '@testing-library/user-event';
import { renderComponentWithRouterProvider } from '../../testUtils';
import Rules from './rules.component';

describe('Rules', () => {
  let user: UserEvent;
  const createView = () => {
    return renderComponentWithRouterProvider(<Rules />);
  };

  beforeEach(() => {
    user = userEvent.setup();
  });

  it('renders table correctly', async () => {
    const view = createView();

    await waitFor(
      () => {
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      },
      { timeout: 10000 }
    );

    expect(await screen.findAllByText('Storage')).toHaveLength(4);

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('sets creation rules and clears the table filters', async () => {
    createView();

    await waitFor(
      () => {
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      },
      { timeout: 10000 }
    );

    expect(await screen.findAllByText('Storage')).toHaveLength(4);

    const clearFiltersButton = screen.getByRole('button', {
      name: 'Clear Filters',
    });

    expect(clearFiltersButton).toBeDisabled();

    const showCreationRulesButton = screen.getByRole('button', {
      name: 'Show Creation Rules',
    });

    await user.click(showCreationRulesButton);
    // chip and table
    expect(await screen.findAllByText('Storage')).toHaveLength(2);

    expect(showCreationRulesButton).toBeDisabled();

    await user.click(clearFiltersButton);

    expect(await screen.findAllByText('Storage')).toHaveLength(4);

    expect(clearFiltersButton).toBeDisabled();
  }, 10000);

  it('sets deletion rules and clears the table filters', async () => {
    createView();

    await waitFor(
      () => {
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      },
      { timeout: 10000 }
    );

    expect(await screen.findAllByText('Storage')).toHaveLength(4);

    const clearFiltersButton = screen.getByRole('button', {
      name: 'Clear Filters',
    });

    expect(clearFiltersButton).toBeDisabled();

    const showDeletionRulesButton = screen.getByRole('button', {
      name: 'Show Deletion Rules',
    });

    await user.click(showDeletionRulesButton);
    // chip and table
    expect(await screen.findAllByText('Storage')).toHaveLength(2);

    expect(showDeletionRulesButton).toBeDisabled();

    await user.click(clearFiltersButton);

    expect(await screen.findAllByText('Storage')).toHaveLength(4);

    expect(clearFiltersButton).toBeDisabled();
  }, 10000);

  it('sets moving rules and clears the table filters', async () => {
    createView();

    await waitFor(
      () => {
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
      },
      { timeout: 10000 }
    );

    expect(await screen.findAllByText('Storage')).toHaveLength(4);

    const clearFiltersButton = screen.getByRole('button', {
      name: 'Clear Filters',
    });

    expect(clearFiltersButton).toBeDisabled();

    const showMovingRulesButton = screen.getByRole('button', {
      name: 'Show Moving Rules',
    });

    await user.click(showMovingRulesButton);
    // chip and table
    expect(await screen.findAllByText('Storage')).toHaveLength(4);

    expect(showMovingRulesButton).toBeDisabled();

    await user.click(clearFiltersButton);

    expect(await screen.findAllByText('Storage')).toHaveLength(4);

    expect(clearFiltersButton).toBeDisabled();
  }, 10000);
});
