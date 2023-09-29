import React from 'react';
import { renderComponentWithMemoryRouter } from '../../setupTests';
import { screen, waitFor } from '@testing-library/react';
import CatalogueItemsLandingPage from './catalogueItemsLandingPage.component';
import userEvent from '@testing-library/user-event';

describe('Catalogue Items Landing Page', () => {
  let user;
  const createView = (path: string) => {
    return renderComponentWithMemoryRouter(<CatalogueItemsLandingPage />, path);
  };

  beforeEach(() => {
    user = userEvent.setup();
  });

  it('renders text correctly', async () => {
    createView('/inventory-management-system/catalogue/items/1');

    await waitFor(() => {
      expect(screen.getByText('Cameras 1')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(
        screen.getByRole('link', {
          name: 'Back to Cameras table view',
        })
      ).toBeInTheDocument();
    });

    expect(screen.getByText('Description:')).toBeInTheDocument();
    expect(
      screen.getByText('High-resolution cameras for beam characterization. 1')
    ).toBeInTheDocument();

    expect(screen.getByText('Resolution')).toBeInTheDocument();
  });

  it('renders no item page correctly', async () => {
    createView('/inventory-management-system/catalogue/items/1fds');
    await waitFor(() => {
      expect(
        screen.getByText(
          `This item doesn't exist. Please click the Home button to navigate to the catalogue home`
        )
      ).toBeInTheDocument();
    });
    const editButton = screen.getByRole('button', { name: 'Edit' });
    expect(editButton).toBeDisabled();
    const homeButton = screen.getByRole('link', { name: 'Home' });
    expect(homeButton).toBeInTheDocument();
  });

  it('toggles the properties so it is either visible or hidden', async () => {
    createView('/inventory-management-system/catalogue/items/1');
    await waitFor(() => {
      expect(screen.getByText('Cameras 1')).toBeInTheDocument();
    });

    expect(
      screen.getByLabelText('Close catalogue item properties')
    ).toBeInTheDocument();

    const toggleButton = screen.getByLabelText(
      'Close catalogue item properties'
    );

    await user.click(toggleButton);
    await waitFor(() => {
      expect(
        screen.getByLabelText('Show catalogue item properties')
      ).toBeInTheDocument();
    });
  });
  it('toggles the manufacturer so it is either visible or hidden', async () => {
    createView('/inventory-management-system/catalogue/items/1');
    await waitFor(() => {
      expect(screen.getByText('Cameras 1')).toBeInTheDocument();
    });

    expect(
      screen.getByLabelText('Close catalogue item manufacturer details')
    ).toBeInTheDocument();

    const toggleButton = screen.getByLabelText(
      'Close catalogue item manufacturer details'
    );

    await user.click(toggleButton);
    await waitFor(() => {
      expect(
        screen.getByLabelText('Show catalogue item manufacturer details')
      ).toBeInTheDocument();
    });
  });

  it('opens the edit catalogue item dialog', async () => {
    createView('/inventory-management-system/catalogue/items/1');

    await waitFor(() => {
      expect(screen.getByText('Cameras 1')).toBeInTheDocument();
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
