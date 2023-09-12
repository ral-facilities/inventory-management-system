import React from 'react';
import { renderComponentWithMemoryRouter } from '../setupTests';
import { screen, waitFor } from '@testing-library/react';
import Catalogue from './catalogue.component';
import userEvent from '@testing-library/user-event';

describe('Catalogue', () => {
  let user;
  const createView = (path: string) => {
    return renderComponentWithMemoryRouter(<Catalogue />, path);
  };

  beforeEach(() => {
    user = userEvent.setup();
  });

  it('renders catalogue category card view correctly', async () => {
    createView('/inventory-management-system/catalogue');

    await waitFor(() => {
      expect(screen.getByText('Beam Characterization')).toBeInTheDocument();
    });
    expect(screen.getByText('Motion')).toBeInTheDocument();
    expect(screen.getByText('Vacuum Technology')).toBeInTheDocument();
  });

  it('renders catalogue items table correctly', async () => {
    createView(
      '/inventory-management-system/catalogue/beam-characterization/cameras'
    );

    await waitFor(() => {
      expect(screen.getByText('Resolution (megapixels)')).toBeInTheDocument();
    });
  });

  it('navigates back to the root directory', async () => {
    createView('/inventory-management-system/catalogue/motion');

    await waitFor(() => {
      expect(screen.getByText('Actuators')).toBeInTheDocument();
    });

    const homeButton = await screen.findByTestId('home-button-catalogue');
    await user.click(homeButton);
    await waitFor(() => {
      expect(screen.getByText('Beam Characterization')).toBeInTheDocument();
    });
    expect(screen.getByText('Motion')).toBeInTheDocument();
    expect(screen.getByText('Vacuum Technology')).toBeInTheDocument();
  });
  it('opens the add catalogue category dialog', async () => {
    createView('/inventory-management-system/catalogue');

    const addButton = await screen.findByTestId('AddIcon');
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const closeButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(closeButton);
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('opens the delete catalogue category dialog', async () => {
    createView('/inventory-management-system/catalogue');

    await waitFor(() => {
      expect(screen.getByText('Beam Characterization')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByTestId(
      'delete-catalogue-category-button'
    );
    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const continueButton = screen.getByRole('button', { name: 'Continue' });
    await user.click(continueButton);
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('opens the edit catalogue category dialog', async () => {
    createView('/inventory-management-system/catalogue');

    await waitFor(() => {
      expect(screen.getByText('Beam Characterization')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByTestId(
      'edit-catalogue-category-button'
    );
    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const saveButton = screen.getByRole('button', { name: 'Save' });
    await user.click(saveButton);
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('renders the breadcumbs and navigate to another directory', async () => {
    createView('/inventory-management-system/catalogue/motion/actuators');

    await waitFor(() => {
      expect(screen.getByRole('link', { name: 'motion' })).toBeInTheDocument();
    });
    await user.click(screen.getByRole('link', { name: 'motion' }));

    await waitFor(() => {
      expect(
        screen.queryByRole('link', { name: 'motion' })
      ).not.toBeInTheDocument();
    });
  });

  it('updates the cards when a card button is clicked', async () => {
    createView('/inventory-management-system/catalogue');
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

  it('opens add catelogue item dialog and can closes the dialog', async () => {
    createView(
      '/inventory-management-system/catalogue/beam-characterization/cameras'
    );

    const addCatalogueItemButton = screen.getByRole('button', {
      name: 'Add Catalogue Item',
    });
    await waitFor(() => {
      expect(addCatalogueItemButton).not.toBeDisabled();
    });

    await user.click(addCatalogueItemButton);
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
