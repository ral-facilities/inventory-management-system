import { screen, waitFor } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { URLPathKeyType } from '../paths';
import { renderComponentWithRouterProvider } from '../testUtils';
import Systems from './systems.component';

describe('Systems', () => {
  // Quite a few of these take more than 5 seconds on CI
  vi.setConfig({ testTimeout: 14000 });

  let user: UserEvent;
  const createView = (path: string, urlPathKey?: URLPathKeyType) => {
    return renderComponentWithRouterProvider(
      <Systems />,
      urlPathKey ?? 'systems',
      path
    );
  };

  beforeEach(() => {
    user = userEvent.setup();
  });

  const clickRowAction = async (rowIndex: number, buttonText: string) => {
    await user.click(screen.getAllByLabelText('Row Actions')[rowIndex]);
    await waitFor(() => {
      expect(screen.getByText(buttonText)).toBeInTheDocument();
    });
    await user.click(screen.getByText(buttonText));
  };

  it('renders correctly', async () => {
    createView('/systems');

    await waitFor(() => {
      expect(screen.getByText('Root systems')).toBeInTheDocument();
    });

    expect(screen.getByText('Giant laser')).toBeInTheDocument();
    expect(screen.getByText('Total Systems: 5')).toBeInTheDocument();
  });

  it('renders correctly when viewing a specific system', async () => {
    createView('/systems/65328f34a40ff5301575a4e3', 'system');

    await waitFor(() => {
      expect(screen.getByText('Subsystems')).toBeInTheDocument();
    });

    expect(screen.getByText('Smaller laser')).toBeInTheDocument();
    expect(screen.getByText('Total Subsystems: 1')).toBeInTheDocument();
  });

  it('opens and closes the subsystems fullscreen table view ', async () => {
    const { router } = createView('/systems');

    await waitFor(() => {
      expect(screen.getByText('Root systems')).toBeInTheDocument();
    });

    expect(screen.getByText('Giant laser')).toBeInTheDocument();
    expect(screen.getByText('Total Systems: 5')).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.queryByText('Scrapped system for various items.')
      ).not.toBeInTheDocument();
    });

    const toggleFullScreenButton = screen.getAllByRole('button', {
      name: 'Toggle full screen',
    })[0];

    await user.click(toggleFullScreenButton);

    expect(router.state.location.search).toBe(
      '?subState=N4IgZgyiBcAuBOBXApgGhAYwGoEsDOMoAtgPYAmOYOyZA%2BrDkcjAiuhvMgIaw32PM4SNCEYAHEvFhcAdhkGsRZZHg44xDEjJbD0JAO4zk8HWxAAbEhh44tp5AF8HQA'
    );

    await waitFor(() => {
      expect(screen.queryByText('Root systems')).not.toBeInTheDocument();
    });
    expect(
      await screen.findByText('Scrapped system for various items.')
    ).toBeInTheDocument();

    await user.click(
      (
        await screen.findAllByRole('button', {
          name: 'Toggle full screen',
        })
      )[0]
    );

    await waitFor(() => {
      expect(
        screen.queryByText('Scrapped system for various items.')
      ).not.toBeInTheDocument();
    });

    expect(router.state.location.search).toBe('');
  });

  it('clear filters subsystems table in fullscreen mode', async () => {
    const { router } = createView('/systems');
    await waitFor(() => {
      expect(screen.getByText('Root systems')).toBeInTheDocument();
    });

    expect(screen.getByText('Giant laser')).toBeInTheDocument();
    expect(screen.getByText('Total Systems: 5')).toBeInTheDocument();

    const toggleFullScreenButton = screen.getAllByRole('button', {
      name: 'Toggle full screen',
    })[0];

    await user.click(toggleFullScreenButton);

    expect(router.state.location.search).toBe(
      '?subState=N4IgZgyiBcAuBOBXApgGhAYwGoEsDOMoAtgPYAmOYOyZA%2BrDkcjAiuhvMgIaw32PM4SNCEYAHEvFhcAdhkGsRZZHg44xDEjJbD0JAO4zk8HWxAAbEhh44tp5AF8HQA'
    );

    const clearFiltersButton = await screen.findByRole('button', {
      name: 'Clear Filters',
    });

    expect(clearFiltersButton).toBeDisabled();

    const nameInput = await screen.findByLabelText('Filter by Name');

    expect(nameInput).toBeVisible();
    await user.type(nameInput, 'Stor');

    await waitFor(() => {
      expect(screen.queryByText('Giant Laser')).not.toBeInTheDocument();
    });

    await waitFor(() => {
      expect(clearFiltersButton).not.toBeDisabled();
    });
    await user.click(clearFiltersButton);

    await waitFor(() => {
      expect(screen.getByText('Giant laser')).toBeInTheDocument();
    });
  });

  it('clear filters in subsystems table', async () => {
    createView('/systems');
    await waitFor(() => {
      expect(screen.getByText('Root systems')).toBeInTheDocument();
    });

    expect(screen.getByText('Giant laser')).toBeInTheDocument();
    expect(screen.getByText('Total Systems: 5')).toBeInTheDocument();

    const clearFiltersButton = await screen.findByTestId(
      'clear-filters-button'
    );

    await user.click(
      await screen.findByRole('button', { name: 'Show/Hide filters' })
    );

    const nameInput = await screen.findByLabelText('Filter by Name');

    expect(nameInput).toBeVisible();
    await user.type(nameInput, 'Stor');

    await waitFor(() => {
      expect(screen.queryByText('Giant Laser')).not.toBeInTheDocument();
    });

    await waitFor(() => {
      expect(clearFiltersButton).not.toBeDisabled();
    });
    await user.click(clearFiltersButton);

    await waitFor(
      () => {
        expect(screen.getByText('Giant laser')).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  });

  it('renders correctly when filtering systems', async () => {
    createView('/systems?subState=N4Ig5gYglgNiBcIDiUCGA7ALiAvkA');

    await waitFor(() => {
      expect(screen.getByText('Root systems')).toBeInTheDocument();
    });

    expect(screen.getByText('Returned 1 out of 5 Systems')).toBeInTheDocument();
  });

  it('renders correctly when filtering subsystems', async () => {
    createView(
      '/systems/65328f34a40ff5301575a4e3?subState=N4Ig5gYglgNiBcIAOUBeqCGIC%2BQ',
      'system'
    );

    await waitFor(() => {
      expect(screen.getByText('Subsystems')).toBeInTheDocument();
    });

    expect(
      screen.getByText('Returned 0 out of 1 Subsystems')
    ).toBeInTheDocument();
  });

  it('can open and close the add system dialog at root', async () => {
    createView('/systems');

    await waitFor(() => {
      expect(screen.getByText('Root systems')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Add System' }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('can open and close the add subsystem dialog when not at root', async () => {
    createView('/systems/65328f34a40ff5301575a4e3', 'system');

    await waitFor(() => {
      expect(screen.getByText('Subsystems')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Add Subsystem' }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('can select and deselect systems', async () => {
    createView('/systems/65328f34a40ff5301575a4e3', 'system');

    await waitFor(() => {
      expect(screen.getByText('Subsystems')).toBeInTheDocument();
    });

    const checkboxes = await screen.findAllByRole('checkbox', {
      name: 'Toggle select row',
    });

    const smallerLaserCheckbox = checkboxes[0];

    await user.click(smallerLaserCheckbox);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Subsystems more options' })
      ).toBeInTheDocument();
    });

    await user.click(smallerLaserCheckbox);

    await waitFor(() => {
      expect(
        screen.queryByRole('button', { name: 'Subsystems more options' })
      ).not.toBeInTheDocument();
    });
  });

  it('can deselect all selected systems at once', async () => {
    createView('/systems');

    await waitFor(() => {
      expect(screen.getByText('Root systems')).toBeInTheDocument();
    });

    const checkboxes = await screen.findAllByRole('checkbox', {
      name: 'Toggle select row',
    });

    const giantLaserCheckbox = checkboxes[1];

    const pulseLaserCheckbox = checkboxes[2];

    await user.click(giantLaserCheckbox);
    await user.click(pulseLaserCheckbox);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Systems more options' })
      ).toBeInTheDocument();
    });

    await user.click(
      screen.getByRole('button', { name: 'Systems more options' })
    );

    expect(
      screen.getByRole('menuitem', { name: 'Copy to' })
    ).toBeInTheDocument();

    await user.click(
      await screen.findByRole('menuitem', { name: '2 selected' })
    );

    await waitFor(() => {
      expect(
        screen.queryByRole('menuitem', { name: 'Move to' })
      ).not.toBeInTheDocument();
    });
    expect(
      screen.queryByRole('menuitem', { name: 'Copy to' })
    ).not.toBeInTheDocument();
  });

  it('can open and close move dialog', async () => {
    createView('/systems');

    await waitFor(() => {
      expect(screen.getByText('Root systems')).toBeInTheDocument();
    });

    const checkboxes = await screen.findAllByRole('checkbox', {
      name: 'Toggle select row',
    });

    const giantLaserCheckbox = checkboxes[1];
    await user.click(giantLaserCheckbox);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Systems more options' })
      ).toBeInTheDocument();
    });

    await user.click(
      screen.getByRole('button', { name: 'Systems more options' })
    );

    await user.click(screen.getByRole('menuitem', { name: 'Move to' }));

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('can open and close copy dialog', async () => {
    createView('/systems');

    await waitFor(() => {
      expect(screen.getByText('Root systems')).toBeInTheDocument();
    });

    const checkboxes = await screen.findAllByRole('checkbox', {
      name: 'Toggle select row',
    });

    const giantLaserCheckbox = checkboxes[1];
    await user.click(giantLaserCheckbox);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Systems more options' })
      ).toBeInTheDocument();
    });

    await user.click(
      screen.getByRole('button', { name: 'Systems more options' })
    );

    await user.click(screen.getByRole('menuitem', { name: 'Copy to' }));

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('can open the edit dialog and close it again', async () => {
    createView('/systems');

    await waitFor(() => {
      expect(screen.getByText('Giant laser')).toBeInTheDocument();
    });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await clickRowAction(0, 'Edit');

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    expect(screen.getByText('Edit System')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('can open the duplicate dialog and close it again', async () => {
    createView('/systems');

    await waitFor(() => {
      expect(screen.getByText('Giant laser')).toBeInTheDocument();
    });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await clickRowAction(0, 'Duplicate');

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    expect(screen.getByText('Add System')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('can open the delete dialog and close it again', async () => {
    createView('/systems');

    await waitFor(() => {
      expect(screen.getByText('Giant laser')).toBeInTheDocument();
    });

    expect(screen.queryByTestId('delete-system-name')).not.toBeInTheDocument();

    await clickRowAction(0, 'Delete');

    await waitFor(() => {
      expect(screen.getByTestId('delete-system-name')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Continue' }));

    await waitFor(() => {
      expect(
        screen.queryByTestId('delete-system-name')
      ).not.toBeInTheDocument();
    });
  });
});
