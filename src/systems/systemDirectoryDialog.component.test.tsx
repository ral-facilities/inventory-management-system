import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { imsApi } from '../api/api';
import { System } from '../app.types';
import SystemsJSON from '../mocks/Systems.json';
import { renderComponentWithRouterProvider } from '../testUtils';
import {
  SystemDirectoryDialog,
  SystemDirectoryDialogProps,
} from './systemDirectoryDialog.component';

describe('SystemDirectoryDialog', () => {
  let props: SystemDirectoryDialogProps;
  let user: UserEvent;
  let axiosPatchSpy;
  let axiosPostSpy;

  const mockOnClose = vi.fn();
  const mockOnChangeSelectedSystems = vi.fn();

  const mockSelectedSystems: System[] = [
    SystemsJSON[4] as System,
    SystemsJSON[5] as System,
  ];

  const createView = () => {
    return renderComponentWithRouterProvider(
      <SystemDirectoryDialog {...props} />
    );
  };

  beforeEach(() => {
    props = {
      open: true,
      onClose: mockOnClose,
      selectedSystems: mockSelectedSystems,
      onChangeSelectedSystems: mockOnChangeSelectedSystems,
      parentSystemId: null,
      type: 'moveTo',
    };

    user = userEvent.setup();
    axiosPatchSpy = vi.spyOn(imsApi, 'patch');
    axiosPostSpy = vi.spyOn(imsApi, 'post');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('calls onClose when Cancel button is clicked', async () => {
    createView();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(axiosPatchSpy).not.toHaveBeenCalled();
    expect(axiosPostSpy).not.toHaveBeenCalled();
    expect(mockOnChangeSelectedSystems).not.toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('does not close dialog on background click, or on escape key press', async () => {
    createView();

    await userEvent.click(document.body);

    expect(mockOnClose).not.toHaveBeenCalled();

    fireEvent.keyDown(screen.getByRole('dialog'), {
      key: 'Escape',
      code: 'Escape',
      keyCode: 27,
      charCode: 27,
    });

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('renders the breadcrumbs and navigates correctly', async () => {
    createView();

    await waitFor(() => {
      expect(screen.getByText('Giant laser')).toBeInTheDocument();
    });

    expect(
      screen.queryByRole('link', { name: 'Giant laser' })
    ).not.toBeInTheDocument();

    await user.click(screen.getByText('Giant laser'));

    await waitFor(() => {
      expect(screen.getByText('Smaller laser')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Smaller laser'));

    await waitFor(() => {
      expect(screen.getByText('Pulse Laser')).toBeInTheDocument();
    });

    expect(
      screen.getByRole('link', { name: 'Giant laser' })
    ).toBeInTheDocument();
    expect(screen.getByText('Smaller laser')).toBeInTheDocument();

    // Jump back to home again
    await user.click(screen.getByLabelText('navigate to systems home'));

    await waitFor(() => {
      expect(screen.queryByText('Smaller laser')).not.toBeInTheDocument();
    });
    expect(screen.getByText('Giant laser')).toBeInTheDocument();
  });

  it('starts navigation in the parent when given', async () => {
    props.parentSystemId = '65328f34a40ff5301575a4e4';

    createView();

    await waitFor(() => {
      expect(screen.getByText('Pulse Laser')).toBeInTheDocument();
    });

    expect(
      screen.getByRole('link', { name: 'Giant laser' })
    ).toBeInTheDocument();
    expect(screen.getByText('Smaller laser')).toBeInTheDocument();
  });

  it('renders add dialog when button is clicked and closes it', async () => {
    props.parentSystemId = '65328f34a40ff5301575a4e4';
    createView();

    const addButton = screen.getByRole('button', {
      name: 'Add System',
    });
    await user.click(addButton);
    //Used 'Name*' as 'Add System is the same as button name
    expect(screen.getByText('Name *')).toBeInTheDocument();

    const cancelButton = screen.getByRole('button', {
      name: 'Cancel',
    });
    await user.click(cancelButton);

    await waitFor(() => {
      expect(screen.getByText('Pulse Laser')).toBeInTheDocument();
    });
  });

  describe('Move to', () => {
    it('renders dialog correctly with multiple selected systems', () => {
      createView();

      expect(
        screen.getByText('Move 2 systems to a different system')
      ).toBeInTheDocument();
    });

    it('renders dialog correctly with one selected system', () => {
      props.selectedSystems = [mockSelectedSystems[0]];

      createView();

      expect(
        screen.getByText('Move 1 system to a different system')
      ).toBeInTheDocument();
    });

    it('cannot move selected systems to the same parent system', async () => {
      // Change selected systems to have a parent equal to the target
      props.selectedSystems = [
        SystemsJSON[0] as System,
        SystemsJSON[1] as System,
      ];

      createView();

      await waitFor(() => {
        expect(screen.getByText('Giant laser')).toBeInTheDocument();
      });

      expect(screen.getByRole('button', { name: 'Move here' })).toBeDisabled();
    });

    it('cannot move a selected system into itself', async () => {
      props.selectedSystems = [SystemsJSON[0] as System];

      createView();

      await waitFor(() => {
        expect(screen.getByText('Giant laser')).toBeInTheDocument();
      });

      expect(
        screen.getByRole('row', {
          name: `Giant laser row`,
        })
      ).toHaveStyle('cursor: not-allowed');
    });

    it('moves selected systems (to root system)', async () => {
      // Ensure starting from a different system
      props.parentSystemId = '65328f34a40ff5301575a4e4';

      createView();

      await waitFor(() => {
        expect(screen.getByText('Smaller laser')).toBeInTheDocument();
      });

      await user.click(screen.getByLabelText('navigate to systems home'));

      await waitFor(() => {
        expect(screen.getByText('Giant laser')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: 'Move here' }));

      expect(axiosPatchSpy).toHaveBeenCalledWith(
        '/v1/systems/65328f34a40ff5301575a4e7',
        {
          parent_id: null,
        }
      );
      expect(axiosPatchSpy).toHaveBeenCalledWith(
        '/v1/systems/65328f34a40ff5301575a4e8',
        {
          parent_id: null,
        }
      );

      expect(mockOnClose).toHaveBeenCalled();
      expect(mockOnChangeSelectedSystems).toHaveBeenCalledWith({});
    });

    it('moves selected systems (to non-root system)', async () => {
      createView();

      await waitFor(() => {
        expect(screen.getByText('Giant laser')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Giant laser'));

      await waitFor(() => {
        expect(screen.getByText('Smaller laser')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: 'Move here' }));

      expect(axiosPatchSpy).toHaveBeenCalledWith(
        '/v1/systems/65328f34a40ff5301575a4e7',
        {
          parent_id: '65328f34a40ff5301575a4e3',
        }
      );
      expect(axiosPatchSpy).toHaveBeenCalledWith(
        '/v1/systems/65328f34a40ff5301575a4e8',
        {
          parent_id: '65328f34a40ff5301575a4e3',
        }
      );

      expect(mockOnClose).toHaveBeenCalled();
      expect(mockOnChangeSelectedSystems).toHaveBeenCalledWith({});
    });
  });

  describe('Copy to', () => {
    beforeEach(() => {
      props.type = 'copyTo';
    });

    it('renders dialog correctly with multiple selected systems', () => {
      createView();

      expect(
        screen.getByText('Copy 2 systems to a different system')
      ).toBeInTheDocument();
    });

    it('renders dialog correctly with one selected system', () => {
      props.selectedSystems = [mockSelectedSystems[0]];

      createView();

      expect(
        screen.getByText('Copy 1 system to a different system')
      ).toBeInTheDocument();
    });

    it('displays warning tooltip on hover', async () => {
      createView();

      const infoIcon = screen.getByLabelText('Copy Warning');
      await user.hover(infoIcon);

      await waitFor(() => {
        expect(
          screen.getByText(
            'Only the system details will be copied; no subsystems or items within the system will be included.'
          )
        ).toBeInTheDocument();
      });

      await user.unhover(infoIcon);

      await waitFor(() => {
        expect(
          screen.queryByText(
            'Only the system details will be copied; no subsystems or items within the system will be included.'
          )
        ).not.toBeInTheDocument();
      });
    });

    it('can copy a selected system to the same parent system', async () => {
      props.selectedSystems = [SystemsJSON[0] as System];

      createView();

      await waitFor(() => {
        expect(screen.getByText('Giant laser')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: 'Copy here' }));

      expect(axiosPostSpy).toHaveBeenCalledWith('/v1/systems', {
        ...(SystemsJSON[0] as System),
        name: 'Giant laser_copy_1',
      });
    });

    it('can copy a selected system into itself', async () => {
      props.selectedSystems = [SystemsJSON[0] as System];

      createView();

      await waitFor(() => {
        expect(screen.getByText('Giant laser')).toBeInTheDocument();
      });

      expect(
        screen.getByRole('row', {
          name: `Giant laser row`,
        })
      ).toHaveStyle('cursor: pointer');

      await user.click(screen.getByText('Giant laser'));

      await waitFor(() => {
        expect(screen.getByText('Smaller laser')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: 'Copy here' }));

      expect(axiosPostSpy).toHaveBeenCalledWith('/v1/systems', {
        ...(SystemsJSON[0] as System),
        name: 'Giant laser',
        parent_id: SystemsJSON[0].id,
      });
    });

    it('copies selected systems (to root system)', async () => {
      createView();

      await waitFor(() => {
        expect(screen.getByText('Giant laser')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: 'Copy here' }));

      expect(axiosPostSpy).toHaveBeenCalledWith('/v1/systems', {
        ...props.selectedSystems[0],
        parent_id: null,
      });
      expect(axiosPostSpy).toHaveBeenCalledWith('/v1/systems', {
        ...props.selectedSystems[1],
        parent_id: null,
      });

      expect(mockOnClose).toHaveBeenCalled();
      expect(mockOnChangeSelectedSystems).toHaveBeenCalledWith({});
    });

    it('copies selected systems (to non-root system)', async () => {
      createView();

      await waitFor(() => {
        expect(screen.getByText('Giant laser')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Giant laser'));

      await waitFor(() => {
        expect(screen.getByText('Smaller laser')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: 'Copy here' }));

      expect(axiosPostSpy).toHaveBeenCalledWith('/v1/systems', {
        ...props.selectedSystems[0],
        parent_id: '65328f34a40ff5301575a4e3',
      });
      expect(axiosPostSpy).toHaveBeenCalledWith('/v1/systems', {
        ...props.selectedSystems[1],
        parent_id: '65328f34a40ff5301575a4e3',
      });

      expect(mockOnClose).toHaveBeenCalled();
      expect(mockOnChangeSelectedSystems).toHaveBeenCalledWith({});
    });

    it('copies selected system to a location with a duplicate code and not a duplicate name', async () => {
      props.selectedSystems = [
        {
          ...SystemsJSON[1],
          // 'Smaller laser' exists in mock data
          name: 'smaller laser',
        } as System,
      ];
      createView();

      await waitFor(() => {
        expect(screen.getByText('Giant laser')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Giant laser'));

      await waitFor(() => {
        expect(screen.getByText('Smaller laser')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: 'Copy here' }));

      expect(axiosPostSpy).toHaveBeenCalledWith('/v1/systems', {
        ...props.selectedSystems[0],
        name: 'smaller laser_copy_1',
        parent_id: '65328f34a40ff5301575a4e3',
      });

      expect(mockOnClose).toHaveBeenCalled();
      expect(mockOnChangeSelectedSystems).toHaveBeenCalledWith({});
    });

    it('copies selected system to a location with a duplicate code and duplicate name', async () => {
      props.selectedSystems = [SystemsJSON[1] as System];
      createView();

      await waitFor(() => {
        expect(screen.getByText('Giant laser')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Giant laser'));

      await waitFor(() => {
        expect(screen.getByText('Smaller laser')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: 'Copy here' }));

      expect(axiosPostSpy).toHaveBeenCalledWith('/v1/systems', {
        ...props.selectedSystems[0],
        name: 'Smaller laser_copy_1',
        parent_id: '65328f34a40ff5301575a4e3',
      });

      expect(mockOnClose).toHaveBeenCalled();
      expect(mockOnChangeSelectedSystems).toHaveBeenCalledWith({});
    });
  });
});
