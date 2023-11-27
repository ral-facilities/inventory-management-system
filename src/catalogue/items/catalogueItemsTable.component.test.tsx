import React from 'react';
import {
  getCatalogueCategoryById,
  renderComponentWithBrowserRouter,
} from '../../setupTests';
import { screen, waitFor } from '@testing-library/react';
import CatalogueItemsTable, {
  CatalogueItemsTableProps,
} from './catalogueItemsTable.component';
import userEvent from '@testing-library/user-event';

// jest.setTimeout(20000);
describe('Catalogue Items Table', () => {
  let props: CatalogueItemsTableProps;
  let user;

  const createView = () => {
    return renderComponentWithBrowserRouter(<CatalogueItemsTable {...props} />);
  };

  const hideOrShowColumn = async (columns: string[]) => {
    await user.click(screen.getByRole('button', { name: 'Show/Hide columns' }));
    await user.click(screen.getByText('Hide all'));
    for (const column of columns) {
      await user.click(screen.getByText(column));
      expect(screen.getAllByText(column).length).toEqual(2);
    }
  };

  beforeEach(() => {
    props = {
      dense: false,
      parentInfo: getCatalogueCategoryById('5'),
    };
    user = userEvent.setup();
    window.ResizeObserver = jest.fn().mockImplementation(() => ({
      disconnect: jest.fn(),
      observe: jest.fn(),
      unobserve: jest.fn(),
    }));
    window.Element.prototype.getBoundingClientRect = jest
      .fn()
      .mockReturnValue({ height: 100, width: 200 });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders table correctly (section 1 due to column virtualisation )', async () => {
    createView();
    await waitFor(() => {
      expect(screen.getByText('Name')).toBeInTheDocument();
    });
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Is Obsolete')).toBeInTheDocument();
    expect(screen.getByText('Obsolete replacement link')).toBeInTheDocument();
  });

  it('renders table correctly (Cameras more details)', async () => {
    props.parentInfo = getCatalogueCategoryById('4');
    createView();
    await waitFor(() => {
      expect(screen.getByText('Name')).toBeInTheDocument();
    });

    await hideOrShowColumn([
      'Sensor brand',
      'Cost to Rework (GBP)',
      'Days to Rework',
    ]);
  });

  it('renders table correctly (section 2 due to column virtualisation )', async () => {
    createView();
    await waitFor(() => {
      expect(screen.getByText('Name')).toBeInTheDocument();
    });

    await hideOrShowColumn([
      'Obsolete Reason',
      'Measurement Range (Joules)',
      'Accuracy',
      'Cost (GBP)',
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

    await hideOrShowColumn([
      'Cost to Rework (GBP)',
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

    await hideOrShowColumn(['Broken', 'Older than five years']);
  });

  it('renders table correctly (section 4 due to column virtualisation )', async () => {
    createView();
    await waitFor(() => {
      expect(screen.getByText('Name')).toBeInTheDocument();
    });

    await hideOrShowColumn([
      'Drawing Link',
      'Item Model Number',
      'Manufacturer',
    ]);
  });

  it('displays descriptions tooltip on hover', async () => {
    createView();

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

  it('opens the add catalogue item dialog for save as', async () => {
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

    const url = screen.queryAllByText('Click here');
    expect(url[0]).toHaveAttribute('href', '/items/6');
  });

  it.only('renders the dense table correctly', async () => {
    props.dense = true;
    window.Element.prototype.getBoundingClientRect = jest
      .fn()
      .mockReturnValue({ height: 100, width: 1135 });
    const view = createView();

    await waitFor(() => {
      expect(screen.getByText('Energy Meters 26')).toBeInTheDocument();
    });

    expect(view.asFragment()).toMatchSnapshot();
  });

  // skipping this test as it causes an infinite loop on the waitFor this infinite
  // loop doesn't when tested on the browser
  it.skip('renders the dense table correctly and can expand and coll', async () => {
    props.dense = true;
    window.Element.prototype.getBoundingClientRect = jest
      .fn()
      .mockReturnValue({ height: 100, width: 1135 });
    createView();

    await waitFor(() => {
      expect(screen.getAllByLabelText('Expand')[0]).toBeInTheDocument();
    });
    const rowExpandButton = screen.getAllByRole('button', { name: 'Expand' });

    user.click(rowExpandButton[0]);

    await waitFor(() => {
      expect(screen.getByText('Details')).toBeInTheDocument();
    });
  });
});
