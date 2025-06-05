import { screen, waitFor, within } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { paths } from '../App';
import { renderComponentWithRouterProvider } from '../testUtils';
import Systems from './systems.component';

describe('Systems', () => {
  // Quite a few of these take more than 5 seconds on CI
  vi.setConfig({ testTimeout: 14000 });

  let user: UserEvent;
  const createView = (path: string, urlPathKey?: keyof typeof paths) => {
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
    expect(screen.getByText('Total Systems: 3')).toBeInTheDocument();
  });

  it('renders correctly when viewing a specific system', async () => {
    createView('/systems/65328f34a40ff5301575a4e3', 'system');

    await waitFor(() => {
      expect(screen.getByText('Subsystems')).toBeInTheDocument();
    });

    expect(screen.getByText('Smaller laser')).toBeInTheDocument();
    expect(screen.getByText('Total Subsystems: 1')).toBeInTheDocument();
  });

  it('renders correctly when filtering systems', async () => {
    createView('/systems?subState=N4Ig5gYglgNiBcIDiUCGA7ALiAvkA');

    await waitFor(() => {
      expect(screen.getByText('Root systems')).toBeInTheDocument();
    });

    expect(screen.getByText('Returned 1 out of 3 Systems')).toBeInTheDocument();
  });

  it('renders correctly when filtering subsystems', async () => {
    createView(
      '/systems/65328f34a40ff5301575a4e3?subState=N4Ig5gYglgNiBcIAqBTAzgFxAXyA',
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

    const smallerLaserCheckbox = within(
      screen.getByRole('row', { name: 'Toggle select row Smaller laser' })
    ).getByRole('checkbox');

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

    const giantLaserCheckbox = within(
      screen.getByRole('row', { name: 'Toggle select row Giant laser' })
    ).getByRole('checkbox');
    const pulseLaserCheckbox = within(
      screen.getByRole('row', { name: 'Toggle select row Pulse Laser' })
    ).getByRole('checkbox');

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

    const giantLaserCheckbox = within(
      screen.getByRole('row', { name: 'Toggle select row Giant laser' })
    ).getByRole('checkbox');
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

    const giantLaserCheckbox = within(
      screen.getByRole('row', { name: 'Toggle select row Giant laser' })
    ).getByRole('checkbox');
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

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    await waitFor(() => {
      expect(
        screen.queryByTestId('delete-system-name')
      ).not.toBeInTheDocument();
    });
  });
});
