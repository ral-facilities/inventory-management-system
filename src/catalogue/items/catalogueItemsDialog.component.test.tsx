import React from 'react';
import axios from 'axios';
import {
  renderComponentWithBrowserRouter,
  getCatalogueItemsPropertiesById,
} from '../../setupTests';
import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CatalogueItemsDialog, {
  CatalogueItemsDialogProps,
} from './catalogueItemsDialog.component';
import { convertProperties } from '../catalogue.component';

describe('Catalogue Items Dialog', () => {
  let props: CatalogueItemsDialogProps;
  let user;
  let axiosPostSpy;
  const onClose = jest.fn();
  const onChangeCatalogueItemDetails = jest.fn();
  const onChangeCatalogueItemManufacturer = jest.fn();
  const onChangeCatalogueItemProperties = jest.fn();

  const createView = () => {
    return renderComponentWithBrowserRouter(
      <CatalogueItemsDialog {...props} />
    );
  };

  beforeEach(() => {
    props = {
      open: true,
      onClose: onClose,
      parentId: null,
      catalogueItemDetails: { name: undefined, description: '' },
      onChangeCatalogueItemDetails: onChangeCatalogueItemDetails,
      catalogueItemManufacturer: {
        name: '',
        web_url: '',
        address: '',
      },
      onChangeCatalogueItemManufacturer: onChangeCatalogueItemManufacturer,
      catalogueItemPropertiesForm: [],
      catalogueItemProperties: [],
      onChangeCatalogueItemProperties: onChangeCatalogueItemProperties,
      type: 'create',
    };

    user = userEvent.setup();
    axiosPostSpy = jest.spyOn(axios, 'post');
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders text correctly', async () => {
    props.catalogueItemPropertiesForm = getCatalogueItemsPropertiesById('4');
    props.catalogueItemProperties = convertProperties(
      getCatalogueItemsPropertiesById('4')
    );
    let baseElement;
    await act(async () => {
      baseElement = createView().baseElement;
    });
    expect(baseElement).toMatchSnapshot();
  });

  it('adds a catalogue item', async () => {
    props = {
      ...props,
      parentId: '1',
      catalogueItemDetails: { name: 'test', description: '' },
      catalogueItemPropertiesForm: getCatalogueItemsPropertiesById('4'),
      catalogueItemProperties: [
        {
          name: 'Resolution',
          value: 12,
        },
        {
          name: 'Frame Rate',
          value: 60,
        },
        {
          name: 'Sensor Type',
          value: 'IO',
        },
        {
          name: 'Sensor brand',
          value: 'pixel',
        },
        {
          name: 'Broken',
          value: true,
        },
        {
          name: 'Older than five years',
          value: false,
        },
      ],
      catalogueItemManufacturer: {
        name: 'Sony',
        web_url: 'https://sony.com',
        address: '1 venus street UY6 9OP',
      },
    };

    createView();

    const saveButton = screen.getByRole('button', { name: 'Save' });

    await user.click(saveButton);

    expect(axiosPostSpy).toHaveBeenCalledWith('/v1/catalogue-items/', {
      catalogue_category_id: '1',
      description: '',
      name: 'test',
      manufacturer: {
        name: 'Sony',
        web_url: 'https://sony.com',
        address: '1 venus street UY6 9OP',
      },
      properties: [
        { name: 'Resolution', value: 12 },
        { name: 'Frame Rate', value: 60 },
        { name: 'Sensor Type', value: 'IO' },
        { name: 'Sensor brand', value: 'pixel' },
        { name: 'Broken', value: true },
        { name: 'Older than five years', value: false },
      ],
    });
  });

  it('adds a catalogue item (just mandatory fields)', async () => {
    props = {
      ...props,
      parentId: '1',
      catalogueItemDetails: { name: 'test', description: '' },
      catalogueItemPropertiesForm: getCatalogueItemsPropertiesById('4'),
      catalogueItemProperties: [
        {
          name: 'Resolution',
          value: 12,
        },
        {
          name: 'Frame Rate',
          value: null,
        },
        {
          name: 'Sensor Type',
          value: 'IO',
        },
        {
          name: 'Sensor brand',
          value: null,
        },
        {
          name: 'Broken',
          value: true,
        },
        {
          name: 'Older than five years',
          value: '',
        },
      ],
      catalogueItemManufacturer: {
        name: 'Sony',
        web_url: 'https://sony.com',
        address: '1 venus street UY6 9OP',
      },
    };

    createView();

    const saveButton = screen.getByRole('button', { name: 'Save' });

    await user.click(saveButton);

    expect(axiosPostSpy).toHaveBeenCalledWith('/v1/catalogue-items/', {
      catalogue_category_id: '1',
      description: '',
      name: 'test',
      manufacturer: {
        name: 'Sony',
        web_url: 'https://sony.com',
        address: '1 venus street UY6 9OP',
      },
      properties: [
        { name: 'Resolution', value: 12 },
        { name: 'Sensor Type', value: 'IO' },
        { name: 'Broken', value: true },
      ],
    });
  });

  it('display error message when mandatory field is not filled in', async () => {
    props = {
      ...props,
      parentId: '1',
      catalogueItemDetails: { name: '', description: '' },
      catalogueItemPropertiesForm: getCatalogueItemsPropertiesById('4'),
      catalogueItemProperties: [
        {
          name: 'Resolution',
          value: null,
        },
        {
          name: 'Frame Rate',
          value: null,
        },
        {
          name: 'Sensor Type',
          value: null,
        },
        {
          name: 'Sensor brand',
          value: null,
        },
        {
          name: 'Broken',
          value: '',
        },
        {
          name: 'Older than five years',
          value: '',
        },
      ],
    };

    createView();

    const saveButton = screen.getByRole('button', { name: 'Save' });

    await user.click(saveButton);

    const mandatoryFieldHelperText = screen.getAllByText(
      'This field is mandatory'
    );

    const mandatoryFieldBooleanHelperText = screen.getByText(
      'Please select either True or False'
    );

    const nameHelperText = screen.getByText('Please enter name');

    expect(mandatoryFieldBooleanHelperText).toBeInTheDocument();
    expect(nameHelperText).toBeInTheDocument();
    expect(mandatoryFieldHelperText.length).toBe(2);
    expect(mandatoryFieldHelperText[0]).toHaveTextContent(
      'This field is mandatory'
    );

    expect(
      screen.getByText('Please enter a Manufacturer Name')
    ).toBeInTheDocument();

    expect(
      screen.getByText('Please enter a Manufacturer URL')
    ).toBeInTheDocument();

    expect(
      screen.getByText('Please enter a Manufacturer Address')
    ).toBeInTheDocument();
  });
  it('display error message when invalid number format', async () => {
    props = {
      ...props,
      parentId: '1',
      catalogueItemDetails: { name: '', description: '' },
      catalogueItemPropertiesForm: getCatalogueItemsPropertiesById('4'),
      catalogueItemProperties: [
        {
          name: 'Resolution',
          value: 'rsdf',
        },
        {
          name: 'Frame Rate',
          value: 'fsdf',
        },
        {
          name: 'Sensor Type',
          value: 'pixel',
        },
        {
          name: 'Sensor brand',
          value: null,
        },
        {
          name: 'Broken',
          value: false,
        },
        {
          name: 'Older than five years',
          value: '',
        },
      ],
      catalogueItemManufacturer: {
        name: 'Sony',
        web_url: 'sony.com',
        address: '1 venus street UY6 9OP',
      },
    };

    createView();

    const saveButton = screen.getByRole('button', { name: 'Save' });

    await user.click(saveButton);

    const validNumberHelperText = screen.getAllByText(
      'Please enter a valid number'
    );

    expect(validNumberHelperText.length).toBe(2);
    expect(validNumberHelperText[0]).toHaveTextContent(
      'Please enter a valid number'
    );

    expect(
      screen.getByText(
        'Please enter a valid Manufacturer URL. Only "http://" and "https://" links are accepted'
      )
    ).toBeInTheDocument();
  });

  it('displays warning message when an unknown error occurs', async () => {
    props = {
      ...props,
      parentId: '1',
      catalogueItemDetails: { name: 'Error 500', description: '' },
      catalogueItemPropertiesForm: getCatalogueItemsPropertiesById('4'),
      catalogueItemProperties: [
        {
          name: 'Resolution',
          value: 12,
        },
        {
          name: 'Frame Rate',
          value: 60,
        },
        {
          name: 'Sensor Type',
          value: 'IO',
        },
        {
          name: 'Sensor brand',
          value: 'pixel',
        },
        {
          name: 'Broken',
          value: true,
        },
        {
          name: 'Older than five years',
          value: false,
        },
      ],
      catalogueItemManufacturer: {
        name: 'Sony',
        web_url: 'https://sony.com',
        address: '1 venus street UY6 9OP',
      },
    };
    createView();

    const saveButton = screen.getByRole('button', { name: 'Save' });
    await user.click(saveButton);

    await waitFor(() => {
      expect(
        screen.getByText('Please refresh and try again')
      ).toBeInTheDocument();
    });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('initialize  catalogueItemProperties list object if not defined', async () => {
    props = {
      ...props,
      parentId: '1',
      catalogueItemDetails: { name: 'test', description: '' },
      catalogueItemPropertiesForm: getCatalogueItemsPropertiesById('4'),
      catalogueItemProperties: [],
    };

    createView();

    const propertyInput = screen.getByLabelText('Resolution (megapixels) *');

    await user.clear(propertyInput);
    await user.type(propertyInput, '12');

    expect(onChangeCatalogueItemProperties).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'Resolution',
          value: 12, // Expecting a parsed number
        }),
      ])
    );
  });
  describe('Edit a catalogue item', () => {
    let axiosPatchSpy;
    beforeEach(() => {
      props = {
        ...props,
        type: 'edit',
      };

      axiosPatchSpy = jest.spyOn(axios, 'patch');
    });

    it('Edit a catalogue item (catalogue detail)', async () => {
      props = {
        ...props,
        parentId: '1',
        catalogueItemDetails: { name: 'test', description: '' },
        selectedCatalogueItem: {
          catalogue_category_id: '4',
          name: 'Cameras 4',
          description: 'High-resolution cameras for beam characterization. 4',
          properties: [
            { name: 'Resolution', value: 24, unit: 'megapixels' },
            { name: 'Frame Rate', value: 240, unit: 'fps' },
            { name: 'Sensor Type', value: 'CCD', unit: '' },
            { name: 'Sensor brand', value: 'Nikon', unit: '' },
            { name: 'Broken', value: false, unit: '' },
            { name: 'Older than five years', value: true, unit: '' },
          ],
          id: '90',
          manufacturer: {
            name: 'Manufacturer A',
            web_url: 'http://example.com',
            address: '10 My Street',
          },
        },
        catalogueItemPropertiesForm: getCatalogueItemsPropertiesById('4'),
        catalogueItemProperties: [
          {
            name: 'Resolution',
            value: 24,
          },
          {
            name: 'Frame Rate',
            value: 240,
          },
          {
            name: 'Sensor Type',
            value: 'CCD',
          },
          {
            name: 'Sensor brand',
            value: 'Nikon',
          },
          {
            name: 'Broken',
            value: false,
          },
          {
            name: 'Older than five years',
            value: true,
          },
        ],
        catalogueItemManufacturer: {
          name: 'Manufacturer A',
          web_url: 'http://example.com',
          address: '10 My Street',
        },
      };

      createView();

      const saveButton = screen.getByRole('button', { name: 'Save' });

      await user.click(saveButton);

      expect(axiosPatchSpy).toHaveBeenCalledWith('/v1/catalogue-items/90', {
        description: '',
        name: 'test',
      });

      expect(onClose).toHaveBeenCalled();
    });

    it('display error message when invalid number format', async () => {
      props = {
        ...props,
        parentId: '4',
        catalogueItemDetails: { name: 'test', description: '' },
        catalogueItemPropertiesForm: getCatalogueItemsPropertiesById('4'),
        selectedCatalogueItem: {
          catalogue_category_id: '4',
          name: 'Cameras 4',
          description: 'High-resolution cameras for beam characterization. 4',
          properties: [
            { name: 'Resolution', value: 24, unit: 'megapixels' },
            { name: 'Frame Rate', value: 240, unit: 'fps' },
            { name: 'Sensor Type', value: 'CCD', unit: '' },
            { name: 'Sensor brand', value: 'Nikon', unit: '' },
            { name: 'Broken', value: false, unit: '' },
            { name: 'Older than five years', value: true, unit: '' },
          ],
          id: '90',
          manufacturer: {
            name: 'Manufacturer A',
            web_url: 'http://example.com',
            address: '10 My Street',
          },
        },
        catalogueItemProperties: [
          {
            name: 'Resolution',
            value: '12',
          },
          {
            name: 'Frame Rate',
            value: '21',
          },
          {
            name: 'Sensor Type',
            value: 'pixel',
          },
          {
            name: 'Sensor brand',
            value: null,
          },
          {
            name: 'Broken',
            value: false,
          },
          {
            name: 'Older than five years',
            value: '',
          },
        ],
        catalogueItemManufacturer: {
          name: 'Manufacturer A',
          web_url: 'example.com',
          address: '10 My Street',
        },
      };

      createView();

      await user.type(screen.getByLabelText('Resolution (megapixels) *'), 'a');
      await user.type(screen.getByLabelText('Frame Rate (fps)'), 'a');

      await waitFor(() => {
        expect(screen.getByLabelText('Frame Rate (fps)')).toHaveValue('21a');
      });

      const saveButton = screen.getByRole('button', { name: 'Save' });

      await user.click(saveButton);

      const validNumberHelperText = screen.getAllByText(
        'Please enter a valid number'
      );

      expect(validNumberHelperText.length).toBe(2);
      expect(validNumberHelperText[0]).toHaveTextContent(
        'Please enter a valid number'
      );

      expect(
        screen.getByText(
          'Please enter a valid Manufacturer URL. Only "http://" and "https://" links are accepted'
        )
      ).toBeInTheDocument();
    });

    it('display error message when mandatory field is not filled in', async () => {
      props = {
        ...props,
        parentId: '4',
        catalogueItemDetails: {
          name: '',
          description: 'High-resolution cameras for beam characterization. 4',
        },
        selectedCatalogueItem: {
          catalogue_category_id: '4',
          name: 'Cameras 4',
          description: 'High-resolution cameras for beam characterization. 4',
          properties: [
            { name: 'Resolution', value: 24, unit: 'megapixels' },
            { name: 'Frame Rate', value: 240, unit: 'fps' },
            { name: 'Sensor Type', value: 'CCD', unit: '' },
            { name: 'Sensor brand', value: 'Nikon', unit: '' },
            { name: 'Broken', value: false, unit: '' },
            { name: 'Older than five years', value: true, unit: '' },
          ],
          id: '90',
          manufacturer: {
            name: 'Manufacturer A',
            web_url: 'http://example.com',
            address: '10 My Street',
          },
        },
        catalogueItemPropertiesForm: getCatalogueItemsPropertiesById('4'),
        catalogueItemProperties: [
          {
            name: 'Resolution',
            value: 24,
          },
          {
            name: 'Frame Rate',
            value: 240,
          },
          {
            name: 'Sensor Type',
            value: 'CCD',
          },
          {
            name: 'Sensor brand',
            value: 'Nikon',
          },
          {
            name: 'Broken',
            value: true,
          },
          {
            name: 'Older than five years',
            value: true,
          },
        ],
        catalogueItemManufacturer: {
          name: '',
          web_url: '',
          address: '',
        },
      };

      createView();

      await user.clear(screen.getByLabelText('Resolution (megapixels) *'));
      await user.click(screen.getByLabelText('Broken *'));
      await user.click(screen.getByText('None'));
      await user.clear(screen.getByLabelText('Sensor Type *'));

      await waitFor(() => {
        expect(screen.getByLabelText('Sensor Type *')).toHaveValue('');
      });

      const saveButton = screen.getByRole('button', { name: 'Save' });

      await user.click(saveButton);

      const mandatoryFieldHelperText = screen.getAllByText(
        'This field is mandatory'
      );

      const mandatoryFieldBooleanHelperText = screen.getByText(
        'Please select either True or False'
      );

      const nameHelperText = screen.getByText('Please enter name');

      expect(mandatoryFieldBooleanHelperText).toBeInTheDocument();
      expect(nameHelperText).toBeInTheDocument();
      expect(mandatoryFieldHelperText.length).toBe(2);
      expect(mandatoryFieldHelperText[0]).toHaveTextContent(
        'This field is mandatory'
      );

      expect(
        screen.getByText('Please enter a Manufacturer Name')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Please enter a Manufacturer URL')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Please enter a Manufacturer Address')
      ).toBeInTheDocument();
    });

    it('Edit a catalogue item (catalogue properties)', async () => {
      props = {
        ...props,
        parentId: '1',
        catalogueItemDetails: {
          name: 'Cameras 4',
          description: 'High-resolution cameras for beam characterization. 4',
        },
        selectedCatalogueItem: {
          catalogue_category_id: '4',
          name: 'Cameras 4',
          description: 'High-resolution cameras for beam characterization. 4',
          properties: [
            { name: 'Resolution', value: 24, unit: 'megapixels' },
            { name: 'Frame Rate', value: 240, unit: 'fps' },
            { name: 'Sensor Type', value: 'CCD', unit: '' },
            { name: 'Sensor brand', value: 'Nikon', unit: '' },
            { name: 'Broken', value: false, unit: '' },
            { name: 'Older than five years', value: true, unit: '' },
          ],
          id: '90',
          manufacturer: {
            name: 'Manufacturer A',
            web_url: 'http://example.com',
            address: '10 My Street',
          },
        },
        catalogueItemPropertiesForm: getCatalogueItemsPropertiesById('4'),
        catalogueItemProperties: [
          {
            name: 'Resolution',
            value: 24,
          },
          {
            name: 'Frame Rate',
            value: 240,
          },
          {
            name: 'Sensor Type',
            value: 'CCD',
          },
          {
            name: 'Sensor brand',
            value: 'Nikon',
          },
          {
            name: 'Broken',
            value: true,
          },
          {
            name: 'Older than five years',
            value: true,
          },
        ],
        catalogueItemManufacturer: {
          name: 'Manufacturer A',
          web_url: 'http://example.com',
          address: '10 My Street',
        },
      };

      createView();

      const saveButton = screen.getByRole('button', { name: 'Save' });

      await user.click(saveButton);
      expect(axiosPatchSpy).toHaveBeenCalledWith('/v1/catalogue-items/90', {
        properties: [
          { name: 'Resolution', value: 24 },
          { name: 'Frame Rate', value: 240 },
          { name: 'Sensor Type', value: 'CCD' },
          { name: 'Sensor brand', value: 'Nikon' },
          { name: 'Broken', value: true },
          { name: 'Older than five years', value: true },
        ],
      });

      expect(onClose).toHaveBeenCalled();
    });

    it('Edit a catalogue item (manufacturer)', async () => {
      props = {
        ...props,
        parentId: '1',
        catalogueItemDetails: {
          name: 'Cameras 4',
          description: 'High-resolution cameras for beam characterization. 4',
        },
        selectedCatalogueItem: {
          catalogue_category_id: '4',
          name: 'Cameras 4',
          description: 'High-resolution cameras for beam characterization. 4',
          properties: [
            { name: 'Resolution', value: 24, unit: 'megapixels' },
            { name: 'Frame Rate', value: 240, unit: 'fps' },
            { name: 'Sensor Type', value: 'CCD', unit: '' },
            { name: 'Sensor brand', value: 'Nikon', unit: '' },
            { name: 'Broken', value: false, unit: '' },
            { name: 'Older than five years', value: true, unit: '' },
          ],
          id: '90',
          manufacturer: {
            name: 'Manufacturer A',
            web_url: 'http://example.com',
            address: '10 My Street',
          },
        },
        catalogueItemPropertiesForm: getCatalogueItemsPropertiesById('4'),
        catalogueItemProperties: [
          {
            name: 'Resolution',
            value: 24,
          },
          {
            name: 'Frame Rate',
            value: 240,
          },
          {
            name: 'Sensor Type',
            value: 'CCD',
          },
          {
            name: 'Sensor brand',
            value: 'Nikon',
          },
          {
            name: 'Broken',
            value: false,
          },
          {
            name: 'Older than five years',
            value: true,
          },
        ],
        catalogueItemManufacturer: {
          name: 'Sony1',
          web_url: 'https://sony.com',
          address: '12 venus street UY6 9OP',
        },
      };

      createView();

      const saveButton = screen.getByRole('button', { name: 'Save' });

      await user.click(saveButton);
      expect(axiosPatchSpy).toHaveBeenCalledWith('/v1/catalogue-items/90', {
        manufacturer: {
          name: 'Sony1',
          web_url: 'https://sony.com',
          address: '12 venus street UY6 9OP',
        },
      });

      expect(onClose).toHaveBeenCalled();
    });

    it('displays error message if no values have been changed', async () => {
      props = {
        ...props,
        parentId: '1',
        catalogueItemDetails: {
          name: 'Cameras 4',
          description: 'High-resolution cameras for beam characterization. 4',
        },
        selectedCatalogueItem: {
          catalogue_category_id: '4',
          name: 'Cameras 4',
          description: 'High-resolution cameras for beam characterization. 4',
          properties: [
            { name: 'Resolution', value: 24, unit: 'megapixels' },
            { name: 'Frame Rate', value: 240, unit: 'fps' },
            { name: 'Sensor Type', value: 'CCD', unit: '' },
            { name: 'Sensor brand', value: 'Nikon', unit: '' },
            { name: 'Broken', value: false, unit: '' },
            { name: 'Older than five years', value: true, unit: '' },
          ],
          id: '90',
          manufacturer: {
            name: 'Manufacturer A',
            web_url: 'http://example.com',
            address: '10 My Street',
          },
        },
        catalogueItemPropertiesForm: getCatalogueItemsPropertiesById('4'),
        catalogueItemProperties: [
          {
            name: 'Resolution',
            value: 24,
          },
          {
            name: 'Frame Rate',
            value: 240,
          },
          {
            name: 'Sensor Type',
            value: 'CCD',
          },
          {
            name: 'Sensor brand',
            value: 'Nikon',
          },
          {
            name: 'Broken',
            value: false,
          },
          {
            name: 'Older than five years',
            value: true,
          },
        ],
        catalogueItemManufacturer: {
          name: 'Manufacturer A',
          web_url: 'http://example.com',
          address: '10 My Street',
        },
      };

      createView();

      const saveButton = screen.getByRole('button', { name: 'Save' });

      await user.click(saveButton);
      expect(axiosPatchSpy).not.toHaveBeenCalled();

      await waitFor(() => {
        expect(
          screen.getByText('Please edit a form entry before clicking save')
        ).toBeInTheDocument();
      });

      expect(onClose).not.toHaveBeenCalled();
    });

    it('fills in all fields with the current values', async () => {
      props = {
        ...props,
        parentId: '4',
        catalogueItemDetails: {
          name: 'Cameras 1',
          description: 'High-resolution cameras for beam characterization. 1',
        },
        catalogueItemPropertiesForm: getCatalogueItemsPropertiesById('4'),
        catalogueItemProperties: [
          {
            name: 'Resolution',
            value: 12,
          },
          {
            name: 'Frame Rate',
            value: 30,
          },
          {
            name: 'Sensor Type',
            value: 'CMOS',
          },
          {
            name: 'Broken',
            value: true,
          },
          {
            name: 'Older than five years',
            value: false,
          },
        ],
      };

      createView();
      expect(screen.getByLabelText('Name *')).toHaveValue('Cameras 1');
      expect(screen.getByLabelText('Description')).toHaveValue(
        'High-resolution cameras for beam characterization. 1'
      );
      await waitFor(() => {
        expect(
          screen.getByLabelText('Resolution (megapixels) *')
        ).toBeInTheDocument();
      });
      expect(screen.getByLabelText('Resolution (megapixels) *')).toHaveValue(
        '12'
      );
      expect(screen.getByLabelText('Frame Rate (fps)')).toHaveValue('30');
      expect(screen.getByLabelText('Sensor Type *')).toHaveValue('CMOS');
      expect(screen.getByLabelText('Sensor brand')).toHaveValue('');

      expect(screen.getByLabelText('Broken *')).toHaveTextContent('True');

      expect(screen.getByLabelText('Older than five years')).toHaveTextContent(
        'False'
      );
    });

    it('displays error message if no form fields have been changed', async () => {
      props = {
        ...props,
        parentId: '1',
        catalogueItemDetails: { name: 'test', description: '' },
        catalogueItemPropertiesForm: getCatalogueItemsPropertiesById('4'),
        catalogueItemProperties: [
          {
            name: 'Resolution',
            value: 12,
          },
          {
            name: 'Frame Rate',
            value: 60,
          },
          {
            name: 'Sensor Type',
            value: 'IO',
          },
          {
            name: 'Sensor brand',
            value: 'pixel',
          },
          {
            name: 'Broken',
            value: true,
          },
          {
            name: 'Older than five years',
            value: false,
          },
        ],
      };

      createView();

      const saveButton = screen.getByRole('button', { name: 'Save' });

      await user.click(saveButton);

      await waitFor(() => {
        expect(
          screen.queryByText('Please edit a form entry before clicking save')
        ).not.toBeInTheDocument();
      });
    });

    it('displays error message if catalogue item has children elements', async () => {
      props = {
        ...props,
        parentId: '1',
        catalogueItemDetails: {
          name: 'test_has_children_elements',
          description: '',
        },
        selectedCatalogueItem: {
          catalogue_category_id: '4',
          name: 'Cameras 4',
          description: 'High-resolution cameras for beam characterization. 4',
          properties: [
            { name: 'Resolution', value: 24, unit: 'megapixels' },
            { name: 'Frame Rate', value: 240, unit: 'fps' },
            { name: 'Sensor Type', value: 'CCD', unit: '' },
            { name: 'Sensor brand', value: 'Nikon', unit: '' },
            { name: 'Broken', value: false, unit: '' },
            { name: 'Older than five years', value: true, unit: '' },
          ],
          id: '90',
          manufacturer: {
            name: 'Manufacturer A',
            web_url: 'http://example.com',
            address: '10 My Street',
          },
        },
        catalogueItemPropertiesForm: getCatalogueItemsPropertiesById('4'),
        catalogueItemProperties: [
          {
            name: 'Resolution',
            value: 24,
          },
          {
            name: 'Frame Rate',
            value: 240,
          },
          {
            name: 'Sensor Type',
            value: 'CCD',
          },
          {
            name: 'Sensor brand',
            value: 'NIkon',
          },
          {
            name: 'Broken',
            value: false,
          },
          {
            name: 'Older than five years',
            value: true,
          },
        ],
        catalogueItemManufacturer: {
          name: 'Manufacturer A',
          web_url: 'http://example.com',
          address: '10 My Street',
        },
      };

      createView();

      const saveButton = screen.getByRole('button', { name: 'Save' });

      await user.click(saveButton);
      expect(axiosPatchSpy).toHaveBeenCalledWith('/v1/catalogue-items/90', {
        description: '',
        name: 'test_has_children_elements',
        properties: [
          { name: 'Resolution', value: 24 },
          { name: 'Frame Rate', value: 240 },
          { name: 'Sensor Type', value: 'CCD' },
          { name: 'Sensor brand', value: 'NIkon' },
          { name: 'Broken', value: false },
          { name: 'Older than five years', value: true },
        ],
      });

      await waitFor(() => {
        expect(
          screen.getByText(
            'Catalogue item has children elements and cannot be edited, please delete the children elements first'
          )
        ).toBeInTheDocument();
      });
    });

    it('displays warning message when an unknown error occurs', async () => {
      props = {
        ...props,
        parentId: '1',
        catalogueItemDetails: { name: 'Error 500', description: '' },
        catalogueItemPropertiesForm: getCatalogueItemsPropertiesById('4'),
        selectedCatalogueItem: {
          catalogue_category_id: '4',
          name: 'Cameras 4',
          description: 'High-resolution cameras for beam characterization. 4',
          properties: [
            { name: 'Resolution', value: 24, unit: 'megapixels' },
            { name: 'Frame Rate', value: 240, unit: 'fps' },
            { name: 'Sensor Type', value: 'CCD', unit: '' },
            { name: 'Sensor brand', value: 'Nikon', unit: '' },
            { name: 'Broken', value: false, unit: '' },
            { name: 'Older than five years', value: true, unit: '' },
          ],
          id: '90',
          manufacturer: {
            name: 'Manufacturer A',
            web_url: 'http://example.com',
            address: '10 My Street',
          },
        },
        catalogueItemProperties: [
          {
            name: 'Resolution',
            value: 12,
          },
          {
            name: 'Frame Rate',
            value: 60,
          },
          {
            name: 'Sensor Type',
            value: 'IO',
          },
          {
            name: 'Sensor brand',
            value: 'pixel',
          },
          {
            name: 'Broken',
            value: true,
          },
          {
            name: 'Older than five years',
            value: false,
          },
        ],
        catalogueItemManufacturer: {
          name: 'Manufacturer A',
          web_url: 'http://example.com',
          address: '10 My Street',
        },
      };
      createView();

      const saveButton = screen.getByRole('button', { name: 'Save' });
      await user.click(saveButton);

      await waitFor(() => {
        expect(
          screen.getByText('Please refresh and try again')
        ).toBeInTheDocument();
      });
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('Catalogue Items Details', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
    it('handles name input correctly', async () => {
      const newName = 'Test Catalogue Item';

      createView();

      const nameInput = screen.getByLabelText('Name *');
      await user.type(nameInput, newName);

      expect(onChangeCatalogueItemDetails).toHaveBeenCalledWith({
        ...props.catalogueItemDetails,
        name: newName,
      });
    });

    it('handles description input correctly', async () => {
      const newDescription = 'This is a test description';

      createView();

      const descriptionInput = screen.getByLabelText('Description');
      fireEvent.change(descriptionInput, { target: { value: newDescription } });

      expect(onChangeCatalogueItemDetails).toHaveBeenCalledWith({
        ...props.catalogueItemDetails,
        description: newDescription,
      });
    });
  });
  describe('Catalogue Items Properties', () => {
    beforeEach(() => {
      props.catalogueItemPropertiesForm = getCatalogueItemsPropertiesById('4');
      props.catalogueItemProperties = convertProperties(
        getCatalogueItemsPropertiesById('4')
      );
    });
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('handles number property input correctly', async () => {
      const newValue = '12';

      createView();

      const propertyInput = screen.getByLabelText('Resolution (megapixels) *');

      await user.clear(propertyInput);
      await user.type(propertyInput, newValue);

      expect(onChangeCatalogueItemProperties).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'Resolution',
            value: 12, // Expecting a parsed number
          }),
        ])
      );
    });

    it('handles string property input correctly', async () => {
      const newValue = 'Sensor Type Value';

      createView();

      const propertyInput = screen.getByLabelText('Sensor Type *');

      await user.type(propertyInput, newValue);

      expect(onChangeCatalogueItemProperties).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'Sensor Type',
            value: newValue,
          }),
        ])
      );
    });

    it('handles boolean property input correctly', async () => {
      createView();

      const propertySelect = screen.getByLabelText('Broken *');

      await user.click(propertySelect);

      await user.click(screen.getByText('True'));

      expect(onChangeCatalogueItemProperties).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'Broken',
            value: true,
          }),
        ])
      );
    });
  });

  describe('Manufacturer', () => {
    it('handles manufacturer name input correctly', async () => {
      const newManufacturerName = 'Test Manufacturer';

      createView();

      const manufacturerNameInput = screen.getByLabelText(
        'Manufacturer Name *'
      );

      fireEvent.change(manufacturerNameInput, {
        target: { value: newManufacturerName },
      });

      expect(onChangeCatalogueItemManufacturer).toHaveBeenCalledWith({
        ...props.catalogueItemManufacturer,
        name: newManufacturerName,
      });
    });

    it('handles manufacturer address input correctly', async () => {
      const newManufacturerAddress = '123456789';

      createView();

      const manufacturerAddressInput = screen.getByLabelText(
        'Manufacturer Address *'
      );

      fireEvent.change(manufacturerAddressInput, {
        target: { value: newManufacturerAddress },
      });

      expect(onChangeCatalogueItemManufacturer).toHaveBeenCalledWith({
        ...props.catalogueItemManufacturer,
        address: newManufacturerAddress,
      });
    });

    it('handles manufacturer URL input correctly', async () => {
      const newManufacturerUrl = 'http://www.example.com';

      createView();

      const manufacturerUrlInput = screen.getByLabelText('Manufacturer URL *');
      fireEvent.change(manufacturerUrlInput, {
        target: { value: newManufacturerUrl },
      });

      expect(onChangeCatalogueItemManufacturer).toHaveBeenCalledWith({
        ...props.catalogueItemManufacturer,
        web_url: newManufacturerUrl,
      });
    });
  });
});
