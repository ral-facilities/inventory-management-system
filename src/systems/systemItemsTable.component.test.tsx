import { screen, waitFor } from '@testing-library/react';
import React from 'react';
import { System } from '../app.types';
import SystemsJSON from '../mocks/Systems.json';
import { renderComponentWithBrowserRouter } from '../setupTests';
import {
  SystemItemsTable,
  SystemItemsTableProps,
} from './systemItemsTable.component';

describe('SystemItemsTable', () => {
  let props: SystemItemsTableProps;

  let mockSystem: System = SystemsJSON[2] as System;

  const createView = () => {
    return renderComponentWithBrowserRouter(<SystemItemsTable {...props} />);
  };

  beforeEach(() => {
    props = { system: mockSystem };

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
    await waitFor(() => {
      expect(
        screen.getByRole('cell', {
          name: `Turbomolecular Pumps 42`,
        })
      ).toBeInTheDocument();
    });

    // Rest in a snapshot
    expect(view.asFragment()).toMatchSnapshot();
  });

  it('renders correctly when there are no items to display', async () => {
    props.system.id = 'random';

    createView();

    expect(screen.getByText('No items found')).toBeInTheDocument();
  });
});
