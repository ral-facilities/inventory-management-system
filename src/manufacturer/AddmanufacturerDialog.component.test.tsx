import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddManufacturerDialog, {
  AddManufacturerDialogProps,
} from './manufacturerDialog.component';
import { renderComponentWithBrowserRouter } from '../setupTests';

describe('Add manufacturer dialog', () => {
  const onClose = jest.fn();
  const refetchData = jest.fn;
  let props: AddManufacturerDialogProps;
  let user;
  const createView = () => {
    return renderComponentWithBrowserRouter(
      <AddManufacturerDialog {...props} />
    );
  };
  beforeEach(() => {
    props = {
      open: true,
      onClose: onClose,
      refetchData: refetchData,
    };
    user = userEvent.setup();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  it('renders text fields correctly', async () => {
    createView();
    expect(screen.getByLabelText('Name *')).toBeInTheDocument();
    expect(screen.getByLabelText('URL *')).toBeInTheDocument();
    expect(screen.getByLabelText('Address *')).toBeInTheDocument();
  });

  it('adds manufacturer correctly', async () => {
    createView();
    const nameInput = screen.getByLabelText('Name *') as HTMLInputElement;
    user.type(nameInput, 'Manufacturer D');
    await waitFor(() => {
      expect(screen.getByDisplayValue('Manufacturer D')).toBeInTheDocument();
    });

    const URLInput = screen.getByLabelText('URL *') as HTMLInputElement;
    user.type(URLInput, 'http://test.com');
    await waitFor(() => {
      expect(screen.getByDisplayValue('http://test.com')).toBeInTheDocument();
    });

    const addressInput = screen.getByLabelText('Address *') as HTMLInputElement;
    user.type(addressInput, '14 My Street');
    await waitFor(() => {
      expect(screen.getByDisplayValue('14 My Street')).toBeInTheDocument();
    });

    const saveButton = screen.getByRole('button', { name: 'Save' });
    await user.click(saveButton);

    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when Close button is clicked', async () => {
    createView();
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });
  it('duplicate manufacturer name displays warning message', async () => {
    createView();

    const nameInput = screen.getByLabelText('Name *') as HTMLInputElement;
    user.type(nameInput, 'Manufacturer A');
    await waitFor(() => {
      expect(screen.getByDisplayValue('Manufacturer A')).toBeInTheDocument();
    });

    const URLInput = screen.getByLabelText('URL *') as HTMLInputElement;
    user.type(URLInput, 'http://test.com');
    await waitFor(() => {
      expect(screen.getByDisplayValue('http://test.com')).toBeInTheDocument();
    });

    const addressInput = screen.getByLabelText('Address *') as HTMLInputElement;
    user.type(addressInput, '14 My Street');
    await waitFor(() => {
      expect(screen.getByDisplayValue('14 My Street')).toBeInTheDocument();
    });

    const saveButton = screen.getByRole('button', { name: 'Save' });
    await user.click(saveButton);

    await waitFor(() => {
      expect(
        screen.getByText('A manufacturer with the same name already exists.')
      ).toBeInTheDocument();
    });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('empty name field displays warning', async () => {
    createView();

    const saveButton = screen.getByRole('button', { name: 'Save' });
    await user.click(saveButton);

    expect(screen.getByText('Please enter a name.')).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('empty url field displays warning', async () => {
    createView();

    const nameInput = screen.getByLabelText('Name *') as HTMLInputElement;
    user.type(nameInput, 'Manufacturer D');
    await waitFor(() => {
      expect(screen.getByDisplayValue('Manufacturer D')).toBeInTheDocument();
    });

    const saveButton = screen.getByRole('button', { name: 'Save' });
    await user.click(saveButton);

    expect(screen.getByText('Please enter a URL.')).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('empty address field displays warning', async () => {
    createView();

    const nameInput = screen.getByLabelText('Name *') as HTMLInputElement;
    user.type(nameInput, 'Manufacturer D');
    await waitFor(() => {
      expect(screen.getByDisplayValue('Manufacturer D')).toBeInTheDocument();
    });

    const URLInput = screen.getByLabelText('URL *') as HTMLInputElement;
    user.type(URLInput, 'http://test.com');
    await waitFor(() => {
      expect(screen.getByDisplayValue('http://test.com')).toBeInTheDocument();
    });
    const saveButton = screen.getByRole('button', { name: 'Save' });
    await user.click(saveButton);

    expect(screen.getByText('Please enter an address.')).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });
});
