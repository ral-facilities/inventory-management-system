import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddCatalogueCategoryDialog, {
  AddCatalogueCategoryDialogProps,
} from './addCatalogueCategoryDialog.component';
import { renderComponentWithBrowserRouter } from '../setupTests';
describe('Add Catalogue Category Dialog', () => {
  const onClose = jest.fn();
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
      parentId: '',
    };
    user = userEvent;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  it('renders text correctly', async () => {
    createView();
    expect(screen.getByLabelText('Name*')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('displays warning message when name field is not defined', async () => {
    createView();
    const saveButton = screen.getByRole('button', { name: 'Save' });
    await user.click(saveButton);
    const helperTexts = screen.getByText(
      'Please enter a name. Request failed with status code 422'
    );
    expect(helperTexts).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('displays warning message when name already exists within the parent catalogue category', async () => {
    createView();

    const nameInput = screen.getByLabelText('Name*') as HTMLInputElement;
    user.type(nameInput, 'test_dup');
    await waitFor(() => {
      expect(nameInput.value).toBe('test_dup');
    });
    const saveButton = screen.getByRole('button', { name: 'Save' });
    await user.click(saveButton);

    await waitFor(() => {
      expect(
        screen.getByText(
          'A catalogue category with the same name already exists within the parent catalogue category. Request failed with status code 409'
        )
      ).toBeInTheDocument();
    });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('Adds a new catalogue category at root level ("/catalogue")', async () => {
    createView();

    const nameInput = screen.getByLabelText('Name*') as HTMLInputElement;
    user.type(nameInput, 'test');
    await waitFor(() => {
      expect(nameInput.value).toBe('test');
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

    const nameInput = screen.getByLabelText('Name*') as HTMLInputElement;
    user.type(nameInput, 'test');
    await waitFor(() => {
      expect(nameInput.value).toBe('test');
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
});
