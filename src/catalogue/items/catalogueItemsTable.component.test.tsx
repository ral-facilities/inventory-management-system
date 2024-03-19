import { screen, waitFor } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import {
  getCatalogueCategoryById,
  renderComponentWithRouterProvider,
} from '../../testUtils';
import CatalogueItemsTable, {
  CatalogueItemsTableProps,
} from './catalogueItemsTable.component';

vi.setConfig({ testTimeout: 10000 });

describe('Catalogue Items Table', () => {
  let props: CatalogueItemsTableProps;
  let user: UserEvent;

  const createView = () => {
    return renderComponentWithRouterProvider(
      <CatalogueItemsTable {...props} />,
      undefined
    );
  };

  const ensureColumnsVisible = async (columns: string[]) => {
    await user.click(screen.getByRole('button', { name: 'Show/Hide columns' }));
    await user.click(screen.getByText('Hide all'));

    for (const column of columns) {
      await user.click(screen.getByText(column));
      expect(screen.getAllByText(column).length).toEqual(2);
    }
  };

  beforeEach(() => {
    props = {
      parentInfo: getCatalogueCategoryById('5'),
      dense: false,
    };
    user = userEvent.setup();
    window.ResizeObserver = vi.fn().mockImplementation(() => ({
      disconnect: vi.fn(),
      observe: vi.fn(),
      unobserve: vi.fn(),
    }));
    window.Element.prototype.getBoundingClientRect = vi
      .fn()
      .mockReturnValue({ height: 100, width: 200 });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders table correctly (section 1 due to column virtualisation )', async () => {
    createView();
    await waitFor(() => {
      expect(screen.getByText('Name')).toBeInTheDocument();
    });
    expect(screen.getByText('Last modified')).toBeInTheDocument();
  });

  it('renders table correctly (Cameras more details)', async () => {
    props.parentInfo = getCatalogueCategoryById('4');
    createView();
    await waitFor(() => {
      expect(screen.getByText('Name')).toBeInTheDocument();
    });

    await ensureColumnsVisible([
      'Sensor brand',
      'Cost to Rework (£)',
      'Days to Rework',
    ]);
  });

  it('renders table correctly (more details)', async () => {
    props.parentInfo = getCatalogueCategoryById('4');
    createView();
    await waitFor(() => {
      expect(screen.getByText('Name')).toBeInTheDocument();
    });

    await ensureColumnsVisible([
      'Obsolete replacement link',
      'Obsolete Reason',
      'Cost to Rework (£)',
    ]);
  });

  it('renders table correctly (section 2 due to column virtualisation )', async () => {
    createView();
    await waitFor(() => {
      expect(screen.getByText('Name')).toBeInTheDocument();
    });

    await ensureColumnsVisible([
      'Measurement Range (Joules)',
      'Accuracy',
      'Cost (£)',
    ]);
  });

  it('opens add catalogue item dialog and can close the dialog', async () => {
    createView();

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
  });

  it('renders table correctly (section 3 due to column virtualisation )', async () => {
    createView();
    await waitFor(() => {
      expect(screen.getByText('Name')).toBeInTheDocument();
    });

    await ensureColumnsVisible([
      'Time to replace (days)',
      'Days to Rework',
      'Drawing Number',
    ]);
  });

  it('renders table correctly for properties with type boolean', async () => {
    props.parentInfo = getCatalogueCategoryById('4');
    createView();
    await waitFor(() => {
      expect(screen.getByText('Name')).toBeInTheDocument();
    });

    await ensureColumnsVisible(['Broken', 'Older than five years']);
  });

  it('renders table correctly (section 4 due to column virtualisation )', async () => {
    createView();
    await waitFor(() => {
      expect(screen.getByText('Name')).toBeInTheDocument();
    });

    await ensureColumnsVisible([
      'Drawing Link',
      'Item Model Number',
      'Created',
    ]);
  });

  it('renders table correctly (section 5 due to column virtualisation)', async () => {
    createView();
    await waitFor(() => {
      expect(screen.getByText('Name')).toBeInTheDocument();
    });

    await ensureColumnsVisible([
      'Manufacturer Name',
      'Manufacturer URL',
      'Manufacturer Telephone',
    ]);
  });

  it('renders table correctly (section 6 due to column virtualisation )', async () => {
    createView();
    await waitFor(() => {
      expect(screen.getByText('Name')).toBeInTheDocument();
    });

    await ensureColumnsVisible([
      'Manufacturer Address',
      'Is Obsolete',
      'Notes',
    ]);
  });

  it('displays descriptions tooltip on hover', async () => {
    createView();

    await waitFor(() => {
      expect(screen.getByText('Last modified')).toBeInTheDocument();
    });

    await ensureColumnsVisible(['Description']);

    await waitFor(() => {
      expect(
        screen.getByLabelText(
          'Catalogue item description: Precision energy meters for accurate measurements. 26'
        )
      ).toBeInTheDocument();
    });

    const infoIcon = screen.getByLabelText(
      'Catalogue item description: Precision energy meters for accurate measurements. 26'
    );

    await user.hover(infoIcon);

    await waitFor(() => {
      expect(
        screen.getByText(
          'Precision energy meters for accurate measurements. 26'
        )
      ).toBeInTheDocument();
    });

    await user.unhover(infoIcon);

    await waitFor(() => {
      expect(
        screen.queryByText(
          'Precision energy meters for accurate measurements. 26'
        )
      ).not.toBeInTheDocument();
    });
  });

  it('displays notes tooltip on hover', async () => {
    createView();

    await ensureColumnsVisible(['Notes']);

    await waitFor(() => {
      expect(
        screen.getByLabelText(
          'Catalogue item note: Need to find new manufacturer. 26'
        )
      ).toBeInTheDocument();
    });

    const infoIcon = screen.getByLabelText(
      'Catalogue item note: Need to find new manufacturer. 26'
    );

    await user.hover(infoIcon);

    await waitFor(() => {
      expect(
        screen.getByText('Need to find new manufacturer. 26')
      ).toBeInTheDocument();
    });

    await user.unhover(infoIcon);

    await waitFor(() => {
      expect(
        screen.queryByText('Need to find new manufacturer. 26')
      ).not.toBeInTheDocument();
    });
  });

  it('opens the delete catalogue item dialog and can delete an item', async () => {
    createView();

    await waitFor(() => {
      expect(screen.getByText('Energy Meters 26')).toBeInTheDocument();
    });
    const rowActionsButton = screen.getAllByLabelText('Row Actions');
    await user.click(rowActionsButton[0]);

    await waitFor(() => {
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    const deleteButton = screen.getByText('Delete');

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

  it('opens the edit catalogue item dialog', async () => {
    createView();

    await waitFor(() => {
      expect(screen.getByText('Energy Meters 26')).toBeInTheDocument();
    });
    const rowActionsButton = screen.getAllByLabelText('Row Actions');
    await user.click(rowActionsButton[0]);

    await waitFor(() => {
      expect(screen.getByText('Edit')).toBeInTheDocument();
    });

    const editButton = screen.getByText('Edit');
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

  it('opens the edit catalogue item dialog (more catalogue item details filled in)', async () => {
    createView();

    await waitFor(() => {
      expect(screen.getByText('Energy Meters 27')).toBeInTheDocument();
    });
    const rowActionsButton = screen.getAllByLabelText('Row Actions');
    await user.click(rowActionsButton[1]);

    await waitFor(() => {
      expect(screen.getByText('Edit')).toBeInTheDocument();
    });

    const editButton = screen.getByText('Edit');
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

  it('opens and closes the catalogue item dialog for save as', async () => {
    createView();

    await waitFor(() => {
      expect(screen.getByText('Energy Meters 26')).toBeInTheDocument();
    });
    const rowActionsButton = screen.getAllByLabelText('Row Actions');
    await user.click(rowActionsButton[0]);

    await waitFor(() => {
      expect(screen.getByText('Save as')).toBeInTheDocument();
    });

    const saveAsButton = screen.getByText('Save as');
    await user.click(saveAsButton);
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('opens the add catalogue item dialog for save as (more catalogue item details filled in)', async () => {
    createView();

    await waitFor(() => {
      expect(screen.getByText('Energy Meters 27')).toBeInTheDocument();
    });
    const rowActionsButton = screen.getAllByLabelText('Row Actions');
    await user.click(rowActionsButton[1]);

    await waitFor(() => {
      expect(screen.getByText('Save as')).toBeInTheDocument();
    });

    const saveAsButton = screen.getByText('Save as');
    await user.click(saveAsButton);
  });

  it('navigates to replacement obsolete item', async () => {
    createView();
    await waitFor(() => {
      expect(screen.getByText('Energy Meters 26')).toBeInTheDocument();
    });
    await ensureColumnsVisible(['Obsolete replacement link']);

    const url = screen.queryAllByText('Click here');
    expect(url[0]).toHaveAttribute('href', '/item/6');
  });

  it('navigates to catalogue item landing page', async () => {
    createView();
    await waitFor(() => {
      expect(screen.getByText('Energy Meters 26')).toBeInTheDocument();
    });
    await ensureColumnsVisible(['Name']);

    const url = screen.getByText('Energy Meters 26');
    expect(url).toHaveAttribute('href', '/item/89');
  });

  it('navigates to items table', async () => {
    createView();
    await waitFor(() => {
      expect(screen.getByText('Energy Meters 26')).toBeInTheDocument();
    });
    await ensureColumnsVisible(['View Items']);

    const url = screen.queryAllByText('Click here');
    expect(url[0]).toHaveAttribute('href', '/item/89/items');
  });

  it('navigates to drawing link', async () => {
    createView();
    await waitFor(() => {
      expect(screen.getByText('Energy Meters 26')).toBeInTheDocument();
    });
    await ensureColumnsVisible(['Drawing Link']);

    const url = screen.queryAllByText('http://example-drawing-link.com');
    expect(url[0]).toHaveAttribute('href', 'http://example-drawing-link.com');
  });

  it('opens obsolete dialog and can close it again', async () => {
    createView();

    await waitFor(() => {
      expect(screen.getByText('Energy Meters 26')).toBeInTheDocument();
    });
    const rowActionsButton = screen.getAllByLabelText('Row Actions');
    await user.click(rowActionsButton[0]);

    await waitFor(() => {
      expect(screen.getByText('Obsolete')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Obsolete'));

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('opens move to dialog and can close it again', async () => {
    createView();

    await waitFor(() => {
      expect(screen.getByText('Energy Meters 26')).toBeInTheDocument();
    });
    const rowToggleSelect = screen.getAllByLabelText('Toggle select row');
    await user.click(rowToggleSelect[1]);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Move to' })
      ).toBeInTheDocument();
    });
    const moveToButton = screen.getByRole('button', { name: 'Move to' });

    await user.click(moveToButton);
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('opens copy to dialog and can close it again', async () => {
    createView();

    await waitFor(() => {
      expect(screen.getByText('Energy Meters 26')).toBeInTheDocument();
    });
    const rowToggleSelect = screen.getAllByLabelText('Toggle select row');
    await user.click(rowToggleSelect[1]);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Copy to' })
      ).toBeInTheDocument();
    });
    const copyToButton = screen.getByRole('button', { name: 'Copy to' });

    await user.click(copyToButton);
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('navigates to the manufacturer url', async () => {
    createView();
    await waitFor(() => {
      expect(screen.getByText('Energy Meters 26')).toBeInTheDocument();
    });

    await ensureColumnsVisible(['Manufacturer URL']);

    const url = screen.getAllByText('http://example.com');
    expect(url[0]).toHaveAttribute('href', 'http://example.com');
  });

  it('navigates to manufacturer landing page', async () => {
    createView();
    await waitFor(() => {
      expect(screen.getByText('Energy Meters 26')).toBeInTheDocument();
    });

    await ensureColumnsVisible(['Manufacturer Name']);

    const url = screen.getAllByText('Manufacturer A');
    expect(url[0]).toHaveAttribute('href', '/manufacturers/1');
  });

  it('renders the dense table correctly', async () => {
    props.dense = true;
    window.Element.prototype.getBoundingClientRect = vi
      .fn()
      .mockReturnValue({ height: 100, width: 1135 });
    const view = createView();

    await waitFor(() => {
      expect(screen.getByText('Energy Meters 26')).toBeInTheDocument();
    });

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('sets the table filters and clears the table filters', async () => {
    createView();

    await waitFor(() => {
      expect(screen.getByText('Energy Meters 26')).toBeInTheDocument();
    });
    const clearFiltersButton = screen.getByRole('button', {
      name: 'Clear Filters',
    });
    expect(clearFiltersButton).toBeDisabled();

    const nameInput = screen.getByLabelText('Filter by Name');

    await user.type(nameInput, '29');

    await waitFor(() => {
      expect(screen.queryByText('Energy Meters 26')).not.toBeInTheDocument();
    });

    await user.click(clearFiltersButton);

    await waitFor(() => {
      expect(screen.getByText('Energy Meters 26')).toBeInTheDocument();
    });
  });

  // skipping this test as it causes an infinite loop when expanding the details panel
  // loop doesn't occur when tested on the browser - I think it's an issue with MRT interacting
  // with an MUI tabs component
  it.skip('renders the dense table correctly and can expand and collapse', async () => {
    props.dense = true;
    window.Element.prototype.getBoundingClientRect = vi
      .fn()
      .mockReturnValue({ height: 100, width: 1135 });
    createView();

    await waitFor(() => {
      expect(screen.getAllByLabelText('Expand')[0]).toBeInTheDocument();
    });
    const rowExpandButton = screen.getAllByRole('button', { name: 'Expand' });

    await user.click(rowExpandButton[0]);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Details')).toBeInTheDocument();
    });
  });
});
