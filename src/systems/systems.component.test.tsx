import React from 'react';
import { renderComponentWithMemoryRouter } from '../setupTests';
import { screen, waitFor } from '@testing-library/react';
import Systems from './systems.component';

describe('Systems', () => {
  const createView = (path: string) => {
    return renderComponentWithMemoryRouter(<Systems />, path);
  };

  it('renders correctly', async () => {
    createView("/inventory-management-system/systems");
    expect(screen.getByText('Root systems')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Giant laser")).toBeInTheDocument();
    })
  });

  it('renders correctly when viewing a specific system', async () => {
    createView("/inventory-management-system/systems/giant-laser");
    expect(screen.getByText('Subsystems')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Smaller laser")).toBeInTheDocument();
    })
  });
});
