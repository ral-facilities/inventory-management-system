import React from 'react';
import { renderComponentWithMemoryRouter } from '../setupTests';
import { screen, waitFor } from '@testing-library/react';
import Catalogue, { matchCatalogueItemProperties } from './catalogue.component';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { server } from '../mocks/server';
import { CatalogueCategoryFormData, CatalogueItemProperty } from '../app.types';

describe('matchCatalogueItemProperties', () => {
  it('should match catalogue item properties correctly', () => {
    const formData: CatalogueCategoryFormData[] = [
      {
        name: 'Name1',
        type: 'string',
        mandatory: true,
      },
      {
        name: 'Name2',
        type: 'number',
        mandatory: false,
      },
      {
        name: 'Name3',
        type: 'boolean',
        mandatory: true,
      },
    ];

    const itemProperties: CatalogueItemProperty[] = [
      {
        name: 'Name1',
        value: 'Value1',
      },
      {
        name: 'Name2',
        value: '42',
      },
      {
        name: 'Name3',
        value: true,
      },
    ];

    const result = matchCatalogueItemProperties(formData, itemProperties);

    // Your assertions
    expect(result).toEqual(['Value1', 42, 'true']);
  });

  it('should handle missing properties', () => {
    const formData: CatalogueCategoryFormData[] = [
      {
        name: 'Name1',
        type: 'string',
        mandatory: true,
      },
      {
        name: 'Name2',
        type: 'number',
        mandatory: false,
      },
    ];

    const itemProperties: CatalogueItemProperty[] = [
      {
        name: 'Name1',
        value: 'Value1',
      },
    ];

    const result = matchCatalogueItemProperties(formData, itemProperties);

    // Your assertions for missing properties (null values)
    expect(result).toEqual(['Value1', null]);
  });
});

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
    expect(screen.getByText('High Power Lasers')).toBeInTheDocument();
    expect(screen.getByText('X-RAY Beams')).toBeInTheDocument();
  });

  it('renders catalogue items table correctly', async () => {
    createView('/inventory-management-system/catalogue/4');

    await waitFor(() => {
      expect(screen.getByText('Resolution (megapixels)')).toBeInTheDocument();
    });
  });

  it('navigates back to the root directory', async () => {
    createView('/inventory-management-system/catalogue/2');

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
    expect(screen.getByText('High Power Lasers')).toBeInTheDocument();
    expect(screen.getByText('X-RAY Beams')).toBeInTheDocument();
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

  it('no results found page after X-rays opened', async () => {
    createView('/inventory-management-system/catalogue/16');

    await waitFor(() => {
      expect(
        screen.getByText(
          'There are no catalogue categories. Please add a category using the plus icon in the top left of your screen'
        )
      ).toBeInTheDocument();
    });
  });

  it('no items found after empty category opened', async () => {
    createView('/inventory-management-system/catalogue/17');

    await waitFor(() => {
      expect(
        screen.getByText(
          'There are no items. Try adding an item by using the Add Catalogue Item button in the top right of your screen'
        )
      ).toBeInTheDocument();
    });
  });

  it('expired url opens no results page', async () => {
    createView('/inventory-management-system/catalogue/not-category');

    await waitFor(() => {
      expect(
        screen.getByText(
          'The category you searched for does not exist. Please navigate home by pressing the home button at the top left of your screen.'
        )
      ).toBeInTheDocument();
    });
  });

  it('add button disabled when expired url is used', async () => {
    createView('/inventory-management-system/catalogue/not-category');

    const addButton = screen.getByRole('button', {
      name: 'add catalogue category',
    });
    await waitFor(() => {
      expect(addButton).toBeDisabled();
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
    createView('/inventory-management-system/catalogue/1');

    await waitFor(() => {
      expect(screen.getByText('Amp Meters')).toBeInTheDocument();
    });

    const editButton = screen.getByRole('button', {
      name: 'edit Amp Meters catalogue category button',
    });
    await user.click(editButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const saveButton = screen.getByRole('button', { name: 'Save' });

    await user.type(screen.getByLabelText('Name *'), '1');
    await user.click(saveButton);
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('renders the breadcrumbs and navigate to another directory', async () => {
    createView('/inventory-management-system/catalogue/8');

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
    createView('/inventory-management-system/catalogue/4');

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
