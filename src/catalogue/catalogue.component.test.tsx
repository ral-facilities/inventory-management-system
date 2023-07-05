import React from 'react';
import { renderComponentWithMemoryRouter } from '../setupTests';
import { screen, waitFor } from '@testing-library/react';
import Catalogue from './catalogue.component';
import userEvent from '@testing-library/user-event';

describe('Catalogue', () => {
  const createView = (path: string) => {
    return renderComponentWithMemoryRouter(<Catalogue />, path);
  };

  it('renders text correctly', async () => {
    createView('/');

    await waitFor(() => {
      expect(screen.getByText('Beam Characterization')).toBeInTheDocument();
    });
    expect(screen.getByText('Motion')).toBeInTheDocument();
    expect(screen.getByText('Vacuum Technology')).toBeInTheDocument();
  });
  it('updates the cards when a card button is clicked', async () => {
    const user = userEvent.setup();
    createView('/');
    await waitFor(() => {
      expect(screen.getByText('Beam Characterization')).toBeInTheDocument();
    });
    expect(screen.getByText('Motion')).toBeInTheDocument();
    expect(screen.getByText('Vacuum Technology')).toBeInTheDocument();

    const beamButton = screen.getByText('Beam Characterization');
    user.click(beamButton);
    await waitFor(() => {
      expect(screen.getByText('Cameras')).toBeInTheDocument();
    });
    expect(screen.getByText('Energy Meters')).toBeInTheDocument();
    expect(screen.getByText('Wavefront Sensors')).toBeInTheDocument();
  });
});
