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

describe('Catalogue Items Dialog', () => {
  let props: CatalogueItemsDialogProps;
  let user;
  let axiosPostSpy;
  const onClose = jest.fn();
  const onChangeCatalogueItemDetails = jest.fn();
  const onChangeCatalogueItemManufacturer = jest.fn();
  const onChangePropertyValues = jest.fn();

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
      type: 'create',
      propertyValues: [],
      onChangePropertyValues: onChangePropertyValues,
    };

    user = userEvent.setup();
    axiosPostSpy = jest.spyOn(axios, 'post');
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders text correctly', async () => {
    props.catalogueItemPropertiesForm = getCatalogueItemsPropertiesById('4');

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
      propertyValues: [12, 60, 'IO', 'pixel', true, false],
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
      propertyValues: [12, null, 'IO', null, true, ''],
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

  it('adds a catalogue item (string booleans instead of boolean)', async () => {
    props = {
      ...props,
      parentId: '1',
      catalogueItemDetails: { name: 'test', description: '' },
      catalogueItemPropertiesForm: getCatalogueItemsPropertiesById('4'),
      propertyValues: [12, null, 'IO', null, 'true', 'false'],
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
        {
          name: 'Older than five years',
          value: false,
        },
      ],
    });
  });

  it('display error message when mandatory field is not filled in', async () => {
    props = {
      ...props,
      parentId: '1',
      catalogueItemDetails: { name: '', description: '' },
      catalogueItemPropertiesForm: getCatalogueItemsPropertiesById('4'),
      propertyValues: [null, null, null, null, '', ''],
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
      propertyValues: ['rsdf', 'fsdf', 'pixel', null, false, ''],
      catalogueItemManufacturer: {
        name: 'Sony',
        web_url: 'sony.com',
        address: '1 venus street UY6 9OP',
      },
    };

    const { rerender } = createView();

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
        'Please enter a valid Manufacturer URL. Only "http://" and "https://" links with typical top-level domain are accepted'
      )
    ).toBeInTheDocument();

    props.propertyValues = [12, 12, 'pixel', null, false, ''];

    rerender(<CatalogueItemsDialog {...props} />);

    expect(screen.queryByText('Please enter a valid number')).toBeNull();
  });

  it('displays warning message when an unknown error occurs', async () => {
    props = {
      ...props,
      parentId: '1',
      catalogueItemDetails: { name: 'Error 500', description: '' },
      catalogueItemPropertiesForm: getCatalogueItemsPropertiesById('4'),
      propertyValues: [12, null, 'IO', null, true, ''],
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
        parentId: '4',
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
        propertyValues: [24, 240, 'CCD', 'Nikon', false, true],
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

    it('display error message when invalid number format in property values and invalid manufacturer url', async () => {
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
        propertyValues: ['12a', '21a', 'pixel', null, false, ''],
        catalogueItemManufacturer: {
          name: 'Manufacturer A',
          web_url: 'example.com',
          address: '10 My Street',
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
          'Please enter a valid Manufacturer URL. Only "http://" and "https://" links with typical top-level domain are accepted'
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
        propertyValues: [null, 240, null, 'Nikon', '', true],
        catalogueItemManufacturer: {
          name: '',
          web_url: '',
          address: '',
        },
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
        propertyValues: [24, 240, 'CCD', 'Nikon', true, true],
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

    it('Edit a catalogue item (catalogue properties with string boolean values )', async () => {
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
        propertyValues: [24, 240, 'CCD', 'Nikon', 'true', 'false'],
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
          { name: 'Older than five years', value: false },
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
        propertyValues: [24, 240, 'CCD', 'Nikon', false, true],
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
        propertyValues: [24, 240, 'CCD', 'Nikon', false, true],
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
        propertyValues: [12, 30, 'CMOS', null, true, false],
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

    it('displays error message if no fields have been changed (when they are no catalogue property fields)', async () => {
      props = {
        ...props,
        parentId: '1',
        catalogueItemDetails: { name: 'test', description: '' },
        catalogueItemPropertiesForm: getCatalogueItemsPropertiesById('4'),
        propertyValues: [12, 60, 'IO', 'pixel', true, false],
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
        propertyValues: [24, 240, 'CCD', 'NIkon', false, true],
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
        propertyValues: [12, 60, 'IO', 'pixel', true, false],
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
  describe('Catalogue Items Property values', () => {
    beforeEach(() => {
      props.catalogueItemPropertiesForm = getCatalogueItemsPropertiesById('4');
    });
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('handles number property input correctly', async () => {
      const newValue = '12';

      createView();

      const propertyInput = screen.getByLabelText('Resolution (megapixels) *');

      fireEvent.change(propertyInput, { target: { value: newValue } });

      expect(onChangePropertyValues).toHaveBeenCalledWith(['12']);
    });

    it('handles string property input correctly', async () => {
      const newValue = 'Sensor Type Value';

      createView();

      const propertyInput = screen.getByLabelText('Sensor Type *');

      fireEvent.change(propertyInput, { target: { value: newValue } });

      // eslint-disable-next-line no-sparse-arrays
      expect(onChangePropertyValues).toHaveBeenCalledWith([
        ,
        ,
        'Sensor Type Value',
      ]);
    });

    it('handles boolean property input correctly', async () => {
      createView();

      const propertySelect = screen.getByLabelText('Broken *');

      await user.click(propertySelect);

      await user.click(screen.getByText('True'));

      // eslint-disable-next-line no-sparse-arrays
      expect(onChangePropertyValues).toHaveBeenCalledWith([, , , , 'true']);

      await user.click(propertySelect);

      await user.click(screen.getByText('False'));

      // eslint-disable-next-line no-sparse-arrays
      expect(onChangePropertyValues).toHaveBeenCalledWith([, , , , 'false']);
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
