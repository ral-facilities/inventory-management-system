import { screen, waitFor } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { System } from '../api/api.types';
import SystemsJSON from '../mocks/Systems.json';
import { renderComponentWithRouterProvider } from '../testUtils';
import {
  SystemsTableView,
  SystemsTableViewProps,
} from './systemsTableView.component';

describe('SystemsTableView', () => {
  let props: SystemsTableViewProps;
  let user: UserEvent;

  const mockOnChangeParentId = vi.fn();
  const mockSystemsData: System[] = [
    SystemsJSON[1] as System,
    SystemsJSON[2] as System,
    SystemsJSON[3] as System,
  ];

  const createView = () => {
    return renderComponentWithRouterProvider(<SystemsTableView {...props} />);
  };

  beforeEach(() => {
    props = {
      systemsData: mockSystemsData,
      systemsDataLoading: false,
      isSystemSelectable: () => true,
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

    await waitFor(() =>
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    );

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

  it('can open and close the add system dialog', async () => {
    createView();

    await waitFor(() => {
      expect(screen.getByText('Giant laser')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Add System' }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});
