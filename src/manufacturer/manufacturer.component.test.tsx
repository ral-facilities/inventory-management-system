import React from 'react';
import { renderComponentWithBrowserRouter } from '../setupTests';
import { screen, waitFor } from '@testing-library/react';
import Manufacturer from './manufacturer.component';
import userEvent from '@testing-library/user-event';

describe('Manufacturer', () => {
  let user;
  const createView = () => {
    return renderComponentWithBrowserRouter(<Manufacturer />);
  };
  beforeEach(() => {
    user = userEvent.setup();
  });

  it('renders table headers correctly', async () => {
    createView();

    await waitFor(() => {
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('URL')).toBeInTheDocument();
    expect(screen.getByText('Address')).toBeInTheDocument();
  });

  it('renders table data correctly', async () => {
    createView();
    await waitFor(() => {
      expect(screen.getByText('Manufacturer A')).toBeInTheDocument();
    });

    expect(screen.getByText('Manufacturer B')).toBeInTheDocument();
    expect(screen.getByText('Manufacturer C')).toBeInTheDocument();
    expect(screen.getByText('http://example.com')).toBeInTheDocument();
    expect(screen.getByText('http://test.co.uk')).toBeInTheDocument();
    expect(screen.getByText('http://123test.com')).toBeInTheDocument();
    expect(screen.getByText('10 My Street')).toBeInTheDocument();
    expect(screen.getByText('11 My Street')).toBeInTheDocument();
    expect(screen.getByText('12 My Street')).toBeInTheDocument();
  });

  it('manufacturer url has a href so therefore links to new webpage', async () => {
    createView();
    await waitFor(() => {
      expect(screen.getByText('Manufacturer A')).toBeInTheDocument();
    });
    const url = await screen.findByText('http://example.com');
    expect(url).toHaveAttribute('href', 'http://example.com');
  });

  it('highlights the row on hover', async () => {
    createView();

    await waitFor(() => {
      expect(
        screen.getByRole('row', { name: 'Manufacturer A row' })
      ).toBeInTheDocument();
    });

    const row = screen.getByRole('row', { name: 'Manufacturer A row' });

    await user.hover(row);

    expect(row).not.toHaveStyle('background-color: inherit');

    await user.unhover(row);

    await waitFor(() => {
      expect(
        screen.getByRole('row', { name: 'Manufacturer A row' })
      ).toHaveStyle('background-color: inherit');
    });
  });
});
