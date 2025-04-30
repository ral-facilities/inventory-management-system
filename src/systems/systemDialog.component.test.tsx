import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { http } from 'msw';
import { MockInstance } from 'vitest';
import { imsApi } from '../api/api';
import { System, SystemImportanceType } from '../api/api.types';
import handleIMS_APIError from '../handleIMS_APIError';
import { server } from '../mocks/server';
import {
  CREATED_MODIFIED_TIME_VALUES,
  renderComponentWithRouterProvider,
} from '../testUtils';
import SystemDialog, { SystemDialogProps } from './systemDialog.component';

vi.mock('../handleIMS_APIError');

describe('Systems Dialog', () => {
  let props: SystemDialogProps;
  let user: UserEvent;
  let axiosPostSpy: MockInstance;
  let axiosPatchSpy: MockInstance;

  const mockOnClose = vi.fn();

  const createView = () => {
    return renderComponentWithRouterProvider(<SystemDialog {...props} />);
  };

  // Modifies values when given a value that is not undefined
  const modifyValues = (values: {
    name?: string;
    description?: string;
    location?: string;
    owner?: string;
    importance?: SystemImportanceType;
  }) => {
    if (values.name !== undefined)
      fireEvent.change(screen.getByLabelText('Name *'), {
        target: { value: values.name },
      });
    if (values.description !== undefined)
      fireEvent.change(screen.getByLabelText('Description'), {
        target: { value: values.description },
      });
    if (values.location !== undefined)
      fireEvent.change(screen.getByLabelText('Location'), {
        target: { value: values.location },
      });
    if (values.owner !== undefined)
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
      requestType: 'post',
    };
    user = userEvent.setup();
    axiosPostSpy = vi.spyOn(imsApi, 'post');
    axiosPatchSpy = vi.spyOn(imsApi, 'patch');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Add', () => {
    beforeEach(() => {
      props.requestType = 'post';
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

    it('disables save button and shows circular progress indicator when request is pending', async () => {
      server.use(
        http.post('/v1/systems', () => {
          return new Promise(() => {});
        })
      );

      createView();

      modifyValues({ name: 'test' });

      const saveButton = screen.getByRole('button', { name: 'Save' });
      await user.click(saveButton);

      expect(saveButton).toBeDisabled();
      expect(await screen.findByRole('progressbar')).toBeInTheDocument();
    });

    it('calls onClose when cancel is clicked', async () => {
      createView();

      await user.click(screen.getByRole('button', { name: 'Cancel' }));

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('does not close dialog on background click, but does on escape key', async () => {
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

      expect(screen.getByText('Please enter a name.')).toBeInTheDocument();
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
          'A System with the same name already exists within the same parent System. Please enter a different name.'
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

      expect(handleIMS_APIError).toHaveBeenCalled();

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
      ...CREATED_MODIFIED_TIME_VALUES,
    };

    beforeEach(() => {
      props.requestType = 'patch';
      props.parentId = undefined;
      props.selectedSystem = MOCK_SELECTED_SYSTEM;
    });

    it('renders correctly when editing', async () => {
      createView();

      expect(screen.getByText('Edit System')).toBeInTheDocument();
    });

    it('disables save button and shows circular progress indicator when request is pending', async () => {
      server.use(
        http.patch('/v1/systems/:id', () => {
          return new Promise(() => {});
        })
      );

      createView();

      modifyValues({ name: 'test' });

      const saveButton = screen.getByRole('button', { name: 'Save' });
      await user.click(saveButton);

      expect(saveButton).toBeDisabled();
      expect(await screen.findByRole('progressbar')).toBeInTheDocument();
    });

    it('calls onClose when cancel is clicked', async () => {
      createView();

      await user.click(screen.getByRole('button', { name: 'Cancel' }));

      expect(mockOnClose).toHaveBeenCalled();
      expect(axiosPatchSpy).not.toHaveBeenCalled();
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

    it('edits a system removing non-mandatory fields', async () => {
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
        screen.getByText(
          "There have been no changes made. Please change a field's value or press Cancel to exit."
        )
      ).toBeInTheDocument();
      expect(mockOnClose).not.toHaveBeenCalled();

      modifyValues({ description: 'New description' });

      await waitFor(() =>
        expect(
          screen.queryByText(
            "There have been no changes made. Please change a field's value or press Cancel to exit."
          )
        ).not.toBeInTheDocument()
      );
    });

    it('displays error message when name field is not filled in', async () => {
      createView();

      modifyValues({ name: '' });

      await user.click(screen.getByRole('button', { name: 'Save' }));

      expect(screen.getByText('Please enter a name.')).toBeInTheDocument();
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
          'A System with the same name already exists within the same parent System. Please enter a different name.'
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

      expect(handleIMS_APIError).toHaveBeenCalled();

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Duplicate', () => {
    // Mostly tested above anyway, so only a few checks here to ensure
    // correct logic (out of add/edit) is applied when the dialogue type is 'duplicate'

    const MOCK_SELECTED_SYSTEM: System = {
      name: 'Mock laser',
      location: 'Location',
      owner: 'Owner',
      importance: SystemImportanceType.HIGH,
      description: 'Description',
      parent_id: null,
      id: '65328f34a40ff5301575a4e3',
      code: 'mock-laser',
      ...CREATED_MODIFIED_TIME_VALUES,
    };

    const MOCK_SELECTED_SYSTEM_POST_DATA = JSON.parse(
      JSON.stringify(MOCK_SELECTED_SYSTEM)
    ) as Partial<System>;
    delete MOCK_SELECTED_SYSTEM_POST_DATA.id;
    delete MOCK_SELECTED_SYSTEM_POST_DATA.code;
    delete MOCK_SELECTED_SYSTEM_POST_DATA.created_time;
    delete MOCK_SELECTED_SYSTEM_POST_DATA.modified_time;

    beforeEach(() => {
      props.requestType = 'post';
      props.duplicate = true;
      props.parentId = null;
      props.selectedSystem = MOCK_SELECTED_SYSTEM;
    });

    it('renders correctly when saving as', async () => {
      createView();

      expect(screen.getByText('Add System')).toBeInTheDocument();
    });

    it('renders correctly when saving as a subsystem', async () => {
      props.parentId = 'parent-id';

      createView();

      expect(screen.getByText('Add Subsystem')).toBeInTheDocument();
    });

    it('saves as a system', async () => {
      props.parentId = 'parent-id';

      createView();

      const values = {
        name: 'System name',
      };
      modifyValues(values);

      await user.click(screen.getByRole('button', { name: 'Save' }));

      expect(axiosPostSpy).toHaveBeenCalledWith('/v1/systems', {
        ...MOCK_SELECTED_SYSTEM_POST_DATA,
        ...values,
        parent_id: 'parent-id',
      });

      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
