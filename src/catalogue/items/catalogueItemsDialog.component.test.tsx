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
        manufacturer: undefined,
        manufacturerNumber: undefined,
        manufacturerUrl: undefined,
      },
      onChangeCatalogueItemManufacturer: onChangeCatalogueItemManufacturer,
      catalogueItemPropertiesForm: [],
      catalogueItemProperties: [],
      onChangeCatalogueItemProperties: onChangeCatalogueItemProperties,
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
          name: 'Old than 5 years',
          value: false,
        },
      ],
    };

    createView();

    const saveButton = screen.getByRole('button', { name: 'Save' });

    await user.click(saveButton);

    expect(axiosPostSpy).toHaveBeenCalledWith('/v1/catalogue-items', {
      catalogue_category_id: '1',
      description: '',
      name: 'test',
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
          name: 'Old than 5 years',
          value: '',
        },
      ],
    };

    createView();

    const saveButton = screen.getByRole('button', { name: 'Save' });

    await user.click(saveButton);

    expect(axiosPostSpy).toHaveBeenCalledWith('/v1/catalogue-items', {
      catalogue_category_id: '1',
      description: '',
      name: 'test',
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
          name: 'Old than 5 years',
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
          name: 'Old than 5 years',
          value: '',
        },
      ],
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
  });

  it('displays duplicate name error message', async () => {
    props = {
      ...props,
      parentId: '1',
      catalogueItemDetails: { name: 'test_dup', description: '' },
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
          name: 'Old than 5 years',
          value: false,
        },
      ],
    };

    createView();

    const saveButton = screen.getByRole('button', { name: 'Save' });

    await user.click(saveButton);

    await waitFor(() => {
      expect(
        screen.getByText(
          'A catalogue item with the same name already exists within the catalogue category'
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
          name: 'Old than 5 years',
          value: false,
        },
      ],
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
      catalogueItemDetails: { name: 'test_dup', description: '' },
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
      await user.type(manufacturerNameInput, newManufacturerName);

      expect(onChangeCatalogueItemManufacturer).toHaveBeenCalledWith({
        ...props.catalogueItemManufacturer,
        manufacturer: newManufacturerName,
      });
    });

    it('handles manufacturer number input correctly', async () => {
      const newManufacturerNumber = '123456789';

      createView();

      const manufacturerNumberInput = screen.getByLabelText(
        'Manufacturer Number *'
      );
      await user.type(manufacturerNumberInput, newManufacturerNumber);

      expect(onChangeCatalogueItemManufacturer).toHaveBeenCalledWith({
        ...props.catalogueItemManufacturer,
        manufacturerNumber: newManufacturerNumber,
      });
    });

    it('handles manufacturer URL input correctly', async () => {
      const newManufacturerUrl = 'http://www.example.com';

      createView();

      const manufacturerUrlInput = screen.getByLabelText('Manufacturer Url *');
      await user.type(manufacturerUrlInput, newManufacturerUrl);

      expect(onChangeCatalogueItemManufacturer).toHaveBeenCalledWith({
        ...props.catalogueItemManufacturer,
        manufacturerUrl: newManufacturerUrl,
      });
    });
  });
});
