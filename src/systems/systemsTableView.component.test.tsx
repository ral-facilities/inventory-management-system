import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { System } from '../app.types';
import SystemsJSON from '../mocks/Systems.json';
import { renderComponentWithBrowserRouter } from '../testUtils';
import {
  SystemsTableView,
  SystemsTableViewProps,
} from './systemsTableView.component';

describe('SystemsTableView', () => {
  let props: SystemsTableViewProps;
  let user;

  const mockOnChangeParentId = vi.fn();
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
      type: 'moveTo',
    };

    user = userEvent.setup();
  });

  afterEach(() => {
    vi.clearAllMocks();
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

    expect(mockOnChangeParentId).toHaveBeenCalledWith(mockSystemsData[0].id);
  });

  it('disables clicking of systems that are already selected for moveTo', async () => {
    createView();

    await waitFor(() => {
      expect(screen.getByText('Giant laser')).toBeInTheDocument();
    });

    expect(props.selectedSystems.length).toBe(2);
    for (const system of props.selectedSystems) {
      const disabledSystemRow = screen.getByRole('row', {
        name: `${system.name} row`,
      });
      expect(disabledSystemRow).toHaveStyle('cursor: not-allowed');
      await user.click(disabledSystemRow);
    }

    expect(mockOnChangeParentId).not.toHaveBeenCalled();
  });

  it('does not disable clicking of systems that are already selected for copyTo', async () => {
    props.type = 'copyTo';

    createView();

    await waitFor(() => {
      expect(screen.getByText('Giant laser')).toBeInTheDocument();
    });

    expect(props.selectedSystems.length).toBe(2);
    for (const system of props.selectedSystems) {
      const systemRow = screen.getByRole('row', {
        name: `${system.name} row`,
      });

      expect(systemRow).toHaveStyle('cursor: pointer');
      await user.click(systemRow);
      expect(mockOnChangeParentId).toHaveBeenCalledWith(system.id);
    }
  });
});
