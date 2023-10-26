import { fireEvent, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import React from 'react';
import { SystemImportanceType } from '../api/systems';
import { renderComponentWithBrowserRouter } from '../setupTests';
import SystemDialog, { SystemDialogProps } from './systemDialog.component';

describe('Systems Dialog', () => {
  let props: SystemDialogProps;
  let user;
  let axiosPostSpy;

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
    values.name &&
      fireEvent.change(screen.getByLabelText('Name *'), {
        target: { value: values.name },
      });
    values.description &&
      fireEvent.change(screen.getByLabelText('Description'), {
        target: { value: values.description },
      });
    values.location &&
      fireEvent.change(screen.getByLabelText('Location'), {
        target: { value: values.location },
      });
    values.owner &&
      fireEvent.change(screen.getByLabelText('Owner'), {
        target: { value: values.owner },
      });

    if (values.importance) {
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
  });

  afterEach(() => {
    jest.clearAllMocks();
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
