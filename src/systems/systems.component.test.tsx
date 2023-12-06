import React from 'react';
import { renderComponentWithMemoryRouter } from '../setupTests';
import { screen, waitFor, within } from '@testing-library/react';
import Systems from './systems.component';
import userEvent from '@testing-library/user-event';

describe('Systems', () => {
  let user;
  const createView = (path: string) => {
    return renderComponentWithMemoryRouter(<Systems />, path);
  };

  beforeEach(() => {
    user = userEvent.setup();
  });

  it('renders correctly', async () => {
    createView('/inventory-management-system/systems');

    await waitFor(() => {
      expect(screen.getByText('Root systems')).toBeInTheDocument();
    });

    expect(screen.getByText('Giant laser')).toBeInTheDocument();
  });

  it('renders correctly when viewing a specific system', async () => {
    createView('/inventory-management-system/systems/65328f34a40ff5301575a4e3');

    await waitFor(() => {
      expect(screen.getByText('Subsystems')).toBeInTheDocument();
    });

    expect(screen.getByText('Smaller laser')).toBeInTheDocument();
  });

  it('renders the breadcrumbs when navigating to subsystems', async () => {
    createView('/inventory-management-system/systems');

    await waitFor(() => {
      expect(
        screen.getByRole('link', { name: 'Giant laser' })
      ).toBeInTheDocument();
    });
    await user.click(screen.getByRole('link', { name: 'Giant laser' }));

    await waitFor(() => {
      expect(screen.getByText('Smaller laser')).toBeInTheDocument();
    });

    expect(screen.getAllByText('Giant laser').length).toBe(2);

    await waitFor(() => {
      expect(
        screen.getByRole('link', { name: 'Smaller laser' })
      ).toBeInTheDocument();
    });
    await user.click(screen.getByRole('link', { name: 'Smaller laser' }));

    expect(
      screen.getByRole('link', { name: 'Giant laser' })
    ).toBeInTheDocument();
    expect(screen.getAllByText('Smaller laser').length).toBe(2);
  });

  it('navigates back a system using the breadcrumbs', async () => {
    createView('/inventory-management-system/systems/65328f34a40ff5301575a4e4');

    await waitFor(() => {
      expect(screen.getByText('Smaller laser')).toBeInTheDocument();
    });

    await user.click(
      screen.getByRole('link', {
        name: 'Giant laser',
      })
    );
    await waitFor(() => {
      expect(
        screen.queryByRole('link', {
          name: 'Giant laser',
        })
      ).not.toBeInTheDocument();
    });
    expect(screen.getByText('Smaller laser')).toBeInTheDocument();
  });

  it('navigates back to the root systems when home button clicked', async () => {
    createView('/inventory-management-system/systems/65328f34a40ff5301575a4e3');

    await waitFor(() => {
      expect(screen.getByText('Smaller laser')).toBeInTheDocument();
    });

    const homeButton = screen.getByRole('button', {
      name: 'navigate to systems home',
    });
    await user.click(homeButton);
    await waitFor(() => {
      expect(screen.getByText('Giant laser')).toBeInTheDocument();
    });
    expect(screen.getByText('Root systems')).toBeInTheDocument();
  });

  it('can open and close the add system dialog at root', async () => {
    createView('/inventory-management-system/systems');

    await waitFor(() => {
      expect(screen.getByText('Root systems')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'add system' }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('can open and close the add subsystem dialog when not at root', async () => {
    createView('/inventory-management-system/systems/65328f34a40ff5301575a4e3');

    await waitFor(() => {
      expect(screen.getByText('Subsystems')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'add subsystem' }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('can select and deselect systems', async () => {
    createView('/inventory-management-system/systems');

    await waitFor(() => {
      expect(screen.getByText('Root systems')).toBeInTheDocument();
    });

    const giantLaserCheckbox = within(
      screen.getByRole('link', { name: 'Giant laser' })
    ).getByRole('checkbox');
    const pulseLaserCheckbox = within(
      screen.getByRole('link', { name: 'Pulse Laser' })
    ).getByRole('checkbox');

    await user.click(giantLaserCheckbox);
    await user.click(pulseLaserCheckbox);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Move to' })
      ).toBeInTheDocument();
    });

    await user.click(giantLaserCheckbox);
    await user.click(pulseLaserCheckbox);

    await waitFor(() => {
      expect(
        screen.queryByRole('button', { name: 'Move to' })
      ).not.toBeInTheDocument();
    });
  });

  it('can deselect all selected systems at once', async () => {
    createView('/inventory-management-system/systems');

    await waitFor(() => {
      expect(screen.getByText('Root systems')).toBeInTheDocument();
    });

    const giantLaserCheckbox = within(
      screen.getByRole('link', { name: 'Giant laser' })
    ).getByRole('checkbox');
    const pulseLaserCheckbox = within(
      screen.getByRole('link', { name: 'Pulse Laser' })
    ).getByRole('checkbox');

    await user.click(giantLaserCheckbox);
    await user.click(pulseLaserCheckbox);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Move to' })
      ).toBeInTheDocument();
    });

    await user.click(screen.queryByRole('button', { name: '2 selected' }));

    await waitFor(() => {
      expect(
        screen.queryByRole('button', { name: 'Move to' })
      ).not.toBeInTheDocument();
    });
  });

  it('can open and close move dialog', async () => {
    createView('/inventory-management-system/systems');

    await waitFor(() => {
      expect(screen.getByText('Root systems')).toBeInTheDocument();
    });

    const giantLaserCheckbox = within(
      screen.getByRole('link', { name: 'Giant laser' })
    ).getByRole('checkbox');
    await user.click(giantLaserCheckbox);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Move to' })
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Move to' }));

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});
