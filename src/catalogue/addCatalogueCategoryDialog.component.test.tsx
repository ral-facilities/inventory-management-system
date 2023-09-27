import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddCatalogueCategoryDialog, {
  AddCatalogueCategoryDialogProps,
} from './addCatalogueCategoryDialog.component';
import { renderComponentWithBrowserRouter } from '../setupTests';
describe('Add Catalogue Category Dialog', () => {
  const onClose = jest.fn();
  const onChangeLeaf = jest.fn();
  const refetchData = jest.fn;
  const onChangeFormFields = jest.fn();
  let props: AddCatalogueCategoryDialogProps;
  let user;
  const createView = () => {
    return renderComponentWithBrowserRouter(
      <AddCatalogueCategoryDialog {...props} />
    );
  };
  beforeEach(() => {
    props = {
      open: true,
      onClose: onClose,
      parentId: null,
      onChangeLeaf: onChangeLeaf,
      isLeaf: false,
      refetchData: refetchData,
      onChangeFormFields: onChangeFormFields,
      formFields: null,
    };
    user = userEvent.setup();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  it('renders text correctly', async () => {
    createView();
    expect(screen.getByLabelText('Name *')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('displays warning message when name field is not defined', async () => {
    createView();
    const saveButton = screen.getByRole('button', { name: 'Save' });
    await user.click(saveButton);
    const helperTexts = screen.getByText('Please enter a name.');
    expect(helperTexts).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('displays warning message when name already exists within the parent catalogue category', async () => {
    createView();

    const nameInput = screen.getByLabelText('Name *') as HTMLInputElement;
    user.type(nameInput, 'test_dup');
    await waitFor(() => {
      expect(screen.getByDisplayValue('test_dup')).toBeInTheDocument();
    });
    const saveButton = screen.getByRole('button', { name: 'Save' });
    await user.click(saveButton);

    await waitFor(() => {
      expect(
        screen.getByText(
          'A catalogue category with the same name already exists within the parent catalogue category.'
        )
      ).toBeInTheDocument();
    });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('Adds a new catalogue category at root level ("/catalogue")', async () => {
    createView();

    const nameInput = screen.getByLabelText('Name *');
    user.type(nameInput, 'test');
    await waitFor(() => {
      expect(screen.getByDisplayValue('test')).toBeInTheDocument();
    });
    const saveButton = screen.getByRole('button', { name: 'Save' });
    await user.click(saveButton);

    expect(onClose).toHaveBeenCalled();
  });

  it('Adds a new catalogue category at sub level ("/catalogue/*")', async () => {
    props = {
      ...props,
      parentId: '1',
    };

    createView();

    const nameInput = screen.getByLabelText('Name *');
    user.type(nameInput, 'test');
    await waitFor(() => {
      expect(screen.getByDisplayValue('test')).toBeInTheDocument();
    });
    const saveButton = screen.getByRole('button', { name: 'Save' });
    await user.click(saveButton);

    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when Close button is clicked', async () => {
    createView();
    const closeButton = screen.getByRole('button', { name: 'Cancel' });
    user.click(closeButton);

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('changes directory content type when radio is clicked', async () => {
    createView();

    const itemsRadio = screen.getByLabelText('Catalogue Items');
    await user.click(itemsRadio);

    expect(onChangeLeaf).toHaveBeenCalledWith(true);
  });

  it('create a catalogue category with content being catalogue items', async () => {
    props = {
      ...props,
      isLeaf: true,
      formFields: [
        { name: 'raduis', type: 'number', unit: 'mm', mandatory: true },
      ],
    };
    createView();

    const nameInput = screen.getByLabelText('Name *');
    user.type(nameInput, 'test');
    await waitFor(() => {
      expect(screen.getByDisplayValue('test')).toBeInTheDocument();
    });
    expect(screen.getByText('Catalogue Item Fields')).toBeInTheDocument();

    const saveButton = screen.getByRole('button', { name: 'Save' });

    await user.click(saveButton);

    expect(onClose).toHaveBeenCalled();
  });

  it('displays an error message when the type or name field are not filled', async () => {
    props = {
      ...props,
      isLeaf: true,
      formFields: [
        { name: '', type: 'number', unit: 'mm', mandatory: true },
        { name: 'raduis', type: '', unit: 'mm', mandatory: true },
        { name: '', type: '', unit: 'mm', mandatory: true },
      ],
    };
    createView();

    const nameInput = screen.getByLabelText('Name *');
    user.type(nameInput, 'test');
    await waitFor(() => {
      expect(screen.getByDisplayValue('test')).toBeInTheDocument();
    });
    expect(screen.getByText('Catalogue Item Fields')).toBeInTheDocument();

    const saveButton = screen.getByRole('button', { name: 'Save' });

    await user.click(saveButton);

    const nameHelperTexts = screen.queryAllByText('Select Type is required');
    const typeHelperTexts = screen.queryAllByText('Property Name is required');

    expect(nameHelperTexts.length).toBe(2);
    expect(typeHelperTexts.length).toBe(2);

    expect(onClose).not.toHaveBeenCalled();
  });

  it('clears formFields when catalogue content is catalogue categories', async () => {
    props = {
      ...props,
      isLeaf: true,
      formFields: [
        { name: 'raduis', type: 'number', unit: 'mm', mandatory: true },
      ],
    };
    createView();

    const catagoriesRadio = screen.getByLabelText('Catalogue Categories');

    await user.click(catagoriesRadio);

    expect(onChangeFormFields).toHaveBeenCalledWith(null);
  });
});
