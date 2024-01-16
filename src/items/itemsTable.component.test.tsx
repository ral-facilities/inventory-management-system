import React from 'react';
import {
  getCatalogueCategoryById,
  getCatalogueItemById,
  renderComponentWithBrowserRouter,
} from '../setupTests';
import userEvent from '@testing-library/user-event';
import { waitFor, screen } from '@testing-library/react';
import ItemsTable, { ItemTableProps } from './itemsTable.component';

describe('Items Table', () => {
  let props: ItemTableProps;
  let user;
  const createView = () => {
    return renderComponentWithBrowserRouter(<ItemsTable {...props} />);
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

  it('renders correctly part 1 due column virtaulisation', async () => {
    const view = createView();
    expect(view.asFragment()).toMatchSnapshot();
  });

  it('renders correctly part 2 due column virtaulisation', async () => {
    const view = createView();
    await ensureColumnsVisible([
      'Notes',
      'Frame Rate (fps)',
      'Sensor Type',
      'Broken',
    ]);
    expect(view.asFragment()).toMatchSnapshot();
  });

  it('renders correctly part 3 due column virtaulisation', async () => {
    createView();
    await ensureColumnsVisible(['Warranty End Date']);
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

  it('opens the add catalogue item dialog for save as', async () => {
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
