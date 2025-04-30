import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { http } from 'msw';
import { MockInstance } from 'vitest';
import { imsApi } from '../api/api';
import handleIMS_APIError from '../handleIMS_APIError';
import { server } from '../mocks/server';
import {
  getManufacturerById,
  renderComponentWithRouterProvider,
} from '../testUtils';
import ManufacturerDialog, {
  ManufacturerDialogProps,
} from './manufacturerDialog.component';

vi.mock('../handleIMS_APIError');

describe('Add manufacturer dialog', () => {
  const onClose = vi.fn();
  let props: ManufacturerDialogProps;
  let user: UserEvent;
  let axiosPostSpy: MockInstance;
  const createView = () => {
    return renderComponentWithRouterProvider(<ManufacturerDialog {...props} />);
  };

  beforeEach(() => {
    props = {
      open: true,
      onClose: onClose,
      type: 'post',
    };
    user = userEvent.setup();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });
  const modifyManufacturerValues = (values: {
    name?: string;
    url?: string;
    addressLine?: string;
    town?: string;
    county?: string;
    country?: string;
    postcode?: string;
    telephone?: string;
  }) => {
    if (values.name !== undefined)
      fireEvent.change(screen.getByLabelText('Name *'), {
        target: { value: values.name },
      });

    if (values.url !== undefined)
      fireEvent.change(screen.getByLabelText('URL'), {
        target: { value: values.url },
      });

    if (values.addressLine !== undefined)
      fireEvent.change(screen.getByLabelText('Address Line *'), {
        target: { value: values.addressLine },
      });

    if (values.town !== undefined)
      fireEvent.change(screen.getByLabelText('Town'), {
        target: { value: values.town || '' },
      });

    if (values.county !== undefined)
      fireEvent.change(screen.getByLabelText('County'), {
        target: { value: values.county || '' },
      });

    if (values.country !== undefined)
      fireEvent.change(screen.getByLabelText('Country *'), {
        target: { value: values.country },
      });

    if (values.postcode !== undefined)
      fireEvent.change(screen.getByLabelText('Post/Zip code *'), {
        target: { value: values.postcode },
      });

    if (values.telephone !== undefined)
      fireEvent.change(screen.getByLabelText('Telephone number'), {
        target: { value: values.telephone || '' },
      });
  };

  describe('Add manufacturer', () => {
    beforeEach(() => {
      axiosPostSpy = vi.spyOn(imsApi, 'post');
    });

    afterEach(() => {
      vi.clearAllMocks();
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
      createView();

      modifyManufacturerValues({
        name: 'Manufacturer D',
        url: 'http://test.co.uk',
        addressLine: '4 Example Street',
        town: 'Oxford',
        county: 'Oxfordshire',
        postcode: 'OX1 2AB',
        country: 'United Kingdom',
        telephone: '07349612203',
      });

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

    it('disables save button and shows circular progress indicator when request is pending', async () => {
      server.use(
        http.post('/v1/manufacturers', () => {
          return new Promise(() => {});
        })
      );

      createView();

      modifyManufacturerValues({
        name: 'Manufacturer D',
        addressLine: '4 Example Street',
        postcode: 'OX1 2AB',
        country: 'United Kingdom',
      });

      const saveButton = screen.getByRole('button', { name: 'Save' });
      await user.click(saveButton);

      expect(saveButton).toBeDisabled();
      expect(await screen.findByRole('progressbar')).toBeInTheDocument();
    });

    it('calls onClose when Close button is clicked', async () => {
      createView();
      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      await user.click(cancelButton);

      await waitFor(() => {
        expect(onClose).toHaveBeenCalled();
      });
    });

    it('does not close dialog on background click, or on escape key press', async () => {
      createView();

      await userEvent.click(document.body);

      expect(onClose).not.toHaveBeenCalled();

      fireEvent.keyDown(screen.getByRole('dialog'), {
        key: 'Escape',
        code: 'Escape',
        keyCode: 27,
        charCode: 27,
      });

      expect(onClose).not.toHaveBeenCalled();
    });

    it('duplicate manufacturer name displays warning message', async () => {
      createView();
      modifyManufacturerValues({
        name: 'Manufacturer A',
        url: 'http://test.co.uk',
        addressLine: '4 Example Street',
        town: 'Oxford',
        county: 'Oxfordshire',
        postcode: 'OX1 2AB',
        country: 'United Kingdom',
        telephone: '07349612203',
      });

      const saveButton = screen.getByRole('button', { name: 'Save' });
      await user.click(saveButton);

      await waitFor(() => {
        expect(
          screen.getByText(
            'A manufacturer with the same name has been found. Please enter a different name.'
          )
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
      createView();
      modifyManufacturerValues({
        name: 'Manufacturer D',
        url: 'invalid',
        addressLine: '4 Example Street',
        town: 'Oxford',
        county: 'Oxfordshire',
        postcode: 'OX1 2AB',
        country: 'United Kingdom',
        telephone: '07349612203',
      });

      const saveButton = screen.getByRole('button', { name: 'Save' });
      await user.click(saveButton);

      expect(screen.getByText('Please enter a valid URL.')).toBeInTheDocument();
      expect(onClose).not.toHaveBeenCalled();
    });

    it('displays error message when unknown error occurs', async () => {
      createView();
      modifyManufacturerValues({
        name: 'Error 500',
        url: 'https://test.co.uk',
        addressLine: 'test',
        town: 'test',
        county: 'test',
        postcode: 'test',
        country: 'test',
        telephone: '0000000000',
      });
      const saveButton = screen.getByRole('button', { name: 'Save' });

      await user.click(saveButton);

      expect(handleIMS_APIError).toHaveBeenCalled();
    });
  });

  describe('Edit a manufacturer', () => {
    let axiosPatchSpy: MockInstance;
    beforeEach(() => {
      props = {
        ...props,
        selectedManufacturer: getManufacturerById('1'),
        type: 'patch',
      };

      axiosPatchSpy = vi.spyOn(imsApi, 'patch');
    });

    it('disables save button and shows circular progress indicator when request is pending', async () => {
      server.use(
        http.patch('/v1/manufacturers/:id', () => {
          return new Promise(() => {});
        })
      );

      createView();

      modifyManufacturerValues({
        name: 'Manufacturer D',
      });

      const saveButton = screen.getByRole('button', { name: 'Save' });
      await user.click(saveButton);

      expect(saveButton).toBeDisabled();
      expect(await screen.findByRole('progressbar')).toBeInTheDocument();
    });

    it('Edits a manufacturer correctly', async () => {
      createView();
      modifyManufacturerValues({
        name: 'test',
        url: 'https://test.co.uk',
        addressLine: 'test',
        town: 'test',
        county: 'test',
        postcode: 'test',
        country: 'test',
        telephone: '0000000000',
      });

      const saveButton = screen.getByRole('button', { name: 'Save' });

      await user.click(saveButton);

      expect(axiosPatchSpy).toHaveBeenCalledWith('/v1/manufacturers/1', {
        name: 'test',
        url: 'https://test.co.uk',
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
      createView();

      const saveButton = screen.getByRole('button', { name: 'Save' });

      await user.click(saveButton);

      expect(
        screen.getByText(
          "There have been no changes made. Please change a field's value or press Cancel to exit."
        )
      ).toBeInTheDocument();
      expect(onClose).not.toHaveBeenCalled();
      modifyManufacturerValues({
        name: 'test',
      });

      await waitFor(() =>
        expect(
          screen.queryByText(
            "There have been no changes made. Please change a field's value or press Cancel to exit."
          )
        ).not.toBeInTheDocument()
      );
    });

    it('Invalid url displays correct error message', async () => {
      createView();

      modifyManufacturerValues({
        name: 'test',
        url: 'invalid',
        addressLine: 'test',
        town: 'test',
        county: 'test',
        postcode: 'test',
        country: 'test',
        telephone: '0000000000',
      });
      const saveButton = screen.getByRole('button', { name: 'Save' });

      await user.click(saveButton);

      expect(screen.getByText('Please enter a valid URL.')).toBeInTheDocument();
    });

    it('can clear URL without any errors', async () => {
      createView();

      modifyManufacturerValues({
        url: '',
      });

      const saveButton = screen.getByRole('button', { name: 'Save' });

      await user.click(saveButton);

      expect(axiosPatchSpy).toHaveBeenCalledWith('/v1/manufacturers/1', {
        url: null,
      });

      expect(onClose).toHaveBeenCalled();
    });

    it('Duplicate name displays error message', async () => {
      createView();
      modifyManufacturerValues({
        name: 'test_dup',
        url: 'https://test.co.uk',
        addressLine: 'test',
        town: 'test',
        county: 'test',
        postcode: 'test',
        country: 'test',
        telephone: '0000000000',
      });

      const saveButton = screen.getByRole('button', { name: 'Save' });

      await user.click(saveButton);

      expect(
        screen.getByText(
          'A manufacturer with the same name has been found. Please enter a different name.'
        )
      ).toBeInTheDocument();
    });

    it('Required fields show error if they are whitespace or current value just removed', async () => {
      createView();
      modifyManufacturerValues({
        name: '',
        url: 'https://test.co.uk',
        addressLine: '',
        town: '',
        county: '',
        postcode: '',
        country: '',
        telephone: '',
      });
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

    it('CatchAllError request works correctly and displays refresh page message', async () => {
      createView();
      modifyManufacturerValues({
        name: 'Error 500',
        url: 'https://test.co.uk',
        addressLine: 'test',
        town: 'test',
        county: 'test',
        postcode: 'test',
        country: 'test',
        telephone: '0000000000',
      });
      const saveButton = screen.getByRole('button', { name: 'Save' });

      await user.click(saveButton);

      expect(handleIMS_APIError).toHaveBeenCalled();
    });

    it('calls onClose when Close button is clicked', async () => {
      createView();
      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      await user.click(cancelButton);

      await waitFor(() => {
        expect(onClose).toHaveBeenCalled();
      });
    });
  });
});
