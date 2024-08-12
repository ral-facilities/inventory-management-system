import { screen, waitFor } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import {
  CatalogueCategoryProperty,
  CatalogueCategoryPropertyType,
} from '../api/api.types';
import { CatalogueItemProperty } from '../app.types';
import { server } from '../mocks/server';
import { renderComponentWithRouterProvider } from '../testUtils';
import Catalogue, { matchCatalogueItemProperties } from './catalogue.component';

describe('matchCatalogueItemProperties', () => {
  it('should match catalogue item properties correctly', () => {
    const formData: CatalogueCategoryProperty[] = [
      {
        id: '1',
        name: 'Name1',
        type: CatalogueCategoryPropertyType.Text,
        mandatory: true,
        unit_id: null,
        unit: null,
        allowed_values: null,
      },
      {
        id: '2',
        name: 'Name2',
        type: CatalogueCategoryPropertyType.Number,
        mandatory: false,
        unit_id: null,
        unit: null,
        allowed_values: null,
      },
      {
        id: '3',
        name: 'Name3',
        type: CatalogueCategoryPropertyType.Boolean,
        mandatory: true,
        unit_id: null,
        unit: null,
        allowed_values: null,
      },
    ];

    const itemProperties: CatalogueItemProperty[] = [
      {
        id: '1',
        value: 'Value1',
      },
      {
        id: '2',
        value: '42',
      },
      {
        id: '3',
        value: true,
      },
    ];

    const result = matchCatalogueItemProperties(formData, itemProperties);

    // Your assertions
    expect(result).toEqual(['Value1', '42', 'true']);
  });

  it('should handle missing properties', () => {
    const formData: CatalogueCategoryProperty[] = [
      {
        id: '1',
        name: 'Name1',
        type: CatalogueCategoryPropertyType.Text,
        mandatory: true,
        unit_id: null,
        unit: null,
        allowed_values: null,
      },
      {
        id: '2',
        name: 'Name2',
        type: CatalogueCategoryPropertyType.Number,
        mandatory: false,
        unit_id: null,
        unit: null,
        allowed_values: null,
      },
    ];

    const itemProperties: CatalogueItemProperty[] = [
      {
        id: '1',
        value: 'Value1',
      },
    ];

    const result = matchCatalogueItemProperties(formData, itemProperties);

    // Your assertions for missing properties (null values)
    expect(result).toEqual(['Value1', null]);
  });
});

describe('Catalogue', () => {
  let user: UserEvent;
  const createView = (path: string) => {
    return renderComponentWithRouterProvider(<Catalogue />, 'catalogue', path);
  };

  beforeEach(() => {
    user = userEvent.setup();

    window.Element.prototype.getBoundingClientRect = vi
      .fn()
      .mockReturnValue({ height: 100, width: 200 });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('progress bar renders correctly', async () => {
    createView('/catalogue');

    await waitFor(() => {
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });

  it('renders catalogue category card view correctly', async () => {
    createView('/catalogue');

    await waitFor(() => {
      expect(screen.getByText('Beam Characterization')).toBeInTheDocument();
    });
    expect(screen.getByText('Motion')).toBeInTheDocument();
    expect(screen.getByText('Vacuum Technology')).toBeInTheDocument();
    expect(screen.getByText('High Power Lasers')).toBeInTheDocument();
    expect(screen.getByText('X-RAY Beams')).toBeInTheDocument();
  });

  it('renders catalogue items table correctly', async () => {
    createView('/catalogue/4');

    await waitFor(() => {
      expect(screen.getByText('Cameras 1')).toBeInTheDocument();
    });
  });

  it('navigates back to the root directory', async () => {
    createView('/catalogue/2');

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
    createView('/catalogue');

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
    createView('/catalogue/16');

    await waitFor(() => {
      expect(
        screen.getByText(
          'There are no catalogue categories. Please add a category using the plus icon in the top left of your screen'
        )
      ).toBeInTheDocument();
    });
  });

  it('no items found after empty category opened', async () => {
    createView('/catalogue/17');

    await waitFor(() => {
      expect(
        screen.getByText(
          'No results found: Try adding an item by using the Add Catalogue Item button on the top left of your screen'
        )
      ).toBeInTheDocument();
    });
  });

  it('expired url opens no results page', async () => {
    createView('/catalogue/not-category');

    await waitFor(() => {
      expect(
        screen.getByText(
          'The category you searched for does not exist. Please navigate home by pressing the home button at the top left of your screen.'
        )
      ).toBeInTheDocument();
    });
  });

  it('add button disabled when expired url is used', async () => {
    createView('/catalogue/not-category');

    const addButton = screen.getByRole('button', {
      name: 'add catalogue category',
    });
    await waitFor(() => {
      expect(addButton).toBeDisabled();
    });
  });

  it('root has no categories so there is no results page', async () => {
    server.use(
      http.get('/v1/catalogue-categories', () => {
        return HttpResponse.json([], { status: 200 });
      })
    );

    createView('/catalogue');

    await waitFor(() => {
      expect(
        screen.getByText(
          'There are no catalogue categories. Please add a category using the plus icon in the top left of your screen'
        )
      ).toBeInTheDocument();
    });
  });

  it('opens the delete catalogue category dialog', async () => {
    createView('/catalogue');

    await waitFor(() => {
      expect(screen.getByText('Beam Characterization')).toBeInTheDocument();
    });

    const actionsButton = screen.getByRole('button', {
      name: 'actions Beam Characterization catalogue category button',
    });
    await user.click(actionsButton);

    const deleteButton = screen.getByRole('menuitem', {
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
    createView('/catalogue/1');

    await waitFor(() => {
      expect(screen.getByText('Amp Meters')).toBeInTheDocument();
    });

    const actionsButton = screen.getByRole('button', {
      name: 'actions Amp Meters catalogue category button',
    });
    await user.click(actionsButton);

    const editButton = screen.getByRole('menuitem', {
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

  it('can open the save as catalogue category dialog and close it again', async () => {
    createView('/catalogue/1');

    await waitFor(() => {
      expect(screen.getByText('Amp Meters')).toBeInTheDocument();
    });

    const actionsButton = screen.getByRole('button', {
      name: 'actions Amp Meters catalogue category button',
    });
    await user.click(actionsButton);

    const editButton = screen.getByRole('menuitem', {
      name: 'save as Amp Meters catalogue category button',
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
    createView('/catalogue/8');

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
    createView('/catalogue');
    await waitFor(() => {
      expect(screen.getByText('Beam Characterization')).toBeInTheDocument();
    });
    expect(screen.getByText('Motion')).toBeInTheDocument();
    expect(screen.getByText('Vacuum Technology')).toBeInTheDocument();

    const beamButton = screen.getByText('Beam Characterization');
    await user.click(beamButton);
    await waitFor(() => {
      expect(screen.getByText('Cameras')).toBeInTheDocument();
    });
    expect(screen.getByText('Energy Meters')).toBeInTheDocument();
    expect(screen.getByText('Wavefront Sensors')).toBeInTheDocument();
  });

  it('opens add catalogue item dialog and can close the dialog', async () => {
    createView('/catalogue/4');

    await waitFor(() => {
      expect(
        screen.getByRole('button', {
          name: 'Add Catalogue Item',
        })
      ).toBeInTheDocument();
    });

    const addCatalogueItemButton = screen.getByRole('button', {
      name: 'Add Catalogue Item',
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
  }, 10000);

  it('opens move catalogue category dialog and can closes the dialog', async () => {
    createView('/catalogue/1');

    await waitFor(() => {
      expect(screen.getByText('Cameras')).toBeInTheDocument();
    });

    const camerasCheckbox = screen.getByLabelText('Cameras checkbox');

    await user.click(camerasCheckbox);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Move to' })
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Move to' }));

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('opens copy catalogue category dialog and can close the dialog', async () => {
    createView('/catalogue/1');

    await waitFor(() => {
      expect(screen.getByText('Cameras')).toBeInTheDocument();
    });

    const camerasCheckbox = screen.getByLabelText('Cameras checkbox');

    await user.click(camerasCheckbox);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Copy to' })
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Copy to' }));

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
  it('selects and deselects catalogue categories', async () => {
    createView('/catalogue/1');

    await waitFor(() => {
      expect(screen.getByText('Energy Meters')).toBeInTheDocument();
    });

    const energyMetersCheckbox = screen.getByLabelText(
      'Energy Meters checkbox'
    );

    await user.click(energyMetersCheckbox);

    const camerasCheckbox = screen.getByLabelText('Cameras checkbox');

    await user.click(camerasCheckbox);

    await user.click(energyMetersCheckbox);
    await user.click(camerasCheckbox);

    await waitFor(() => {
      expect(
        screen.queryByRole('button', { name: 'Move to' })
      ).not.toBeInTheDocument();
    });
  });

  it('selects and deselects all catalogue categories', async () => {
    createView('/catalogue/1');

    await waitFor(() => {
      expect(screen.getByText('Energy Meters')).toBeInTheDocument();
    });

    const energyMetersCheckbox = screen.getByLabelText(
      'Energy Meters checkbox'
    );

    await user.click(energyMetersCheckbox);

    const camerasCheckbox = screen.getByLabelText('Cameras checkbox');

    await user.click(camerasCheckbox);

    const clearSelected = await screen.findByRole('button', {
      name: '2 selected',
    });

    await user.click(clearSelected);

    await waitFor(() => {
      expect(
        screen.queryByRole('button', { name: 'Move to' })
      ).not.toBeInTheDocument();
    });
  });
});
