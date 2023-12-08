import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { System } from '../app.types';
import SystemsJSON from '../mocks/Systems.json';
import { renderComponentWithBrowserRouter } from '../setupTests';
import {
  SystemsTableView,
  SystemsTableViewProps,
} from './systemsTableView.component';

describe('SystemsTableView', () => {
  let props: SystemsTableViewProps;
  let user;

  const mockOnChangeParentId = jest.fn();
  const mockSystemsData: System[] = [
    SystemsJSON[0] as System,
    SystemsJSON[1] as System,
    SystemsJSON[2] as System,
  ];

  const createView = () => {
    return renderComponentWithBrowserRouter(<SystemsTableView {...props} />);
  };

  beforeEach(() => {
    props = {
      systemsData: mockSystemsData,
      systemsDataLoading: false,
      onChangeParentId: mockOnChangeParentId,
      selectedSystems: [mockSystemsData[1], mockSystemsData[2]],
    };

    user = userEvent.setup();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders text correctly', async () => {
    createView();

    await waitFor(() => {
      expect(screen.getByText('Name')).toBeInTheDocument();
    });

    mockSystemsData.forEach((system) =>
      expect(screen.getByText(system.name)).toBeInTheDocument()
    );
  });

  it('renders no results page correctly', async () => {
    props.systemsData = [];

    createView();

    await waitFor(() => {
      expect(screen.getByText('No systems found')).toBeInTheDocument();
    });
  });

  it('calls onChangeParentId when a table row is clicked', async () => {
    createView();

    await waitFor(() => {
      expect(screen.getByText('Giant laser')).toBeInTheDocument();
    });

    await user.click(
      screen.getByRole('row', { name: `${mockSystemsData[0].name} row` })
    );

    expect(mockOnChangeParentId).toBeCalledWith(mockSystemsData[0].id);
  });

  it('disables clicking of systems that are already selected', async () => {
    createView();

    await waitFor(() => {
      expect(screen.getByText('Giant laser')).toBeInTheDocument();
    });

    expect(props.selectedSystems.length).toBe(2);
    for (const system of props.selectedSystems) {
      const disabledSystemRow = screen.getByRole('row', {
        name: `${system.name} row`,
      });
      await user.click(disabledSystemRow);
      expect(disabledSystemRow).toHaveStyle('cursor: not-allowed');
    }

    expect(mockOnChangeParentId).not.toHaveBeenCalled();
  });
});
