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
      catalogueItemDetails: {
        name: '',
        description: null,
        cost_gbp: null,
        cost_to_rework_gbp: null,
        days_to_replace: null,
        days_to_rework: null,
        drawing_number: null,
        drawing_link: null,
        model_number: null,
        is_obsolete: 'false',
        obsolete_replacement_catalogue_item_id: null,
        obsolete_reason: null,
      },
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
      catalogueItemDetails: {
        name: 'test',
        description: '',
        cost_gbp: '1200',
        cost_to_rework_gbp: '400',
        days_to_replace: '20',
        days_to_rework: '2',
        drawing_number: 'mk4324',
        drawing_link: 'https://example.com',
        model_number: 'mk4324',
        is_obsolete: 'false',
        obsolete_replacement_catalogue_item_id: null,
        obsolete_reason: null,
      },
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
      cost_gbp: 1200,
      cost_to_rework_gbp: 400,
      days_to_replace: 20,
      days_to_rework: 2,
      description: '',
      drawing_link: 'https://example.com',
      drawing_number: 'mk4324',
      is_obsolete: false,
      manufacturer: {
        address: '1 venus street UY6 9OP',
        name: 'Sony',
        web_url: 'https://sony.com',
      },
      model_number: 'mk4324',
      name: 'test',
      obsolete_reason: null,
      obsolete_replacement_catalogue_item_id: null,
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
      catalogueItemDetails: {
        name: 'test',
        description: '',
        cost_gbp: '200',
        cost_to_rework_gbp: null,
        days_to_replace: '5',
        days_to_rework: null,
        drawing_number: null,
        drawing_link: null,
        model_number: null,
        is_obsolete: 'false',
        obsolete_replacement_catalogue_item_id: null,
        obsolete_reason: null,
      },
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
      cost_gbp: 200,
      cost_to_rework_gbp: null,
      days_to_replace: 5,
      days_to_rework: null,
      description: '',
      drawing_link: null,
      drawing_number: null,
      is_obsolete: false,
      manufacturer: {
        address: '1 venus street UY6 9OP',
        name: 'Sony',
        web_url: 'https://sony.com',
      },
      model_number: null,
      name: 'test',
      obsolete_reason: null,
      obsolete_replacement_catalogue_item_id: null,
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
      catalogueItemDetails: {
        name: 'test',
        description: '',
        cost_gbp: '200',
        cost_to_rework_gbp: null,
        days_to_replace: '5',
        days_to_rework: null,
        drawing_number: null,
        drawing_link: null,
        model_number: null,
        is_obsolete: 'false',
        obsolete_replacement_catalogue_item_id: null,
        obsolete_reason: null,
      },
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
      cost_gbp: 200,
      cost_to_rework_gbp: null,
      days_to_replace: 5,
      days_to_rework: null,
      description: '',
      drawing_link: null,
      drawing_number: null,
      is_obsolete: false,
      manufacturer: {
        address: '1 venus street UY6 9OP',
        name: 'Sony',
        web_url: 'https://sony.com',
      },
      model_number: null,
      name: 'test',
      obsolete_reason: null,
      obsolete_replacement_catalogue_item_id: null,
      properties: [
        { name: 'Resolution', value: 12 },
        { name: 'Sensor Type', value: 'IO' },
        { name: 'Broken', value: true },
        { name: 'Older than five years', value: false },
      ],
    });
  });

  it('display error message when mandatory field is not filled in', async () => {
    props = {
      ...props,
      parentId: '1',
      catalogueItemDetails: {
        name: '',
        description: '',
        cost_gbp: null,
        cost_to_rework_gbp: null,
        days_to_replace: null,
        days_to_rework: null,
        drawing_number: null,
        drawing_link: null,
        model_number: null,
        is_obsolete: 'false',
        obsolete_replacement_catalogue_item_id: null,
        obsolete_reason: null,
      },
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

    const nameHelperText = screen.getByText('Please enter a name');
    const costHelperText = screen.getByText('Please enter a cost');
    const daysToReplaceHelperText = screen.getByText(
      'Please enter how many days it would take to replace'
    );

    expect(mandatoryFieldBooleanHelperText).toBeInTheDocument();
    expect(nameHelperText).toBeInTheDocument();
    expect(costHelperText).toBeInTheDocument();
    expect(daysToReplaceHelperText).toBeInTheDocument();
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
      catalogueItemDetails: {
        name: '',
        description: '',
        cost_gbp: null,
        cost_to_rework_gbp: null,
        days_to_replace: null,
        days_to_rework: null,
        drawing_number: null,
        drawing_link: 'test',
        model_number: null,
        is_obsolete: 'false',
        obsolete_replacement_catalogue_item_id: null,
        obsolete_reason: null,
      },
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

    expect(
      screen.getByText(
        'Please enter a valid Drawing link. Only "http://" and "https://" links with typical top-level domain are accepted'
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
      catalogueItemDetails: {
        name: 'Error 500',
        description: '',
        cost_gbp: '687',
        cost_to_rework_gbp: null,
        days_to_replace: '78',
        days_to_rework: null,
        drawing_number: null,
        drawing_link: null,
        model_number: null,
        is_obsolete: 'false',
        obsolete_replacement_catalogue_item_id: null,
        obsolete_reason: null,
      },
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

    const cameras1 = {
      catalogue_category_id: '4',
      name: 'Cameras 1',
      description: 'High-resolution cameras for beam characterization. 1',
      properties: [
        {
          name: 'Resolution',
          value: 12,
          unit: 'megapixels',
        },
        {
          name: 'Frame Rate',
          value: 30,
          unit: 'fps',
        },
        {
          name: 'Sensor Type',
          value: 'CMOS',
          unit: '',
        },
        {
          name: 'Broken',
          value: true,
          unit: '',
        },
        {
          name: 'Older than five years',
          value: false,
          unit: '',
        },
      ],
      id: '1',
      manufacturer: {
        name: 'Manufacturer A',
        web_url: 'http://example.com',
        address: '10 My Street',
      },
      cost_gbp: 500,
      cost_to_rework_gbp: null,
      days_to_replace: 7,
      days_to_rework: null,
      drawing_number: null,
      drawing_link: null,
      model_number: null,
      is_obsolete: false,
      obsolete_replacement_catalogue_item_id: null,
      obsolete_reason: null,
    };
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
        catalogueItemDetails: {
          name: 'test',
          description: '',
          cost_gbp: '687',
          cost_to_rework_gbp: '89',
          days_to_replace: '78',
          days_to_rework: '68',
          drawing_number: 'test',
          drawing_link: 'http://example.com',
          model_number: 'tets01',
          is_obsolete: 'false',
          obsolete_replacement_catalogue_item_id: null,
          obsolete_reason: null,
        },
        selectedCatalogueItem: cameras1,
        catalogueItemPropertiesForm: getCatalogueItemsPropertiesById('4'),
        propertyValues: [12, 30, 'CMOS', null, 'true', 'false'],
        catalogueItemManufacturer: {
          name: 'Manufacturer A',
          web_url: 'http://example.com',
          address: '10 My Street',
        },
      };

      createView();

      const saveButton = screen.getByRole('button', { name: 'Save' });

      await user.click(saveButton);

      expect(axiosPatchSpy).toHaveBeenCalledWith('/v1/catalogue-items/1', {
        cost_gbp: 687,
        cost_to_rework_gbp: 89,
        days_to_replace: 78,
        days_to_rework: 68,
        description: '',
        drawing_link: 'http://example.com',
        drawing_number: 'test',
        model_number: 'tets01',
        name: 'test',
      });

      expect(onClose).toHaveBeenCalled();
    });

    it('display error message when mandatory field is not filled in', async () => {
      props = {
        ...props,
        parentId: '4',
        catalogueItemDetails: {
          name: '',
          description: 'High-resolution cameras for beam characterization. 4',
          cost_gbp: null,
          cost_to_rework_gbp: null,
          days_to_replace: null,
          days_to_rework: null,
          drawing_number: null,
          drawing_link: null,
          model_number: null,
          is_obsolete: 'false',
          obsolete_replacement_catalogue_item_id: null,
          obsolete_reason: null,
        },
        selectedCatalogueItem: cameras1,
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

      const nameHelperText = screen.getByText('Please enter a name');
      const costHelperText = screen.getByText('Please enter a cost');
      const daysToReplaceHelperText = screen.getByText(
        'Please enter how many days it would take to replace'
      );

      expect(mandatoryFieldBooleanHelperText).toBeInTheDocument();
      expect(nameHelperText).toBeInTheDocument();
      expect(costHelperText).toBeInTheDocument();
      expect(daysToReplaceHelperText).toBeInTheDocument();
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
          name: 'Cameras 1',
          description: 'High-resolution cameras for beam characterization. 1',
          cost_gbp: '500',
          cost_to_rework_gbp: null,
          days_to_replace: '7',
          days_to_rework: null,
          drawing_number: null,
          drawing_link: null,
          model_number: null,
          is_obsolete: 'false',
          obsolete_replacement_catalogue_item_id: null,
          obsolete_reason: null,
        },
        selectedCatalogueItem: cameras1,
        catalogueItemPropertiesForm: getCatalogueItemsPropertiesById('4'),
        propertyValues: [24, 240, 'CCD', 'Nikon', 'true', 'true'],
        catalogueItemManufacturer: {
          name: 'Manufacturer A',
          web_url: 'http://example.com',
          address: '10 My Street',
        },
      };

      createView();

      const saveButton = screen.getByRole('button', { name: 'Save' });

      await user.click(saveButton);
      expect(axiosPatchSpy).toHaveBeenCalledWith('/v1/catalogue-items/1', {
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
          name: 'Cameras 1',
          description: 'High-resolution cameras for beam characterization. 1',
          cost_gbp: '500',
          cost_to_rework_gbp: null,
          days_to_replace: '7',
          days_to_rework: null,
          drawing_number: null,
          drawing_link: null,
          model_number: null,
          is_obsolete: 'false',
          obsolete_replacement_catalogue_item_id: null,
          obsolete_reason: null,
        },
        selectedCatalogueItem: cameras1,
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
      expect(axiosPatchSpy).toHaveBeenCalledWith('/v1/catalogue-items/1', {
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
          name: 'Cameras 1',
          description: 'High-resolution cameras for beam characterization. 1',
          cost_gbp: '500',
          cost_to_rework_gbp: null,
          days_to_replace: '7',
          days_to_rework: null,
          drawing_number: null,
          drawing_link: null,
          model_number: null,
          is_obsolete: 'false',
          obsolete_replacement_catalogue_item_id: null,
          obsolete_reason: null,
        },
        selectedCatalogueItem: cameras1,
        catalogueItemPropertiesForm: getCatalogueItemsPropertiesById('4'),
        propertyValues: [12, 30, 'CMOS', null, 'true', 'false'],
        catalogueItemManufacturer: {
          name: 'Sony1',
          web_url: 'https://sony.com',
          address: '12 venus street UY6 9OP',
        },
      };

      createView();

      const saveButton = screen.getByRole('button', { name: 'Save' });

      await user.click(saveButton);
      expect(axiosPatchSpy).toHaveBeenCalledWith('/v1/catalogue-items/1', {
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
          name: 'Cameras 1',
          description: 'High-resolution cameras for beam characterization. 1',
          cost_gbp: '500',
          cost_to_rework_gbp: null,
          days_to_replace: '7',
          days_to_rework: null,
          drawing_number: null,
          drawing_link: null,
          model_number: null,
          is_obsolete: 'false',
          obsolete_replacement_catalogue_item_id: null,
          obsolete_reason: null,
        },
        selectedCatalogueItem: cameras1,
        catalogueItemPropertiesForm: getCatalogueItemsPropertiesById('4'),
        propertyValues: [12, 30, 'CMOS', null, 'true', 'false'],
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
          cost_gbp: '500',
          cost_to_rework_gbp: null,
          days_to_replace: '7',
          days_to_rework: null,
          drawing_number: null,
          drawing_link: null,
          model_number: null,
          is_obsolete: 'false',
          obsolete_replacement_catalogue_item_id: null,
          obsolete_reason: null,
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
        catalogueItemDetails: {
          name: 'Cameras 1',
          description: 'High-resolution cameras for beam characterization. 1',
          cost_gbp: '500',
          cost_to_rework_gbp: null,
          days_to_replace: '7',
          days_to_rework: null,
          drawing_number: null,
          drawing_link: null,
          model_number: null,
          is_obsolete: 'false',
          obsolete_replacement_catalogue_item_id: null,
          obsolete_reason: null,
        },
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
          cost_gbp: '500',
          cost_to_rework_gbp: null,
          days_to_replace: '7',
          days_to_rework: null,
          drawing_number: null,
          drawing_link: null,
          model_number: null,
          is_obsolete: 'false',
          obsolete_replacement_catalogue_item_id: null,
          obsolete_reason: null,
        },
        selectedCatalogueItem: cameras1,
        catalogueItemPropertiesForm: getCatalogueItemsPropertiesById('4'),
        propertyValues: [24, 240, 'CCD', 'NIkon', 'false', 'true'],
        catalogueItemManufacturer: {
          name: 'Manufacturer A',
          web_url: 'http://example.com',
          address: '10 My Street',
        },
      };

      createView();

      const saveButton = screen.getByRole('button', { name: 'Save' });

      await user.click(saveButton);
      expect(axiosPatchSpy).toHaveBeenCalledWith('/v1/catalogue-items/1', {
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
        catalogueItemDetails: {
          name: 'Error 500',
          description: '',
          cost_gbp: '500',
          cost_to_rework_gbp: null,
          days_to_replace: '7',
          days_to_rework: null,
          drawing_number: null,
          drawing_link: null,
          model_number: null,
          is_obsolete: 'false',
          obsolete_replacement_catalogue_item_id: null,
          obsolete_reason: null,
        },
        catalogueItemPropertiesForm: getCatalogueItemsPropertiesById('4'),
        selectedCatalogueItem: cameras1,
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
      fireEvent.change(nameInput, { target: { value: newName } });

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

    it('handles Cost (£) input correctly', async () => {
      const newCost = '100.0';

      createView();

      const costInput = screen.getByLabelText('Cost (£) *');
      fireEvent.change(costInput, { target: { value: newCost } });

      expect(onChangeCatalogueItemDetails).toHaveBeenCalledWith({
        ...props.catalogueItemDetails,
        cost_gbp: newCost,
      });
    });

    it('handles Cost to rework (£) input correctly', async () => {
      const newCostToRework = '50.0';

      createView();

      const costToReworkInput = screen.getByLabelText('Cost to rework (£)');
      fireEvent.change(costToReworkInput, {
        target: { value: newCostToRework },
      });

      expect(onChangeCatalogueItemDetails).toHaveBeenCalledWith({
        ...props.catalogueItemDetails,
        cost_to_rework_gbp: newCostToRework,
      });
    });

    it('handles Time to replace (days) input correctly', async () => {
      const newDaysToReplace = '7';

      createView();

      const daysToReplaceInput = screen.getByLabelText(
        'Time to replace (days) *'
      );
      fireEvent.change(daysToReplaceInput, {
        target: { value: newDaysToReplace },
      });

      expect(onChangeCatalogueItemDetails).toHaveBeenCalledWith({
        ...props.catalogueItemDetails,
        days_to_replace: newDaysToReplace,
      });
    });

    it('handles Time to rework (days) input correctly', async () => {
      const newDaysToRework = '3';

      createView();

      const daysToReworkInput = screen.getByLabelText('Time to rework (days)');
      fireEvent.change(daysToReworkInput, {
        target: { value: newDaysToRework },
      });

      expect(onChangeCatalogueItemDetails).toHaveBeenCalledWith({
        ...props.catalogueItemDetails,
        days_to_rework: newDaysToRework,
      });
    });

    it('handles Drawing number input correctly', async () => {
      const newDrawingNumber = '12345';

      createView();

      const drawingNumberInput = screen.getByLabelText('Drawing number');
      fireEvent.change(drawingNumberInput, {
        target: { value: newDrawingNumber },
      });

      expect(onChangeCatalogueItemDetails).toHaveBeenCalledWith({
        ...props.catalogueItemDetails,
        drawing_number: newDrawingNumber,
      });
    });

    it('handles Drawing Link input correctly', async () => {
      const newDrawingLink = '12345';

      createView();

      const drawingNumberInput = screen.getByLabelText('Drawing link');
      fireEvent.change(drawingNumberInput, {
        target: { value: newDrawingLink },
      });

      expect(onChangeCatalogueItemDetails).toHaveBeenCalledWith({
        ...props.catalogueItemDetails,
        drawing_link: newDrawingLink,
      });
    });

    it('handles Model number input correctly', async () => {
      const newModelNumber = '7890';

      createView();

      const modelNumberInput = screen.getByLabelText('Model number');
      fireEvent.change(modelNumberInput, { target: { value: newModelNumber } });

      expect(onChangeCatalogueItemDetails).toHaveBeenCalledWith({
        ...props.catalogueItemDetails,
        model_number: newModelNumber,
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
