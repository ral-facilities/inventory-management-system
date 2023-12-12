import React from 'react';
import { renderComponentWithMemoryRouter } from '../setupTests';
import { screen, waitFor } from '@testing-library/react';
import ManufacturerLandingPage from './manufacturerLandingPage.component';
import userEvent from '@testing-library/user-event';

describe('Manufacturer Landing page', () => {
  let user;
  const createView = (path: string) => {
    return renderComponentWithMemoryRouter(<ManufacturerLandingPage />, path);
  };
  beforeEach(() => {
    user = userEvent.setup();
  });

  it('landing page renders data correctly', async () => {
    createView('/manufacturer/1');

    await waitFor(() => {
      expect(screen.getByText('Manufacturer A')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(
        screen.getByRole('link', { name: 'Manufacturer table view' })
      ).toBeInTheDocument();
    });
    expect(screen.getByText('URL:')).toBeInTheDocument();
    expect(screen.getByText('http://example.com')).toBeInTheDocument();
    expect(screen.getByText('Telephone number:')).toBeInTheDocument();
    expect(screen.getByText('07334893348')).toBeInTheDocument();
    expect(screen.getByText('Address')).toBeInTheDocument();
  });

  it('shows no manufacturer page correctly', async () => {
    createView('/manufacturer/invalid');

    await waitFor(() => {
      expect(
        screen.getByText(
          `This manufacturer doesn't exist. Please click the Home button to navigate to the manufacturer table`
        )
      ).toBeInTheDocument();
    });
    const editButton = screen.getByRole('button', { name: 'Edit' });
    expect(editButton).toBeDisabled();
    const homeButton = screen.getByRole('link', { name: 'Home' });
    expect(homeButton).toBeInTheDocument();
  });

  it('shows the loading indicator', async () => {
    createView('/manufacturer/1');

    await waitFor(() => {
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });

  it('opens and closes the edit manufacturer dialog', async () => {
    createView('/manufacturer/1');

    await waitFor(() => {
      expect(screen.getByText('Manufacturer A')).toBeInTheDocument();
    });

    const editButton = screen.getByRole('button', {
      name: 'Edit',
    });
    await user.click(editButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});
