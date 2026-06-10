import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { CatalogueCategory } from '../../api/api.types';
import APIConfigProvider from '../../apiConfigProvider.component';
import { server } from '../../mocks/server';
import { RootState } from '../../state/store';
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

  const createView = (
    initialEntry?: string,
    preloadedState?: Partial<RootState>
  ) => {
    return renderComponentWithRouterProvider(
      <APIConfigProvider>
        <CatalogueItemsTable {...props} />
      </APIConfigProvider>,
      'any',
      initialEntry ?? '/',
      preloadedState
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
      parentInfo: getCatalogueCategoryById('5') as CatalogueCategory,
      dense: false,
    };
    user = userEvent.setup();

    window.Element.prototype.getBoundingClientRect = vi
      .fn()
      .mockReturnValue({ height: 100, width: 200 });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders table correctly (section 1 due to column virtualisation) and checks for number of spares column', async () => {
    createView();
    await waitFor(() => {
      expect(screen.getByText('Name')).toBeInTheDocument();
    });
    expect(screen.getByText('Last modified')).toBeInTheDocument();
    expect(screen.getByText('Number of spares')).toBeInTheDocument();
  });

  it('renders table correctly (Criticality)', async () => {
    props.parentInfo = getCatalogueCategoryById('6') as CatalogueCategory;
    createView(undefined, {
      criticality: { isCriticalMode: true },
    });
    await waitFor(() => {
      expect(screen.getByText('Name')).toBeInTheDocument();
    });

    expect(screen.getByText('Criticality')).toBeInTheDocument();

    expect(await screen.findByText('-4.6')).toBeInTheDocument();

    expect(screen.getByTestId('ErrorIcon')).toBeInTheDocument();

    await user.hover(screen.getByTestId('ErrorIcon'));

    expect(
      await screen.findByText('This catalogue item is critical.')
    ).toBeInTheDocument();
  });

  it('renders table correctly (Cameras more details)', async () => {
    props.parentInfo = getCatalogueCategoryById('4') as CatalogueCategory;
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
    props.parentInfo = getCatalogueCategoryById('4') as CatalogueCategory;
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

    await ensureColumnsVisible(['Time to replace (days)', 'Days to Rework']);
  });

  it('renders table correctly for properties with type boolean', async () => {
    props.parentInfo = getCatalogueCategoryById('4') as CatalogueCategory;
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

    await ensureColumnsVisible(['Item Model Number', 'Created']);
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

  it('opens and closes the catalogue item dialog for duplicate', async () => {
    createView();

    await waitFor(() => {
      expect(screen.getByText('Energy Meters 26')).toBeInTheDocument();
    });
    const rowActionsButton = screen.getAllByLabelText('Row Actions');
    await user.click(rowActionsButton[0]);

    await waitFor(() => {
      expect(screen.getByText('Duplicate')).toBeInTheDocument();
    });

    const duplicateButton = screen.getByText('Duplicate');
    await user.click(duplicateButton);
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('opens the add catalogue item dialog for duplicate (more catalogue item details filled in)', async () => {
    createView();

    await waitFor(() => {
      expect(screen.getByText('Energy Meters 27')).toBeInTheDocument();
    });
    const rowActionsButton = screen.getAllByLabelText('Row Actions');
    await user.click(rowActionsButton[1]);

    await waitFor(() => {
      expect(screen.getByText('Duplicate')).toBeInTheDocument();
    });

    const duplicateButton = screen.getByText('Duplicate');
    await user.click(duplicateButton);
  });

  it('navigates to replacement obsolete item', async () => {
    createView();
    await waitFor(() => {
      expect(screen.getByText('Energy Meters 26')).toBeInTheDocument();
    });
    await ensureColumnsVisible(['Obsolete replacement link']);

    const url = screen.queryAllByText('Click here');
    expect(url[0]).toHaveAttribute('href', '/catalogue/5/items/6');
  });

  it('navigates to items pages with the spares definition applied', async () => {
    createView();
    await waitFor(() => {
      expect(screen.getByText('Energy Meters 26')).toBeInTheDocument();
    });
    await ensureColumnsVisible(['Number of spares']);

    const url = await screen.findAllByText('0');

    expect(url[1]).toHaveAttribute(
      'href',
      '/89/items?state=N4IgxgYiBcDaoEsAmMQGcCeaAuBTAtgHTYYAOuhAbgIYA2ArriADQg0NNygnmo4BOCAHYBzFmzqNUAZWwB7ftRFMAvgF11KoA'
    );
  });

  it('navigates to catalogue item landing page', async () => {
    createView();
    await waitFor(() => {
      expect(screen.getByText('Energy Meters 26')).toBeInTheDocument();
    });
    await ensureColumnsVisible(['Name']);

    const url = screen.getByText('Energy Meters 26');
    expect(url).toHaveAttribute('href', '/89');
  });

  it('navigates to items table', async () => {
    createView();
    await waitFor(() => {
      expect(screen.getByText('Energy Meters 26')).toBeInTheDocument();
    });
    await ensureColumnsVisible(['View Items']);

    const url = screen.queryAllByText('Click here');
    expect(url[0]).toHaveAttribute('href', '/89/items');
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
      '?state=N4IgxgYiBcDaoEsAmNwEMAuaA2B7A5gK4CmAkhsQLYB0AdmpcSADQgBuOJMoGAngA5NoIAM4YATglr4W7TkJAAmAJwgAvmoC6aoA'
    );

    await user.click(clearFiltersButton);

    await waitFor(() => {
      expect(screen.getByText('Energy Meters 26')).toBeInTheDocument();
    });
    expect(router.state.location.search).toBe('');
  });

  it('can change the table filters and clear the table filters (min and max values)', async () => {
    // This tests the case where min/max column filters are used as there was a bug where
    // they wouldn't correctly reset when the clear filters button was clicked

    // Start in a state with just the name and cost columns (ensureColumnsVisible seems to effect the document in a way
    // that prevents anything outside of the show/hide menu from being found even when using escape/clicking on the document
    // body first)
    const { router } = createView(
      '?state=N4IgxgaglgziBcowEMAuyA2B7A5gVwFMBJVAgWwDowAnAtAgEwH1UoyCEAzTGAgGnBpMuQiXIVYTThmQ4cjLj36D02fMVKUaUVigw6Anooy8BKVSI3iAdnjIAjAtSZZOTGAAdktGE1oBHPChaBmNTFWF1MUpbBycXN09vAjh4bhNlc0jRTQoyLAYoTihGFjYONKUzITUc8XzC4tL7I0qMgWgCAHcAAmjU9PCs2qtKD2osDydWFIoADjDMmstoinHJ6ZKYCgB2ReqLKNysexgsDAJSPzoz632IkdWGFO0PViw7tqHlo-FJE7OF1I92GK2Op3OlwI1w8MjA5AI1lQTFB6iYOnI6NCXyWhzqlAYyAMvlQWBhcIqg1x2VGFEJxJYZNoXSw1AA1iCfviKAQAB5TMCkZj6TiXcpMekDKoPMF-TRMBoEDBMWKOaj3MjIWzcQV4WjUCjWZDsDVavA61B6pwUPUYU3a5C6-UUZAMBg%2BKXtECah1O62kC4eAAWH0p0tR3OsWFInt4AF840A'
    );

    await waitFor(() => {
      expect(screen.getByText('Energy Meters 26')).toBeInTheDocument();
    });

    const clearFiltersButton = screen.getByRole('button', {
      name: 'Clear Filters',
    });
    expect(clearFiltersButton).toBeDisabled();
    expect(router.state.location.search).toBe(
      '?state=N4IgxgaglgziBcowEMAuyA2B7A5gVwFMBJVAgWwDowAnAtAgEwH1UoyCEAzTGAgGnBpMuQiXIVYTThmQ4cjLj36D02fMVKUaUVigw6Anooy8BKVSI3iAdnjIAjAtSZZOTGAAdktGE1oBHPChaBmNTFWF1MUpbBycXN09vAjh4bhNlc0jRTQoyLAYoTihGFjYONKUzITUc8XzC4tL7I0qMgWgCAHcAAmjU9PCs2qtKD2osDydWFIoADjDMmstoinHJ6ZKYCgB2ReqLKNysexgsDAJSPzoz632IkdWGFO0PViw7tqHlo-FJE7OF1I92GK2Op3OlwI1w8MjA5AI1lQTFB6iYOnI6NCXyWhzqlAYyAMvlQWBhcIqg1x2VGFEJxJYZNoXSw1AA1iCfviKAQAB5TMCkZj6TiXcpMekDKoPMF-TRMBoEDBMWKOaj3MjIWzcQV4WjUCjWZDsDVavA61B6pwUPUYU3a5C6-UUZAMBg%2BKXtECah1O62kC4eAAWH0p0tR3OsWFInt4AF840A'
    );

    // Do max first, as it technically has no effect on the outcome of the filter
    const maxInput = screen.getAllByLabelText('Max')[1];
    await user.type(maxInput, '1000');

    const minInput = screen.getAllByLabelText('Min')[1];
    await user.type(minInput, '800');

    await waitFor(() => {
      expect(screen.queryByText('Energy Meters 26')).not.toBeInTheDocument();
    });
    expect(router.state.location.search).toBe(
      '?state=N4IgxgaglgziBcowEMAuyA2B7A5gVwFMBJVAgWwDowAnAtAgEwH1UoyCEAzTGAgGnBpMuQiXIVYTThmQ4cjLj36D02fMVKUaUVigw6Anooy8BKVSI3iAdnjIAjAtSZZOTGAAdktGE1oBHPChaBmNTFWF1MUpbBycXN09vAjh4bhNlc0jRTQoyLAYoTihGFjYONKUzITUc8XzC4tL7I0qMgWgCAHcAAmjU9PCs2qtKD2osDydWFIoADjDMmstoinHJ6ZKYCgB2ReqLKNysexgsDAJSPzoz632IkdWGFO0PViw7tqHlo-FJE7OF1I92GK2Op3OlwI1w8MjA5AI1lQTFB6iYOnI6NCXyWhzqlAYyAMvlQWBhcIqg1x2VGFEJxJYZNoXSw1AA1iCfviKAQAB5TMCkZj6TiXcpMekDKoPMF-TRMBoEDBMWKOaj3MjIWzcQV4WjUCjWZDsDVavA61B6pwUPUYU3a5C6-UUZAMBg%2BKXtECah1O62kC4eAAWH0p0tR3OsWFInt4AF8zAAxBAAbVAUGxMt%2BWiwMGRpOuLPZTBw9g8IAEADdMIRU6BUAYpggQHnqFBrDgKyBqxha-AQHMAAyDkAJ%2BuNiot1Btjtdnt9kAARmHI7jAF113GgA'
    );

    await user.click(clearFiltersButton);

    await waitFor(() => {
      expect(screen.getByText('Energy Meters 26')).toBeInTheDocument();
    });
    expect(router.state.location.search).toBe(
      '?state=N4IgxgaglgziBcowEMAuyA2B7A5gVwFMBJVAgWwDowAnAtAgEwH1UoyCEAzTGAgGnBpMuQiXIVYTThmQ4cjLj36D02fMVKUaUVigw6Anooy8BKVSI3iAdnjIAjAtSZZOTGAAdktGE1oBHPChaBmNTFWF1MUpbBycXN09vAjh4bhNlc0jRTQoyLAYoTihGFjYONKUzITUc8XzC4tL7I0qMgWgCAHcAAmjU9PCs2qtKD2osDydWFIoADjDMmstoinHJ6ZKYCgB2ReqLKNysexgsDAJSPzoz632IkdWGFO0PViw7tqHlo-FJE7OF1I92GK2Op3OlwI1w8MjA5AI1lQTFB6iYOnI6NCXyWhzqlAYyAMvlQWBhcIqg1x2VGFEJxJYZNoXSw1AA1iCfviKAQAB5TMCkZj6TiXcpMekDKoPMF-TRMBoEDBMWKOaj3MjIWzcQV4WjUCjWZDsDVavA61B6pwUPUYU3a5C6-UUZAMBg%2BKXtECah1O62kC4eAAWH0p0tR3OsWFInt4AF840A'
    );
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
      '?state=N4IgxgaglgziBcowEMAuyA2B7A5gVwFMBJVAgWwDowAnAtAgEwH1UoyCEAzTGAgGnBpMuQiXIVYTThmQ4cjLj36D02fMVKUaUVigw6Anooy8BKVSI3iAdnjIAjAtSZZOTGAAdktGE1oBHPChaBmNTFWF1MUprZHYwggBfRKA'
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

    const globalFilter = screen.getAllByRole('textbox', { name: '' })[0];
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
      '?state=N4Ig5iBcDaIMYEMAuCA2B7MBXApgSSRwFsA6AOwSJxAF0AaeAeSliICckBaN9Ad05wAPAA4IyAExAN2XHvwRwkAS3RkAzlJAzufTmpyocizYhQZs%2BQqSVqA%2BgDNUCMGBySGptJlwFi5StQeyF4WvqRwbErKiKhRAJ4mweY%2BVuRYRABGOGy26Pa2aqJsOBpBZt6WfmTpWTl5BUUltsUAjlhKxe7wSRVhJETo4kr2Sm62ylSJ5aGpA0MjYxkJZSEpfhE4yGMTgSAAaqO8AARhpd3Ta6TiJRFKwsqqU6uV1nboGWrohoRPyS8k70%2B3xwzRwwiccGIODISFsnj%2BtiixERXXhvVSgK%2BOEIoIQnzIv3RfmEPGE2WUJRIAHZCTNiaTyaM1CQABy0y4kODoNSwsAZYTs-5cnnjdCg3joNgAa1sfIFKz%2BfXECDidiQYuK4IUuzRdKuKrVGpwEulgr6QjJijGsXs2KUVFsytVZtSSKItjmBls1Uy2U0RDEWHsCiQWGKbH8k2kgeDijD2RIYdQ-pjIfjEYQ4nExTUZwD1VjofDJEIhmEAAtVDqenryOhCHmODp%2BIVtWxaABfIA'
    );

    // Reset
    await user.click(nameColumnActions);
    await user.click(screen.getByRole('menuitem', { name: 'Ungroup by Name' }));
    await waitFor(() => {
      expect(screen.queryByText('Grouped by')).not.toBeInTheDocument();
    });
    // Expect this to still be here as have now modified the order in some way (as MRT doesn't revert back to its original state in this case)
    expect(router.state.location.search).toBe(
      '?state=N4Igxg8iBcDaIFsBOAXAtEg9gdzQQzBQEtMA7AZxABpFUMc1yBTAGycOtvS1yYA8ADnlIATTmDwo8LTAHMArkwCSKJggB0RcgH0AZizyzZTMTQlSZC5ao2k8CJuMnS5ilWvVgkRYhJY%2BATycLV2sPUnkEACMmJG1MXW1yISQmSjNnSzcbdQjo2PjE5LxUnVSAR3kiVNNwTND3DQRMESJdIhNtYgdglytG9WbW9s6ooIyQ-pyvJklO7scaADUO7AACRvS6yeyPETSvIgFiMl6ssI0teKjyTDZVM4aczBu7plVtVIEDMDUmUhQ2nMfUU2h8ajBtWB5wGL1u9yYn1mt1IjymHgEWAEsWIaXUAHY0bsNJjMNjUB1yOoABxEi6eTDkQGyKICOkDMCMwEoTBI7CYJAAa20LLZExB9JEeACOh5SO%2BBEW2wlAylMq6vNS-KF7Jy-GxhE6-l07yIDm0aq20KeHnBCG0Q1Y2jyMSQnAQwnkugIKHkqSQuXsSo9EW9hD9sXUfpY7s9Yd9-vUeBEIlKWxDXp9EYDqjYAgAFmQldb0bZMKp03QeIwhL83QBdAC%2BQA'
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
    expect(within(rowsPerPageSelect).getByText('30')).toBeInTheDocument();

    // Change to another value
    fireEvent.mouseDown(rowsPerPageSelect);
    fireEvent.click(within(await screen.findByRole('listbox')).getByText('45'));
    expect(within(rowsPerPageSelect).getByText('45')).toBeInTheDocument();

    expect(router.state.location.search).toBe(
      '?state=N4IgDiBcpghg5gUwMoEsBeioBYCsAacBRASQDsATRADygAYBfBoA'
    );

    // And back again
    fireEvent.mouseDown(rowsPerPageSelect);
    fireEvent.click(within(await screen.findByRole('listbox')).getByText('30'));
    expect(within(rowsPerPageSelect).getByText('30')).toBeInTheDocument();

    expect(router.state.location.search).toBe('');
  });

  it('displays accuracy grouped cell', async () => {
    createView();

    await waitFor(() => {
      expect(screen.getByText('Energy Meters 26')).toBeInTheDocument();
    });

    expect(await screen.findByText('Name')).toBeInTheDocument();

    const accuracy = '±0.05%';

    // Get the table element (assuming it has a specific class or role)
    const table = screen.getByTestId('catalogue-items-table-container');

    fireEvent.scroll(table, { target: { scrollLeft: 1500 } });

    // Check if the accuracy cell is visible after scrolling
    expect(await screen.findByText(accuracy)).toBeInTheDocument();

    //  accuracy column action button
    await user.click(
      screen.getAllByRole('button', { name: 'Column Actions' })[9]
    );

    await user.click(await screen.findByText('Group by Accuracy'));

    expect(
      screen.queryByRole('tooltip', { name: 'Accuracy' })
    ).not.toBeInTheDocument();

    fireEvent.scroll(table, { target: { scrollLeft: -1500 } });

    expect(
      await screen.findByRole('tooltip', { name: 'Accuracy' })
    ).toBeInTheDocument();

    // Check if the accuracy grouped cell is visible after scrolling
    expect(
      await screen.findByRole('tooltip', {
        name: '±0.05% (1)',
      })
    ).toBeInTheDocument();
  });

  it('displays manufacturer url grouped cell', async () => {
    createView();

    await waitFor(() => {
      expect(screen.getByText('Energy Meters 26')).toBeInTheDocument();
    });

    expect(await screen.findByText('Name')).toBeInTheDocument();

    const manufacturerUrl = 'http://example.com';

    // Get the table element (assuming it has a specific class or role)
    const table = screen.getByTestId('catalogue-items-table-container');

    fireEvent.scroll(table, { target: { scrollLeft: 3650 } });

    // Check if the manufacturer url cell is visible after scrolling
    expect(await screen.findByText(manufacturerUrl)).toBeInTheDocument();

    // manufacturer url column action button
    await user.click(
      screen.getAllByRole('button', { name: 'Column Actions' })[6]
    );

    await user.click(await screen.findByText('Group by Manufacturer URL'));

    expect(
      screen.queryByRole('tooltip', { name: 'Manufacturer URL' })
    ).not.toBeInTheDocument();

    fireEvent.scroll(table, { target: { scrollLeft: -3350 } });

    expect(
      await screen.findByRole('tooltip', { name: 'Manufacturer URL' })
    ).toBeInTheDocument();

    // Check if the manufacturer url grouped cell is visible after scrolling
    expect(
      await screen.findByRole('tooltip', {
        name: 'http://example.com (1)',
      })
    ).toBeInTheDocument();
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

  it('renders table correctly (section 1 due to column virtualisation) without spares', async () => {
    server.use(
      http.get('/v1/settings/spares-definition', () => {
        return HttpResponse.json(undefined, { status: 204 });
      })
    );

    createView();
    await waitFor(() => {
      expect(screen.getByText('Name')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Show/Hide columns' }));
    await user.click(screen.getByText('Hide all'));

    await waitFor(() => {
      expect(screen.queryByText('Number of spares')).not.toBeInTheDocument();
    });
  });
});
