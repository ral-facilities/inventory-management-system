import { fireEvent, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import React from 'react';
import { renderComponentWithBrowserRouter } from '../setupTests';
import SystemDialog, { SystemDialogProps } from './systemDialog.component';
import { System, SystemImportanceType } from '../app.types';

describe('Systems Dialog', () => {
  let props: SystemDialogProps;
  let user;
  let axiosPostSpy;
  let axiosPatchSpy;

  const mockOnClose = jest.fn();

  const createView = () => {
    return renderComponentWithBrowserRouter(<SystemDialog {...props} />);
  };

  // Modifies values when given a value that is not undefined
  const modifyValues = (values: {
    name?: string;
    description?: string;
    location?: string;
    owner?: string;
    importance?: SystemImportanceType;
  }) => {
    values.name !== undefined &&
      fireEvent.change(screen.getByLabelText('Name *'), {
        target: { value: values.name },
      });
    values.description !== undefined &&
      fireEvent.change(screen.getByLabelText('Description'), {
        target: { value: values.description },
      });
    values.location !== undefined &&
      fireEvent.change(screen.getByLabelText('Location'), {
        target: { value: values.location },
      });
    values.owner !== undefined &&
      fireEvent.change(screen.getByLabelText('Owner'), {
        target: { value: values.owner },
      });

    if (values.importance !== undefined) {
      fireEvent.mouseDown(screen.getByLabelText('Importance'));
      fireEvent.click(
        within(screen.getByRole('listbox')).getByText(values.importance)
      );
    }
  };

  beforeEach(() => {
    props = {
      open: true,
      onClose: mockOnClose,
      parentId: null,
      type: 'add',
    };
    user = userEvent.setup();
    axiosPostSpy = jest.spyOn(axios, 'post');
    axiosPatchSpy = jest.spyOn(axios, 'patch');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Add', () => {
    beforeEach(() => {
      props.type = 'add';
      props.parentId = null;
    });

    it('renders correctly when adding', async () => {
      const view = createView();

      expect(screen.getByText('Add System')).toBeInTheDocument();
      expect(view.baseElement).toMatchSnapshot();
    });

    it('renders correctly when adding a subsystem', async () => {
      props.parentId = 'parent-id';

      createView();

      expect(screen.getByText('Add Subsystem')).toBeInTheDocument();
    });

    it('calls onClose when cancel is clicked', async () => {
      createView();

      await user.click(screen.getByRole('button', { name: 'Cancel' }));

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('adds a system', async () => {
      props.parentId = 'parent-id';

      createView();

      const values = {
        name: 'System name',
        description: 'System description',
        location: 'System location',
        owner: 'System owner',
        importance: SystemImportanceType.HIGH,
      };
      modifyValues(values);

      await user.click(screen.getByRole('button', { name: 'Save' }));

      expect(axiosPostSpy).toHaveBeenCalledWith('/v1/systems', {
        ...values,
        parent_id: 'parent-id',
      });

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('adds a system with only mandatory fields', async () => {
      createView();

      const values = {
        name: 'System name',
      };

      modifyValues(values);

      await user.click(screen.getByRole('button', { name: 'Save' }));

      expect(axiosPostSpy).toHaveBeenCalledWith('/v1/systems', {
        ...values,
        importance: SystemImportanceType.MEDIUM,
      });
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('displays error message when name field is not filled in', async () => {
      createView();

      await user.click(screen.getByRole('button', { name: 'Save' }));

      expect(screen.getByText('Please enter a name')).toBeInTheDocument();
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('displays error message when attempting to add a system with a duplicate name', async () => {
      createView();

      const values = {
        name: 'Error 409',
      };

      modifyValues(values);

      await user.click(screen.getByRole('button', { name: 'Save' }));

      expect(
        screen.getByText(
          'A System with the same name already exists within the same parent System'
        )
      ).toBeInTheDocument();
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('displays error message when an unknown error occurs', async () => {
      createView();

      const values = {
        name: 'Error 500',
      };

      modifyValues(values);

      await user.click(screen.getByRole('button', { name: 'Save' }));

      expect(
        screen.getByText('Please refresh and try again')
      ).toBeInTheDocument();
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Edit', () => {
    const MOCK_SELECTED_SYSTEM: System = {
      name: 'Mock laser',
      location: 'Location',
      owner: 'Owner',
      importance: SystemImportanceType.HIGH,
      description: 'Description',
      parent_id: null,
      id: '65328f34a40ff5301575a4e3',
      code: 'mock-laser',
    };

    beforeEach(() => {
      props.type = 'edit';
      props.parentId = undefined;
      props.selectedSystem = MOCK_SELECTED_SYSTEM;
    });

    it('renders correctly when editing', async () => {
      createView();

      expect(screen.getByText('Edit System')).toBeInTheDocument();
    });

    it('calls onClose when cancel is clicked', async () => {
      createView();

      await user.click(screen.getByRole('button', { name: 'Cancel' }));

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('edits a system', async () => {
      createView();

      const values = {
        name: 'System name',
        description: 'System description',
        location: 'System location',
        owner: 'System owner',
        importance: SystemImportanceType.LOW,
      };
      modifyValues(values);

      await user.click(screen.getByRole('button', { name: 'Save' }));

      expect(axiosPatchSpy).toHaveBeenCalledWith(
        `/v1/systems/${MOCK_SELECTED_SYSTEM['id']}`,
        values
      );

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('edits a system removing non-manditory fields', async () => {
      createView();

      const values = {
        description: '',
        location: '',
        owner: '',
      };

      modifyValues(values);

      await user.click(screen.getByRole('button', { name: 'Save' }));

      expect(axiosPatchSpy).toHaveBeenCalledWith(
        `/v1/systems/${MOCK_SELECTED_SYSTEM['id']}`,
        { description: null, location: null, owner: null }
      );
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('edits only a systems name', async () => {
      createView();

      const values = {
        name: 'System name',
      };
      modifyValues(values);

      await user.click(screen.getByRole('button', { name: 'Save' }));

      expect(axiosPatchSpy).toHaveBeenCalledWith(
        `/v1/systems/${MOCK_SELECTED_SYSTEM['id']}`,
        values
      );

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('displays error message when no fields have been changed that disappears when the form is modified', async () => {
      createView();

      await user.click(screen.getByRole('button', { name: 'Save' }));

      expect(
        screen.getByText('Please edit a form entry before clicking save')
      ).toBeInTheDocument();
      expect(mockOnClose).not.toHaveBeenCalled();

      modifyValues({ description: 'New description' });

      expect(
        screen.queryByText('Please edit a form entry before clicking save')
      ).not.toBeInTheDocument();
    });

    it('displays error message when name field is not filled in', async () => {
      createView();

      modifyValues({ name: '' });

      await user.click(screen.getByRole('button', { name: 'Save' }));

      expect(screen.getByText('Please enter a name')).toBeInTheDocument();
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('displays error message when attempting to edit a system with a duplicate name', async () => {
      createView();

      const values = {
        name: 'Error 409',
      };

      modifyValues(values);

      await user.click(screen.getByRole('button', { name: 'Save' }));

      expect(
        screen.getByText(
          'A System with the same name already exists within the same parent System'
        )
      ).toBeInTheDocument();
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('displays error message when an unknown error occurs', async () => {
      createView();

      const values = {
        name: 'Error 500',
      };

      modifyValues(values);

      await user.click(screen.getByRole('button', { name: 'Save' }));

      expect(
        screen.getByText('Please refresh and try again')
      ).toBeInTheDocument();
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });
});
