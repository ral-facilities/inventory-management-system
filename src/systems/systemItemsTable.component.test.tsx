import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { System } from '../app.types';
import SystemsJSON from '../mocks/Systems.json';
import { renderComponentWithBrowserRouter } from '../setupTests';
import {
  SystemItemsTable,
  SystemItemsTableProps,
} from './systemItemsTable.component';

describe('SystemItemsTable', () => {
  jest.setTimeout(10000);

  let props: SystemItemsTableProps;
  let user;

  let mockSystem: System = SystemsJSON[2] as System;

  const createView = () => {
    return renderComponentWithBrowserRouter(<SystemItemsTable {...props} />);
  };

  beforeEach(() => {
    props = { system: mockSystem };

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

  it('renders correctly', async () => {
    const view = createView();

    // Name (obtained from catalouge category item)
    await waitFor(
      () => {
        expect(
          screen.getByRole('cell', {
            name: `Turbomolecular Pumps 42 (1)`,
          })
        ).toBeInTheDocument();
      },
      { timeout: 4000 }
    );

    // Ensure no loading bars visible
    await waitFor(() =>
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    );

    // Expand a group so all columns are rendered to improve test coverage
    // (expanding all causes an infinite loop due to an issue with details panels)
    await user.click(screen.getAllByRole('button', { name: 'Expand' })[0]);
    //also unhide created column
    await user.click(
      await screen.findByRole('button', { name: 'Show/Hide columns' })
    );
    await user.click(screen.getByText('Created'));

    // Rest in a snapshot
    expect(view.asFragment()).toMatchSnapshot();
  });

  it('renders correctly when there are no items to display', async () => {
    props.system = { ...props.system, id: 'invalid' };

    createView();

    expect(screen.getByText('No items found')).toBeInTheDocument();
  });

  it('can set a table filter and clear them again', async () => {
    createView();

    // Name (obtained from catalouge category item)
    await waitFor(
      () => {
        expect(
          screen.getByRole('cell', {
            name: `Turbomolecular Pumps 42 (1)`,
          })
        ).toBeInTheDocument();
      },
      { timeout: 4000 }
    );

    const clearFiltersButton = screen.getByRole('button', {
      name: 'Clear Filters',
    });
    expect(clearFiltersButton).toBeDisabled();

    await user.type(screen.getByLabelText('Filter by Catalogue Item'), '43');

    await waitFor(
      () => {
        expect(
          screen.queryByRole('cell', {
            name: `Turbomolecular Pumps 42 (1)`,
          })
        ).not.toBeInTheDocument();
      },
      { timeout: 4000 }
    );

    await user.click(clearFiltersButton);

    await waitFor(
      () => {
        expect(
          screen.getByRole('cell', {
            name: `Turbomolecular Pumps 42 (1)`,
          })
        ).toBeInTheDocument();
      },
      { timeout: 4000 }
    );
  });

  it('can select and deselect items', async () => {
    createView();

    // Name (obtained from catalouge category item)
    await waitFor(
      () => {
        expect(
          screen.getByRole('cell', {
            name: `Turbomolecular Pumps 42 (1)`,
          })
        ).toBeInTheDocument();
      },
      { timeout: 4000 }
    );

    expect(screen.getByRole('button', { name: 'Move to' })).toBeDisabled();

    const checkboxes = screen.getAllByRole('checkbox', {
      name: 'Toggle select row',
    });

    await user.click(checkboxes[0]);
    await user.click(checkboxes[1]);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Move to' })).toBeEnabled();
    });

    await user.click(checkboxes[0]);
    await user.click(checkboxes[1]);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Move to' })).toBeDisabled();
    });
  });

  it('can open and close the move items dialog', async () => {
    createView();

    // Name (obtained from catalouge category item)
    await waitFor(
      () => {
        expect(
          screen.getByRole('cell', {
            name: `Turbomolecular Pumps 42 (1)`,
          })
        ).toBeInTheDocument();
      },
      { timeout: 4000 }
    );

    expect(screen.getByRole('button', { name: 'Move to' })).toBeDisabled();

    const checkboxes = screen.getAllByRole('checkbox', {
      name: 'Toggle select row',
    });

    await user.click(checkboxes[0]);

    const moveToButton = screen.getByRole('button', { name: 'Move to' });
    await waitFor(() => {
      expect(moveToButton).toBeEnabled();
    });

    await user.click(moveToButton);

    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});
