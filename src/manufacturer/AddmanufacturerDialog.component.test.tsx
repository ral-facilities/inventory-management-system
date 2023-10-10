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
    expect(screen.getByLabelText('URL')).toBeInTheDocument();
    expect(screen.getByLabelText('Building number *')).toBeInTheDocument();
    expect(screen.getByLabelText('Street name *')).toBeInTheDocument();
    expect(screen.getByLabelText('Town')).toBeInTheDocument();
    expect(screen.getByLabelText('County')).toBeInTheDocument();
    expect(screen.getByLabelText('Post/Zip code *')).toBeInTheDocument();
    expect(screen.getByLabelText('Telephone number')).toBeInTheDocument();
  });

  it('adds manufacturer correctly', async () => {
    createView();
    const nameInput = screen.getByLabelText('Name *') as HTMLInputElement;
    user.type(nameInput, 'Manufacturer D');
    await waitFor(() => {
      expect(screen.getByDisplayValue('Manufacturer D')).toBeInTheDocument();
    });

    const URLInput = screen.getByLabelText('URL') as HTMLInputElement;
    user.type(URLInput, 'http://test.co.uk');
    await waitFor(() => {
      expect(screen.getByDisplayValue('http://test.co.uk')).toBeInTheDocument();
    });

    const buildingNumberInput = screen.getByLabelText(
      'Building number *'
    ) as HTMLInputElement;
    user.type(buildingNumberInput, '1');
    await waitFor(() => {
      expect(screen.getByDisplayValue('1')).toBeInTheDocument();
    });

    const streetNameInput = screen.getByLabelText(
      'Street name *'
    ) as HTMLInputElement;
    user.type(streetNameInput, 'Example Street');
    await waitFor(() => {
      expect(screen.getByDisplayValue('Example Street')).toBeInTheDocument();
    });

    const townInput = screen.getByLabelText('Town') as HTMLInputElement;
    user.type(townInput, 'Oxford');
    await waitFor(() => {
      expect(screen.getByDisplayValue('Oxford')).toBeInTheDocument();
    });

    const countyInput = screen.getByLabelText('County') as HTMLInputElement;
    user.type(countyInput, 'Oxfordshire');
    await waitFor(() => {
      expect(screen.getByDisplayValue('Oxfordshire')).toBeInTheDocument();
    });

    const postCodeInput = screen.getByLabelText(
      'Post/Zip code *'
    ) as HTMLInputElement;
    user.type(postCodeInput, 'OX1 2AB');
    await waitFor(() => {
      expect(screen.getByDisplayValue('OX1 2AB')).toBeInTheDocument();
    });

    const telephoneInput = screen.getByLabelText(
      'Telephone number'
    ) as HTMLInputElement;
    user.type(telephoneInput, '07349612203');
    await waitFor(() => {
      expect(screen.getByDisplayValue('07349612203')).toBeInTheDocument();
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

    const URLInput = screen.getByLabelText('URL') as HTMLInputElement;
    user.type(URLInput, 'http://test.co.uk');
    await waitFor(() => {
      expect(screen.getByDisplayValue('http://test.co.uk')).toBeInTheDocument();
    });

    const buildingNumberInput = screen.getByLabelText(
      'Building number *'
    ) as HTMLInputElement;
    user.type(buildingNumberInput, '1');
    await waitFor(() => {
      expect(screen.getByDisplayValue('1')).toBeInTheDocument();
    });

    const streetNameInput = screen.getByLabelText(
      'Street name *'
    ) as HTMLInputElement;
    user.type(streetNameInput, 'Example Street');
    await waitFor(() => {
      expect(screen.getByDisplayValue('Example Street')).toBeInTheDocument();
    });

    const townInput = screen.getByLabelText('Town') as HTMLInputElement;
    user.type(townInput, 'Oxford');
    await waitFor(() => {
      expect(screen.getByDisplayValue('Oxford')).toBeInTheDocument();
    });

    const countyInput = screen.getByLabelText('County') as HTMLInputElement;
    user.type(countyInput, 'Oxfordshire');
    await waitFor(() => {
      expect(screen.getByDisplayValue('Oxfordshire')).toBeInTheDocument();
    });

    const postCodeInput = screen.getByLabelText(
      'Post/Zip code *'
    ) as HTMLInputElement;
    user.type(postCodeInput, 'OX1 2AB');
    await waitFor(() => {
      expect(screen.getByDisplayValue('OX1 2AB')).toBeInTheDocument();
    });

    const telephoneInput = screen.getByLabelText(
      'Telephone number'
    ) as HTMLInputElement;
    user.type(telephoneInput, '07349612203');
    await waitFor(() => {
      expect(screen.getByDisplayValue('07349612203')).toBeInTheDocument();
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

  it('empty fields that are required display warning', async () => {
    createView();

    const saveButton = screen.getByRole('button', { name: 'Save' });
    await user.click(saveButton);

    expect(screen.getByText('Please enter a name.')).toBeInTheDocument();
    expect(
      screen.getByText('Please enter a building number.')
    ).toBeInTheDocument();
    expect(screen.getByText('Please enter a street name.')).toBeInTheDocument();
    expect(
      screen.getByText('Please enter a post code or zip code.')
    ).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });
});
