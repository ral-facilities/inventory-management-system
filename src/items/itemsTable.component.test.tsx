import { screen, waitFor } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import {
  getCatalogueCategoryById,
  getCatalogueItemById,
  renderComponentWithRouterProvider,
} from '../testUtils';
import ItemsTable, { ItemTableProps } from './itemsTable.component';

describe('Items Table', () => {
  vi.setConfig({ testTimeout: 10000 });

  let props: ItemTableProps;
  let user: UserEvent;
  const createView = () => {
    return renderComponentWithRouterProvider(
      <ItemsTable {...props} />,
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
      catalogueCategory: getCatalogueCategoryById('4'),
      catalogueItem: getCatalogueItemById('1'),
      dense: false,
    };
    window.ResizeObserver = vi.fn().mockImplementation(() => ({
      disconnect: vi.fn(),
      observe: vi.fn(),
      unobserve: vi.fn(),
    }));
    window.Element.prototype.getBoundingClientRect = vi
      .fn()
      .mockReturnValue({ height: 100, width: 200 });

    user = userEvent.setup();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly part 1 due column virtualisation', async () => {
    const view = createView();

    await waitFor(
      () => {
        expect(screen.getByText('5YUQDDjKpz2z')).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
    // Wait for all progress bars to disappear
    await waitFor(() =>
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    );

    expect(view.asFragment()).toMatchSnapshot();
  });

  it('renders correctly part 2 due column virtualisation', async () => {
    const view = createView();
    await ensureColumnsVisible([
      'Notes',
      'Frame Rate (fps)',
      'Sensor Type',
      'Broken',
    ]);
    expect(view.asFragment()).toMatchSnapshot();
  });

  it('renders correctly part 3 due column virtualisation and checks that the href is correct for the system ID', async () => {
    createView();
    await ensureColumnsVisible(['Warranty End Date', 'System', 'Created']);

    const systemID = screen.getAllByText('Giant laser');
    expect(systemID[0]).toHaveAttribute(
      'href',
      '/systems/65328f34a40ff5301575a4e3'
    );
  });

  it('opens and closes the add item dialog', async () => {
    createView();

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Add Item' })
      ).toBeInTheDocument();
    });

    const addButton = screen.getByRole('button', {
      name: 'Add Item',
    });
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('sets the table filters and clears the table filters', async () => {
    createView();

    await waitFor(() => {
      expect(screen.getByText('Serial Number')).toBeInTheDocument();
    });
    const clearFiltersButton = screen.getByRole('button', {
      name: 'Clear Filters',
    });
    expect(clearFiltersButton).toBeDisabled();

    const nameInput = screen.getByLabelText('Filter by Serial Number');

    await user.type(nameInput, '5y');

    await waitFor(() => {
      expect(screen.queryByText('vYs9Vxx6yWbn')).not.toBeInTheDocument();
    });

    await user.click(clearFiltersButton);

    await waitFor(() => {
      expect(screen.getByText('vYs9Vxx6yWbn')).toBeInTheDocument();
    });
  });

  it('navigates to catalogue item landing page', async () => {
    createView();
    const serialNumber = '5YUQDDjKpz2z';
    await waitFor(() => {
      expect(screen.getByText(serialNumber)).toBeInTheDocument();
    });
    await ensureColumnsVisible(['Serial Number']);

    const serialNum = screen.getByText('5YUQDDjKpz2z');
    expect(serialNum).toHaveAttribute('href', '/KvT2Ox7n');
  });

  it('opens the delete catalogue item dialog and can delete an item', async () => {
    createView();

    const serialNumber = '5YUQDDjKpz2z';
    await waitFor(() => {
      expect(screen.getByText(serialNumber)).toBeInTheDocument();
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

  it('can open the edit dialog and close it again', async () => {
    createView();

    const serialNumber = '5YUQDDjKpz2z';
    await waitFor(() => {
      expect(screen.getByText(serialNumber)).toBeInTheDocument();
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

  it('can open the save as dialog and close it again', async () => {
    createView();

    const serialNumber = '5YUQDDjKpz2z';
    await waitFor(() => {
      expect(screen.getByText(serialNumber)).toBeInTheDocument();
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

  it('can open the save as dialog and checks that the notes have been updated', async () => {
    createView();

    const serialNumber = '5YUQDDjKpz2z';
    await waitFor(() => {
      expect(screen.getByText(serialNumber)).toBeInTheDocument();
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

    expect(screen.getByLabelText('Notes')).toHaveValue(
      '6Y5XTJfBrNNx8oltI9HE\n\nThis is a copy of the item with this Serial Number: 5YUQDDjKpz2z'
    );
  });

  it('can open the save as dialog and checks that the notes have been updated when notes is null', async () => {
    props.catalogueCategory = getCatalogueCategoryById('4');
    props.catalogueItem = getCatalogueItemById('32');
    createView();

    const serialNumber = 'RncNJlDk1pXC';
    await waitFor(() => {
      expect(screen.getByText(serialNumber)).toBeInTheDocument();
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

    expect(screen.getByLabelText('Notes')).toHaveValue(
      '\n\nThis is a copy of the item with this Serial Number: RncNJlDk1pXC'
    );
  });

  it('can open the save as dialog and checks that the notes have been updated with no serial number', async () => {
    props.catalogueCategory = getCatalogueCategoryById('4');
    props.catalogueItem = getCatalogueItemById('32');
    createView();

    const serialNumber = 'No serial number';
    await waitFor(() => {
      expect(screen.getByText(serialNumber)).toBeInTheDocument();
    });
    const rowActionsButton = screen.getAllByLabelText('Row Actions');
    await user.click(rowActionsButton[3]);

    await waitFor(() => {
      expect(screen.getByText('Save as')).toBeInTheDocument();
    });

    const saveAsButton = screen.getByText('Save as');
    await user.click(saveAsButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    expect(screen.getByLabelText('Notes')).toHaveValue(
      'MJuSPgXEiXmBbf1Vlq4B\n\nThis is a copy of the item with this Serial Number: No serial number'
    );
  });

  it('can open the save as dialog (no delivered date or warranty date) and close it again', async () => {
    props.catalogueCategory = getCatalogueCategoryById('4');
    props.catalogueItem = getCatalogueItemById('3');
    createView();

    const serialNumber = 'fBfU9b3ySyKc';
    await waitFor(() => {
      expect(screen.getByText(serialNumber)).toBeInTheDocument();
    });
    const rowActionsButton = screen.getAllByLabelText('Row Actions');
    await user.click(rowActionsButton[3]);

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

  it('renders the dense table correctly', async () => {
    props.dense = true;
    window.Element.prototype.getBoundingClientRect = vi
      .fn()
      .mockReturnValue({ height: 100, width: 400 });
    const view = createView();

    await waitFor(() => {
      expect(screen.getByText('5YUQDDjKpz2z')).toBeInTheDocument();
    });

    expect(view.asFragment()).toMatchSnapshot();
  });
});
