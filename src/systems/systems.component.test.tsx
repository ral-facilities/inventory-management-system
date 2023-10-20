import React from 'react';
import { renderComponentWithMemoryRouter } from '../setupTests';
import { screen, waitFor } from '@testing-library/react';
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
    expect(screen.getByText('Root systems')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Giant laser')).toBeInTheDocument();
    });
  });

  it('renders correctly when viewing a specific system', async () => {
    createView('/inventory-management-system/systems/65328f34a40ff5301575a4e3');
    expect(screen.getByText('Subsystems')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Smaller laser')).toBeInTheDocument();
    });
  });

  it('navigates back to the root directory when home button clicked', async () => {
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
});
