import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ManufacturerDialog, {
  ManufacturerDialogProps,
} from './manufacturerDialog.component';
import { renderComponentWithBrowserRouter } from '../setupTests';
import axios from 'axios';

describe('Add manufacturer dialog', () => {
  const onClose = jest.fn();
  const onChangeManufacturerDetails = jest.fn();
  let props: ManufacturerDialogProps;
  let user;
  let axiosPostSpy;
  const createView = () => {
    return renderComponentWithBrowserRouter(<ManufacturerDialog {...props} />);
  };
  beforeEach(() => {
    props = {
      open: true,
      onClose: onClose,
      onChangeManufacturerDetails: onChangeManufacturerDetails,
      manufacturer: {
        name: '',
        url: undefined,
        address: {
          address_line: '',
          town: '',
          county: '',
          postcode: '',
          country: '',
        },
        telephone: '',
      },
      type: 'create',
    };
    user = userEvent.setup();
    axiosPostSpy = jest.spyOn(axios, 'post');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  it('renders text fields correctly', async () => {
    createView();
    expect(screen.getByLabelText('Name *')).toBeInTheDocument();
    expect(screen.getByLabelText('URL')).toBeInTheDocument();
    expect(screen.getByLabelText('Country *')).toBeInTheDocument();
    expect(screen.getByLabelText('Address Line *')).toBeInTheDocument();
    expect(screen.getByLabelText('Town')).toBeInTheDocument();
    expect(screen.getByLabelText('County')).toBeInTheDocument();
    expect(screen.getByLabelText('Post/Zip code *')).toBeInTheDocument();
    expect(screen.getByLabelText('Telephone number')).toBeInTheDocument();
  });

  it('adds manufacturer correctly', async () => {
    props.manufacturer = {
      name: 'Manufacturer D',
      url: 'http://test.co.uk',
      address: {
        address_line: '4 Example Street',
        town: 'Oxford',
        county: 'Oxfordshire',
        postcode: 'OX1 2AB',
        country: 'United Kingdom',
      },
      telephone: '07349612203',
    };
    createView();

    const saveButton = screen.getByRole('button', { name: 'Save' });
    await user.click(saveButton);

    expect(axiosPostSpy).toHaveBeenCalledWith('/v1/manufacturers', {
      name: 'Manufacturer D',
      url: 'http://test.co.uk',
      address: {
        address_line: '4 Example Street',
        town: 'Oxford',
        county: 'Oxfordshire',
        postcode: 'OX1 2AB',
        country: 'United Kingdom',
      },
      telephone: '07349612203',
    });

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
    props.manufacturer = {
      name: 'Manufacturer A',
      url: 'http://test.co.uk',
      address: {
        address_line: '4 Example Street',
        town: 'Oxford',
        county: 'Oxfordshire',
        postcode: 'OX1 2AB',
        country: 'United Kingdom',
      },
      telephone: '07349612203',
    };

    createView();

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
    expect(screen.getByText('Please enter a country.')).toBeInTheDocument();
    expect(screen.getByText('Please enter an address.')).toBeInTheDocument();
    expect(
      screen.getByText('Please enter a post code or zip code.')
    ).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('invalid url displays error', async () => {
    props.manufacturer = {
      name: 'Manufacturer D',
      url: 'invalid',
      address: {
        address_line: '4 Example Street',
        town: 'Oxford',
        county: 'Oxfordshire',
        postcode: 'OX1 2AB',
        country: 'United Kingdom',
      },
      telephone: '07349612203',
    };

    createView();

    const saveButton = screen.getByRole('button', { name: 'Save' });
    await user.click(saveButton);

    expect(screen.getByText('Please enter a valid URL')).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('handles manufacturer name input correctly', async () => {
    const newManufacturerName = 'Test Manufacturer';

    createView();

    const manufacturerNameInput = screen.getByLabelText('Name *');

    fireEvent.change(manufacturerNameInput, {
      target: { value: newManufacturerName },
    });

    expect(onChangeManufacturerDetails).toHaveBeenCalledWith({
      ...props.manufacturer,
      name: newManufacturerName,
    });
  });

  it('handles manufacturer url input correctly', async () => {
    const newManufacturerURL = 'Test';

    createView();

    const manufacturerURLInput = screen.getByLabelText('URL');

    fireEvent.change(manufacturerURLInput, {
      target: { value: newManufacturerURL },
    });

    expect(onChangeManufacturerDetails).toHaveBeenCalledWith({
      ...props.manufacturer,
      url: newManufacturerURL,
    });
  });

  it('handles manufacturer country input correctly', async () => {
    const newManufacturerCountry = 'Test';

    createView();

    const manufacturerCountryInput = screen.getByLabelText('Country *');

    fireEvent.change(manufacturerCountryInput, {
      target: { value: newManufacturerCountry },
    });

    expect(onChangeManufacturerDetails).toHaveBeenCalledWith({
      ...props.manufacturer,
      address: {
        ...props.manufacturer.address,
        country: newManufacturerCountry,
      },
    });
  });

  it('handles manufacturer address line input correctly', async () => {
    const newManufacturerAddressLine = 'Test';

    createView();

    const manufacturerAddressLineInput =
      screen.getByLabelText('Address Line *');

    fireEvent.change(manufacturerAddressLineInput, {
      target: { value: newManufacturerAddressLine },
    });

    expect(onChangeManufacturerDetails).toHaveBeenCalledWith({
      ...props.manufacturer,
      address: {
        ...props.manufacturer.address,
        address_line: newManufacturerAddressLine,
      },
    });
  });

  it('handles manufacturer town input correctly', async () => {
    const newManufacturerTown = 'Test';

    createView();

    const manufacturerTownInput = screen.getByLabelText('Town');

    fireEvent.change(manufacturerTownInput, {
      target: { value: newManufacturerTown },
    });

    expect(onChangeManufacturerDetails).toHaveBeenCalledWith({
      ...props.manufacturer,
      address: { ...props.manufacturer.address, town: newManufacturerTown },
    });
  });

  it('handles manufacturer county input correctly', async () => {
    const newManufacturerCounty = 'Test';

    createView();

    const manufacturerCountyInput = screen.getByLabelText('County');

    fireEvent.change(manufacturerCountyInput, {
      target: { value: newManufacturerCounty },
    });

    expect(onChangeManufacturerDetails).toHaveBeenCalledWith({
      ...props.manufacturer,
      address: {
        ...props.manufacturer.address,
        county: newManufacturerCounty,
      },
    });
  });

  it('handles manufacturer post code input correctly', async () => {
    const newManufacturerpostcode = 'Test';

    createView();

    const manufacturerpostcodeInput = screen.getByLabelText('Post/Zip code *');

    fireEvent.change(manufacturerpostcodeInput, {
      target: { value: newManufacturerpostcode },
    });

    expect(onChangeManufacturerDetails).toHaveBeenCalledWith({
      ...props.manufacturer,
      address: {
        ...props.manufacturer.address,
        postcode: newManufacturerpostcode,
      },
    });
  });

  it('handles manufacturer telephone input correctly', async () => {
    const newManufacturerTelephone = 'Test';

    createView();

    const manufacturerTelephoneInput =
      screen.getByLabelText('Telephone number');

    fireEvent.change(manufacturerTelephoneInput, {
      target: { value: newManufacturerTelephone },
    });

    expect(onChangeManufacturerDetails).toHaveBeenCalledWith({
      ...props.manufacturer,
      telephone: newManufacturerTelephone,
    });
  });

  describe('Edit a manufacturer', () => {
    let axiosPatchSpy;
    beforeEach(() => {
      props = {
        ...props,
        type: 'edit',
      };

      axiosPatchSpy = jest.spyOn(axios, 'patch');
    });

    it('Edits a manufacturer correctly', async () => {
      props = {
        ...props,
        selectedManufacturer: {
          id: '1',
          name: 'Manufacturer A',
          url: 'http://example.com',
          address: {
            address_line: '1 Example Street',
            town: 'Oxford',
            county: 'Oxfordshire',
            postcode: 'OX1 2AB',
            country: 'United Kingdom',
          },
          telephone: '07334893348',
        },
      };

      props.manufacturer = {
        name: 'test',
        address: {
          address_line: 'test',
          town: 'test',
          county: 'test',
          postcode: 'test',
          country: 'test',
        },
        telephone: '0000000000',
      };

      createView();

      const saveButton = screen.getByRole('button', { name: 'Save' });

      await user.click(saveButton);

      expect(axiosPatchSpy).toHaveBeenCalledWith('/v1/manufacturers/1', {
        name: 'test',
        address: {
          address_line: 'test',
          town: 'test',
          county: 'test',
          postcode: 'test',
          country: 'test',
        },
        telephone: '0000000000',
      });

      expect(onClose).toHaveBeenCalled();
    });

    it('No values changed shows correct error message', async () => {
      props = {
        ...props,
        selectedManufacturer: {
          id: '1',
          name: 'Manufacturer A',
          url: 'http://example.com',
          address: {
            address_line: '1 Example Street',
            town: 'Oxford',
            county: 'Oxfordshire',
            postcode: 'OX1 2AB',
            country: 'United Kingdom',
          },
          telephone: '07334893348',
        },
        manufacturer: {
          name: 'Manufacturer A',
          url: 'http://example.com',
          address: {
            address_line: '1 Example Street',
            town: 'Oxford',
            county: 'Oxfordshire',
            postcode: 'OX1 2AB',
            country: 'United Kingdom',
          },
          telephone: '07334893348',
        },
      };

      createView();

      const saveButton = screen.getByRole('button', { name: 'Save' });

      await user.click(saveButton);

      expect(
        screen.getByText(
          "There have been no changes made. Please change a field's value or press Cancel to exit"
        )
      ).toBeInTheDocument();
    });

    it('Invalid url displays correct error message', async () => {
      props = {
        ...props,
        manufacturer: {
          name: 'test',
          url: 'invalid',
          address: {
            address_line: 'test',
            town: 'test',
            county: 'test',
            postcode: 'test',
            country: 'test',
          },
          telephone: '0000000000',
        },
        selectedManufacturer: {
          id: '1',
          name: 'Manufacturer A',
          url: 'http://example.com',
          address: {
            address_line: '1 Example Street',
            town: 'Oxford',
            county: 'Oxfordshire',
            postcode: 'OX1 2AB',
            country: 'United Kingdom',
          },
          telephone: '07334893348',
        },
      };

      createView();

      const saveButton = screen.getByRole('button', { name: 'Save' });

      await user.click(saveButton);

      expect(screen.getByText('Please enter a valid URL')).toBeInTheDocument();
    });

    it('Duplicate name displays error message', async () => {
      props = {
        ...props,
        manufacturer: {
          name: 'test_dup',
          address: {
            address_line: 'test',
            town: 'test',
            county: 'test',
            postcode: 'test',
            country: 'test',
          },
          telephone: '0000000000',
        },
        selectedManufacturer: {
          id: '1',
          name: 'Manufacturer A',
          url: 'http://example.com',
          address: {
            address_line: '1 Example Street',
            town: 'Oxford',
            county: 'Oxfordshire',
            postcode: 'OX1 2AB',
            country: 'United Kingdom',
          },
          telephone: '07334893348',
        },
      };

      createView();

      const saveButton = screen.getByRole('button', { name: 'Save' });

      await user.click(saveButton);

      expect(
        screen.getByText(
          'A manufacturer with the same name has been found. Please enter a different name'
        )
      ).toBeInTheDocument();
    });

    it('Required fields show error if they are whitespace or current value just removed', async () => {
      props = {
        ...props,
        manufacturer: {
          name: '',
          address: {
            address_line: '',
            town: '',
            county: '',
            postcode: '',
            country: '',
          },
          telephone: '',
        },
        selectedManufacturer: {
          id: '1',
          name: 'Manufacturer A',
          url: 'http://example.com',
          address: {
            address_line: '1 Example Street',
            town: 'Oxford',
            county: 'Oxfordshire',
            postcode: 'OX1 2AB',
            country: 'United Kingdom',
          },
          telephone: '07334893348',
        },
      };

      createView();

      const saveButton = screen.getByRole('button', { name: 'Save' });

      await user.click(saveButton);

      expect(screen.getByText('Please enter a name.')).toBeInTheDocument();
      expect(screen.getByText('Please enter a country.')).toBeInTheDocument();
      expect(screen.getByText('Please enter an address.')).toBeInTheDocument();
      expect(
        screen.getByText('Please enter a post code or zip code.')
      ).toBeInTheDocument();
      expect(onClose).not.toHaveBeenCalled();
    });

    it('calls onClose when Close button is clicked', async () => {
      createView();
      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      await user.click(cancelButton);

      await waitFor(() => {
        expect(onClose).toHaveBeenCalled();
      });
    });

    it('handles manufacturer name input correctly', async () => {
      const newManufacturerName = 'Test Manufacturer';

      createView();

      const manufacturerNameInput = screen.getByLabelText('Name');

      fireEvent.change(manufacturerNameInput, {
        target: { value: newManufacturerName },
      });

      expect(onChangeManufacturerDetails).toHaveBeenCalledWith({
        ...props.manufacturer,
        name: newManufacturerName,
      });
    });

    it('handles manufacturer url input correctly', async () => {
      const newManufacturerURL = 'Test';

      createView();

      const manufacturerURLInput = screen.getByLabelText('URL');

      fireEvent.change(manufacturerURLInput, {
        target: { value: newManufacturerURL },
      });

      expect(onChangeManufacturerDetails).toHaveBeenCalledWith({
        ...props.manufacturer,
        url: newManufacturerURL,
      });
    });

    it('handles manufacturer country input correctly', async () => {
      const newManufacturerCountry = 'Test';

      createView();

      const manufacturerCountryInput = screen.getByLabelText('Country');

      fireEvent.change(manufacturerCountryInput, {
        target: { value: newManufacturerCountry },
      });

      expect(onChangeManufacturerDetails).toHaveBeenCalledWith({
        ...props.manufacturer,
        address: {
          ...props.manufacturer.address,
          country: newManufacturerCountry,
        },
      });
    });

    it('handles manufacturer address line input correctly', async () => {
      const newManufacturerAddressLine = 'Test';

      createView();

      const manufacturerStreetNameInput = screen.getByLabelText('Address Line');

      fireEvent.change(manufacturerStreetNameInput, {
        target: { value: newManufacturerAddressLine },
      });

      expect(onChangeManufacturerDetails).toHaveBeenCalledWith({
        ...props.manufacturer,
        address: {
          ...props.manufacturer.address,
          address_line: newManufacturerAddressLine,
        },
      });
    });

    it('handles manufacturer town input correctly', async () => {
      const newManufacturerTown = 'Test';

      createView();

      const manufacturerTownInput = screen.getByLabelText('Town');

      fireEvent.change(manufacturerTownInput, {
        target: { value: newManufacturerTown },
      });

      expect(onChangeManufacturerDetails).toHaveBeenCalledWith({
        ...props.manufacturer,
        address: { ...props.manufacturer.address, town: newManufacturerTown },
      });
    });

    it('handles manufacturer county input correctly', async () => {
      const newManufacturerCounty = 'Test';

      createView();

      const manufacturerCountyInput = screen.getByLabelText('County');

      fireEvent.change(manufacturerCountyInput, {
        target: { value: newManufacturerCounty },
      });

      expect(onChangeManufacturerDetails).toHaveBeenCalledWith({
        ...props.manufacturer,
        address: {
          ...props.manufacturer.address,
          county: newManufacturerCounty,
        },
      });
    });

    it('handles manufacturer post code input correctly', async () => {
      const newManufacturerpostcode = 'Test';

      createView();

      const manufacturerpostcodeInput = screen.getByLabelText('Post/Zip code');

      fireEvent.change(manufacturerpostcodeInput, {
        target: { value: newManufacturerpostcode },
      });

      expect(onChangeManufacturerDetails).toHaveBeenCalledWith({
        ...props.manufacturer,
        address: {
          ...props.manufacturer.address,
          postcode: newManufacturerpostcode,
        },
      });
    });

    it('handles manufacturer telephone input correctly', async () => {
      const newManufacturerTelephone = 'Test';

      createView();

      const manufacturerTelephoneInput =
        screen.getByLabelText('Telephone number');

      fireEvent.change(manufacturerTelephoneInput, {
        target: { value: newManufacturerTelephone },
      });

      expect(onChangeManufacturerDetails).toHaveBeenCalledWith({
        ...props.manufacturer,
        telephone: newManufacturerTelephone,
      });
    });
  });
});
