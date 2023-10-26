import { fireEvent, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { renderComponentWithBrowserRouter } from '../setupTests';
import SystemDialog, { SystemDialogProps } from './systemDialog.component';
import axios from 'axios';
import { SystemImportanceType } from '../api/systems';

describe('Systems Dialog', () => {
  let props: SystemDialogProps;
  let user;
  let axiosPostSpy;

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
        target: { value: 'System name' },
      });
    values.description &&
      fireEvent.change(screen.getByLabelText('Description'), {
        target: { value: 'System description' },
      });
    values.location &&
      fireEvent.change(screen.getByLabelText('Location'), {
        target: { value: 'System location' },
      });
    values.owner &&
      fireEvent.change(screen.getByLabelText('Owner'), {
        target: { value: 'System owner' },
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
      onClose: () => {},
      parentId: undefined,
      type: 'add',
    };
    user = userEvent.setup();
    axiosPostSpy = jest.spyOn(axios, 'post');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', async () => {
    const view = createView();

    expect(screen.getByText('Add System')).toBeInTheDocument();
    expect(view.baseElement).toMatchSnapshot();
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
  });
});
