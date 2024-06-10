import { fireEvent, screen, waitFor, within } from '@testing-library/react';
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
      'any',
      '/'
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

    expect(
      await screen.findByRole('button', { name: 'Move to' })
    ).toBeInTheDocument();
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

    expect(
      await screen.findByRole('button', { name: 'Copy to' })
    ).toBeInTheDocument();
    const copyToButton = screen.getByRole('button', { name: 'Copy to' });

    await user.click(copyToButton);
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('does not display move or copy buttons for move to requestOrigin', async () => {
    props.requestOrigin = 'move to';

    createView();

    await waitFor(() => {
      expect(screen.getByText('Energy Meters 26')).toBeInTheDocument();
    });
    const rowToggleSelect = screen.getAllByLabelText('Toggle select row');
    await user.click(rowToggleSelect[1]);

    expect(
      screen.queryByRole('button', { name: 'Move to' })
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole('button', { name: 'Copy to' })
    ).not.toBeInTheDocument();
  });

  it('does not display move or copy buttons for obsolete requestOrigin', async () => {
    props.requestOrigin = 'obsolete';

    createView();

    await waitFor(() => {
      expect(screen.getByText('Energy Meters 26')).toBeInTheDocument();
    });
    const rowToggleSelect = screen.getAllByLabelText('Toggle select row');
    await user.click(rowToggleSelect[1]);

    expect(
      screen.queryByRole('button', { name: 'Move to' })
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole('button', { name: 'Copy to' })
    ).not.toBeInTheDocument();
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

    // Ensure no loading bars visible
    await waitFor(() =>
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    );

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('can change the table filters and clear the table filters', async () => {
    const { router } = createView();

    await waitFor(() => {
      expect(screen.getByText('Energy Meters 26')).toBeInTheDocument();
    });
    const clearFiltersButton = screen.getByRole('button', {
      name: 'Clear Filters',
    });
    expect(clearFiltersButton).toBeDisabled();
    expect(router.state.location.search).toBe('');

    const nameInput = screen.getByLabelText('Filter by Name');

    await user.type(nameInput, '29');

    await waitFor(() => {
      expect(screen.queryByText('Energy Meters 26')).not.toBeInTheDocument();
    });
    expect(router.state.location.search).toBe(
      '?state=N4IgxgYiBcDaoEsAmNwEMAuaA2B7A5gK4CmAkhsQLYB0AdmpcSADQgBuOJqATAJwgBfALoCgA'
    );

    await user.click(clearFiltersButton);

    await waitFor(() => {
      expect(screen.getByText('Energy Meters 26')).toBeInTheDocument();
    });
    expect(router.state.location.search).toBe('');
  });

  it('can sort the table columns', async () => {
    const { router } = createView();

    await waitFor(() => {
      expect(screen.getByText('Energy Meters 26')).toBeInTheDocument();
    });
    expect(router.state.location.search).toBe('');

    const lastModifiedSortButton = await screen.findByRole('button', {
      name: 'Sort by Last modified descending',
    });
    await user.click(lastModifiedSortButton);

    expect(router.state.location.search).toBe(
      '?state=N4IgzgTgLiBcDaoCWATOIDGBDKWA2A9gOYCuApgJJRkC2AdDQSkgGZJkoD6USNZIAGhAoyYDHCgRyAXwC60oA'
    );

    // Reset
    await user.click(lastModifiedSortButton);
    await user.click(lastModifiedSortButton);

    expect(router.state.location.search).toBe('');
  });

  it('can show and hide columns', async () => {
    const { router } = createView();

    await waitFor(() => {
      expect(screen.getByText('Energy Meters 26')).toBeInTheDocument();
    });
    expect(router.state.location.search).toBe('');

    await user.click(screen.getByRole('button', { name: 'Show/Hide columns' }));
    const nameColumnVisibilityToggle = within(
      screen.getByRole('menuitem', { name: 'Toggle visibility Name' })
    ).getByRole('checkbox');
    await user.click(nameColumnVisibilityToggle);

    await waitFor(() => {
      expect(screen.queryByText('Energy Meters 26')).not.toBeInTheDocument();
    });
    expect(router.state.location.search).toBe(
      '?state=N4IgxgaglgziBcowEMAuyA2B7A5gVwFMBJVAgWwDowAnAtAgEwH1UoyCEAzTGAgGnBpMuQiXIUAdsnZceBAL7ygA'
    );

    // Reset
    await user.click(nameColumnVisibilityToggle);
    await waitFor(() => {
      expect(screen.getByText('Energy Meters 26')).toBeInTheDocument();
    });
    expect(router.state.location.search).toBe('');
  });

  it('can use the global filter', async () => {
    const { router } = createView();

    await waitFor(() => {
      expect(screen.getByText('Energy Meters 26')).toBeInTheDocument();
    });
    expect(router.state.location.search).toBe('');

    const globalFilter = screen.getByRole('textbox', { name: '' });
    await user.type(globalFilter, '29');

    await waitFor(() => {
      expect(screen.queryByText('Energy Meters 26')).not.toBeInTheDocument();
    });
    expect(router.state.location.search).toBe(
      '?state=N4Ig5gYglgNiBcIBMBOEBfIA'
    );

    // Reset
    await user.click(screen.getByRole('button', { name: 'Clear search' }));
    await waitFor(() => {
      expect(screen.getByText('Energy Meters 26')).toBeInTheDocument();
    });
    expect(router.state.location.search).toBe('');
  });

  it('can change the grouping state', async () => {
    const { router } = createView();

    await waitFor(() => {
      expect(screen.getByText('Energy Meters 26')).toBeInTheDocument();
    });
    expect(screen.queryByText('Grouped by')).not.toBeInTheDocument();
    expect(router.state.location.search).toBe('');

    const nameColumnActions = screen.getAllByRole('button', {
      name: 'Column Actions',
    })[0];
    await user.click(nameColumnActions);
    await user.click(screen.getByRole('menuitem', { name: 'Group by Name' }));

    await waitFor(() => {
      expect(screen.getByText('Grouped by')).toBeInTheDocument();
    });
    expect(router.state.location.search).toBe(
      '?state=N4Ig5iBcDaIMYEMAuCA2B7MBXApgSSRwFsA6AOwSJxAF0AaeAeSliICckBaN9Ad05wAPAA4IyAExAN2XHvwRwkAS3RkAzlJAzufTmpyocizYhQZs%2BQqQpUTyNJlwFiJIunFKAZkpziA%2Bsq2DKYOFs6kcGw4yL4BSkEgAGo%2BvAAE4RrB9uZOViTiOGqRSsLKqnZmjpYuSmp%2B6ABGauiGhBWhuS6Nza04flHCqArEOGRIfiE5fUpWfkqSWZVhed0tOIT90c1kmnIkk1XhJMI8wjgcPmokAOy7fPvZh3kn6GcXhSQAHO1TR3DoanGYAawh%2BTxc-0BAXQm146DYAGs-MDQYsOtVSOIEABPOpIGEDIZwaho355LG46Gw%2BEIzQAETYCF4SjIYFSADksEQGucwcsXOJGczWX5UCzaaTwaQZsQ-G4Cqg-GQuTy2JoiGIsJ4FEgsFE2ORKCStJrtYo9ecSHrUOrTTqLQaEOJBYVMiblWbdfqSIRDMIABaqY0HfnWdCEN3aOR6UTEtU0AC%2BQA'
    );

    // Reset
    await user.click(nameColumnActions);
    await user.click(screen.getByRole('menuitem', { name: 'Ungroup by Name' }));
    await waitFor(() => {
      expect(screen.queryByText('Grouped by')).not.toBeInTheDocument();
    });
    // Expect this to still be here as have now modified the order in some way (as MRT doesn't revert back to its original state in this case)
    expect(router.state.location.search).toBe(
      '?state=N4Igxg8iBcDaIFsBOAXAtEg9gdzQUwA8AHAQwDsATEAGkVQx32PKtuXS1xLBQEtMyAZxp0OjQXgA2eHiLAkUJSZgDmAVzwBJFHgQA6MiQR45Cpao3bdehJgq8AZrzwUA%2Bn2OnFy9Vp36wJDwFF3deT1oANWdsAAIrBGFaeW8LP2sKPEFA3iI%2BAS9zXwS9XkFXTAAjQUxpHUKfS389Kpq6vFcgokluXTwyFFcUoo1XXn8x1nAzRvT9Vtq8HU7gmrIRTj1h2ZKiLCI8VGdBPQB2DZwtmbTd-cO%2BLL0ADgab5rBMQUGVSqJX4ven0GKEwK2wmCQAGtXD8-slrgCMiQAJ7lEErbq9f5NJGo9ygoLgqEiAAiSBI2F4ZBUsQAcmoEJVDti5noKOTKdTXJIqZCWSVxrpXLZMpJXGQGUykCIEOQ1A5uCg1EEkAYjCY2HKFTxlYc9MrJDKtYrdaqSBR2VkkohjTqVXodNIiAALAQa6apRH6MiYHTW9gMXCCUhgZkAXQAvkA'
    );
  });

  it('can change the pagination options', async () => {
    const { router } = createView();

    await waitFor(() => {
      expect(screen.getByText('Energy Meters 26')).toBeInTheDocument();
    });

    expect(router.state.location.search).toBe('');

    const rowsPerPageSelect = await screen.findByRole('combobox', {
      name: 'Rows per page',
    });
    expect(within(rowsPerPageSelect).getByText('15')).toBeInTheDocument();

    // Change to another value
    fireEvent.mouseDown(rowsPerPageSelect);
    fireEvent.click(within(await screen.findByRole('listbox')).getByText('30'));
    expect(within(rowsPerPageSelect).getByText('30')).toBeInTheDocument();

    expect(router.state.location.search).toBe(
      '?state=N4IgDiBcpghg5gUwMoEsBeioGYAMAacBRASQDsATRADylwF96g'
    );

    // And back again
    fireEvent.mouseDown(rowsPerPageSelect);
    fireEvent.click(within(await screen.findByRole('listbox')).getByText('15'));
    expect(within(rowsPerPageSelect).getByText('15')).toBeInTheDocument();

    expect(router.state.location.search).toBe('');
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
