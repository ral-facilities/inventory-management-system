import React from 'react';
import {
  getCatalogueCategoryById,
  getCatalogueItemById,
  renderComponentWithRouterProvider,
} from '../setupTests';
import userEvent from '@testing-library/user-event';
import { waitFor, screen } from '@testing-library/react';
import ItemsTable, { ItemTableProps } from './itemsTable.component';

describe('Items Table', () => {
  jest.setTimeout(10000);

  let props: ItemTableProps;
  let user;
  const createView = () => {
    return renderComponentWithRouterProvider(
      <ItemsTable {...props} />,
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
      catalogueCategory: getCatalogueCategoryById('4'),
      catalogueItem: getCatalogueItemById('1'),
      dense: false,
    };
    window.ResizeObserver = jest.fn().mockImplementation(() => ({
      disconnect: jest.fn(),
      observe: jest.fn(),
      unobserve: jest.fn(),
    }));
    window.Element.prototype.getBoundingClientRect = jest
      .fn()
      .mockReturnValue({ height: 100, width: 200 });

    user = userEvent.setup();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly part 1 due column virtualisation', async () => {
    const view = createView();
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
    await ensureColumnsVisible(['Warranty End Date', 'System ID']);

    const systemID = screen.getAllByText('65328f34a40ff5301575a4e3');
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
    await ensureColumnsVisible(['ID']);

    const Id = screen.getByText('KvT2Ox7n');
    expect(Id).toHaveAttribute('href', '/KvT2Ox7n');
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
      '6Y5XTJfBrNNx8oltI9HE\n\nThis is a copy of the item with this ID: KvT2Ox7n'
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
      '\n\nThis is a copy of the item with this ID: 3lmRHP8q'
    );
  });

  it('can open the save as dialog (no delivered date or warranty date) and close it again', async () => {
    props.catalogueCategory = getCatalogueCategoryById('4');
    props.catalogueItem = getCatalogueItemById('3');
    createView();

    const serialNumber = 'A5Hcs053';
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
    window.Element.prototype.getBoundingClientRect = jest
      .fn()
      .mockReturnValue({ height: 100, width: 400 });
    const view = createView();

    await waitFor(() => {
      expect(screen.getByText('5YUQDDjKpz2z')).toBeInTheDocument();
    });

    expect(view.asFragment()).toMatchSnapshot();
  });
});
