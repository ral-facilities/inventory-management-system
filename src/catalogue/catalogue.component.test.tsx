import React from 'react';
import { renderComponentWithMemoryRouter } from '../setupTests';
import { screen, waitFor } from '@testing-library/react';
import Catalogue from './catalogue.component';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { server } from '../mocks/server';

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
    expect(screen.getByText('mock')).toBeInTheDocument();
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

    const homeButton = screen.getByRole('button', {
      name: 'navigate to catalogue home',
    });
    await user.click(homeButton);
    await waitFor(() => {
      expect(screen.getByText('Beam Characterization')).toBeInTheDocument();
    });
    expect(screen.getByText('Motion')).toBeInTheDocument();
    expect(screen.getByText('Vacuum Technology')).toBeInTheDocument();
    expect(screen.getByText('mock')).toBeInTheDocument();
  });
  it('opens the add catalogue category dialog', async () => {
    createView('/inventory-management-system/catalogue');

    const addButton = screen.getByRole('button', {
      name: 'add catalogue category',
    });
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

  it('no results found page after empty opened', async () => {
    createView('/inventory-management-system/catalogue/empty');

    await waitFor(() => {
      expect(
        screen.getByText(
          'There are no catalogue categories. Please add a category using the plus icon in the top left of your screen'
        )
      ).toBeInTheDocument();
    });
  });

  it('no items found after empty mock opened', async () => {
    createView('/inventory-management-system/catalogue/mock/mock-empty');

    await waitFor(() => {
      expect(
        screen.getByText(
          'There are no items. Try adding an item by using the Add Catalogue Item button in the top right of your screen'
        )
      ).toBeInTheDocument();
    });
  });

  it('expired url opens no results page', async () => {
    createView('/inventory-management-system/catalogue/not-cat');

    await waitFor(() => {
      expect(
        screen.getByText(
          'The category you searched for does not exist. Try searching for a different category or use the add button to add the category.'
        )
      ).toBeInTheDocument();
    });
  });

  it('root has no categories so there is no results page', async () => {
    server.use(
      rest.get('/v1/catalogue-categories/', (req, res, ctx) => {
        return res(ctx.status(200), ctx.json([]));
      })
    );

    createView('/inventory-management-system/catalogue');

    await waitFor(() => {
      expect(
        screen.getByText(
          'There are no catalogue categories. Please add a category using the plus icon in the top left of your screen'
        )
      ).toBeInTheDocument();
    });
  });

  it('opens the delete catalogue category dialog', async () => {
    createView('/inventory-management-system/catalogue');

    await waitFor(() => {
      expect(screen.getByText('Beam Characterization')).toBeInTheDocument();
    });

    const deleteButton = screen.getByRole('button', {
      name: 'delete Beam Characterization catalogue category button',
    });
    await user.click(deleteButton);

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

    const editButton = screen.getByRole('button', {
      name: 'edit Beam Characterization catalogue category button',
    });
    await user.click(editButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const saveButton = screen.getByRole('button', { name: 'Save' });
    await user.click(saveButton);
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('renders the breadcrumbs and navigate to another directory', async () => {
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

  it('opens add catalogue item dialog and can closes the dialog', async () => {
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
