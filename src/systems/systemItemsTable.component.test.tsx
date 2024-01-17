import { screen, waitFor } from '@testing-library/react';
import React from 'react';
import { System } from '../app.types';
import SystemsJSON from '../mocks/Systems.json';
import { renderComponentWithBrowserRouter } from '../setupTests';
import {
  SystemItemsTable,
  SystemItemsTableProps,
} from './systemItemsTable.component';
import userEvent from '@testing-library/user-event';

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
            name: `Turbomolecular Pumps 42`,
          })
        ).toBeInTheDocument();
      },
      { timeout: 4000 }
    );

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
            name: `Turbomolecular Pumps 42`,
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
            name: `Turbomolecular Pumps 42`,
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
            name: `Turbomolecular Pumps 42`,
          })
        ).toBeInTheDocument();
      },
      { timeout: 4000 }
    );
  });
});
