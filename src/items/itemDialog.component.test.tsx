import React from 'react';
import {
  getCatalogueCategoryById,
  getCatalogueItemById,
  getItemById,
  renderComponentWithBrowserRouter,
} from '../setupTests';
import ItemDialog, {
  ItemDialogProps,
  isValidDateTime,
} from './itemDialog.component';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';

describe('isValidDateTime', () => {
  it('should return true for a valid date string', () => {
    const validDateString = '2022-01-17T12:00:00Z';
    expect(isValidDateTime(validDateString)).toBe(true);
  });

  it('should return false for an invalid date string', () => {
    const invalidDateString = 'invalid-date';
    expect(isValidDateTime(invalidDateString)).toBe(false);
  });

  it('should return true for a valid Date object', () => {
    const validDateObject = new Date('2022-01-17T12:00:00Z');
    expect(isValidDateTime(validDateObject)).toBe(true);
  });

  it('should return false for an invalid Date object', () => {
    const invalidDateObject = new Date('invalid-date');
    expect(isValidDateTime(invalidDateObject)).toBe(false);
  });

  it('should return false for null input', () => {
    expect(isValidDateTime(null)).toBe(false);
  });

  it('should return false if date year exceeds 2100', () => {
    const validDateObject = new Date('2122-01-17T12:00:00Z');
    expect(isValidDateTime(validDateObject)).toBe(false);
  });

  it('should return false if date year (string) exceeds 2100', () => {
    const validDateObject = '2122-01-17T12:00:00Z';
    expect(isValidDateTime(validDateObject)).toBe(false);
  });
});

describe('ItemDialog', () => {
  let props: ItemDialogProps;
  let user;
  const onClose = jest.fn();

  const createView = () => {
    return renderComponentWithBrowserRouter(<ItemDialog {...props} />);
  };
  beforeEach(() => {
    props = {
      open: true,
      onClose: onClose,
      type: 'create',
      catalogueCategory: getCatalogueCategoryById('4'),
      catalogueItem: getCatalogueItemById('1'),
    };
    user = userEvent.setup();
  });

  const modifyDetailsValues = async (values: {
    serialNumber?: string;
    assetNumber?: string;
    purchaseOrderNumber?: string;
    warrantyEndDate?: string;
    deliveredDate?: string;
    isDefective?: string;
    usageStatus?: string;
    notes?: string;
  }) => {
    values.serialNumber !== undefined &&
      fireEvent.change(screen.getByLabelText('Serial number'), {
        target: { value: values.serialNumber },
      });

    values.assetNumber !== undefined &&
      fireEvent.change(screen.getByLabelText('Asset number'), {
        target: { value: values.assetNumber },
      });

    values.purchaseOrderNumber !== undefined &&
      fireEvent.change(screen.getByLabelText('Purchase order number'), {
        target: { value: values.purchaseOrderNumber },
      });

    values.notes !== undefined &&
      fireEvent.change(screen.getByLabelText('Notes'), {
        target: { value: values.notes },
      });

    values.warrantyEndDate !== undefined &&
      (await user.type(
        screen.getByLabelText('Warranty end date'),
        values.warrantyEndDate
      ));

    values.deliveredDate !== undefined &&
      (await user.type(
        screen.getByLabelText('Delivered date'),
        values.deliveredDate
      ));

    if (values.isDefective !== undefined) {
      fireEvent.mouseDown(screen.getByLabelText('Is defective *'));
      fireEvent.click(
        within(screen.getByRole('listbox')).getByText(values.isDefective)
      );
    }

    if (values.usageStatus !== undefined) {
      fireEvent.mouseDown(screen.getByLabelText('Usage status *'));
      fireEvent.click(
        within(screen.getByRole('listbox')).getByText(values.usageStatus)
      );
    }
  };

  const modifyPropertiesValues = async (values: {
    resolution?: string;
    frameRate?: string;
    sensorType?: string;
    sensorBrand?: string;
    broken?: string;
    older?: string;
  }) => {
    values.resolution !== undefined &&
      fireEvent.change(screen.getByLabelText('Resolution (megapixels) *'), {
        target: { value: values.resolution },
      });

    values.frameRate !== undefined &&
      fireEvent.change(screen.getByLabelText('Frame Rate (fps)'), {
        target: { value: values.frameRate },
      });

    if (values.broken !== undefined) {
      fireEvent.mouseDown(screen.getByLabelText('Broken *'));
      fireEvent.click(
        within(screen.getByRole('listbox')).getByText(values.broken)
      );
    }

    if (values.older !== undefined) {
      fireEvent.mouseDown(screen.getByLabelText('Older than five years'));
      fireEvent.click(
        within(screen.getByRole('listbox')).getByText(values.older)
      );
    }

    values.sensorBrand !== undefined &&
      fireEvent.change(screen.getByLabelText('Sensor brand'), {
        target: { value: values.sensorBrand },
      });

    values.sensorType !== undefined &&
      fireEvent.change(screen.getByLabelText('Sensor Type *'), {
        target: { value: values.sensorType },
      });
  };

  const modifySystemValue = async (values: { system?: string }) => {
    if (values.system !== undefined) {
      await user.click(screen.getByText(values.system));
    }
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Add Item', () => {
    let axiosPostSpy;

    beforeEach(() => {
      axiosPostSpy = jest.spyOn(axios, 'post');
    });

    it('displays no item properties message', async () => {
      props.catalogueCategory = {
        ...props.catalogueCategory,
        catalogue_item_properties: [],
      };

      props.catalogueItem = {
        ...props.catalogueItem,
        properties: [],
      };

      createView();

      await user.click(
        screen.getByRole('button', { name: 'Add item properties' })
      );
      await waitFor(() => {
        expect(
          screen.getByText(
            `Please navigate to the next step to select a system`
          )
        ).toBeInTheDocument();
      });
    });
    it('adds an item with just the default values', async () => {
      createView();

      //navigate through stepper
      await user.click(screen.getByRole('button', { name: 'Next' }));
      await user.click(screen.getByRole('button', { name: 'Next' }));

      await modifySystemValue({
        system: 'Giant laser',
      });

      await user.click(screen.getByRole('button', { name: 'Finish' }));

      expect(axiosPostSpy).toHaveBeenCalledWith('/v1/items/', {
        asset_number: null,
        catalogue_item_id: '1',
        delivered_date: null,
        is_defective: false,
        notes: null,
        properties: [
          { name: 'Resolution', value: 12 },
          { name: 'Frame Rate', value: 30 },
          { name: 'Sensor Type', value: 'CMOS' },
          { name: 'Sensor brand', value: null },
          { name: 'Broken', value: true },
          { name: 'Older than five years', value: false },
        ],
        purchase_order_number: null,
        serial_number: null,
        system_id: '65328f34a40ff5301575a4e3',
        usage_status: 0,
        warranty_end_date: null,
      });
    });

    it('navigates through the stepper using the labels', async () => {
      createView();

      //navigate through stepper
      await user.click(
        screen.getByRole('button', { name: 'Add item properties' })
      );

      await waitFor(() => {
        expect(
          screen.getByLabelText('Resolution (megapixels) *')
        ).toBeInTheDocument();
      });

      await user.click(
        screen.getByRole('button', { name: 'Place into a system' })
      );

      await waitFor(() => {
        expect(screen.getByText('Giant laser')).toBeInTheDocument();
      });

      await user.click(
        screen.getByRole('button', { name: 'Add item details' })
      );

      await waitFor(() => {
        expect(screen.getByLabelText('Serial number')).toBeInTheDocument();
      });
    });

    it('should navigate back using the back button', async () => {
      createView();

      //navigate through stepper
      await user.click(
        screen.getByRole('button', { name: 'Add item properties' })
      );

      await waitFor(() => {
        expect(
          screen.getByLabelText('Resolution (megapixels) *')
        ).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: 'Back' }));

      await waitFor(() => {
        expect(screen.getByLabelText('Serial number')).toBeInTheDocument();
      });
    });
    it('adds an item where the item property has an allowed list of values', async () => {
      props = {
        ...props,
        catalogueCategory: getCatalogueCategoryById('12'),
        catalogueItem: getCatalogueItemById('17'),
      };
      createView();

      await user.click(
        screen.getByRole('button', { name: 'Add item properties' })
      );

      await fireEvent.change(
        screen.getByLabelText('Ultimate Pressure (millibar) *'),
        {
          target: { value: '10' },
        }
      );

      await fireEvent.mouseDown(screen.getByLabelText('Pumping Speed *'));
      await fireEvent.click(
        within(screen.getByRole('listbox')).getByText('400')
      );

      await fireEvent.mouseDown(screen.getByLabelText('Axis'));
      await fireEvent.click(within(screen.getByRole('listbox')).getByText('z'));

      await user.click(screen.getByRole('button', { name: 'Next' }));

      await modifySystemValue({
        system: 'Giant laser',
      });

      await user.click(screen.getByRole('button', { name: 'Finish' }));

      expect(axiosPostSpy).toHaveBeenCalledWith('/v1/items/', {
        asset_number: null,
        catalogue_item_id: '17',
        delivered_date: null,
        is_defective: false,
        notes: null,
        properties: [
          { name: 'Pumping Speed', value: 400 },
          { name: 'Ultimate Pressure', value: 10 },
          {
            name: 'Axis',
            value: 'z',
          },
        ],
        purchase_order_number: null,
        serial_number: null,
        system_id: '65328f34a40ff5301575a4e3',
        usage_status: 0,
        warranty_end_date: null,
      });
    });

    it('adds an item (all input values)', async () => {
      createView();

      await modifyDetailsValues({
        serialNumber: 'test12',
        assetNumber: 'test43',
        purchaseOrderNumber: 'test21',
        notes: 'test',
        warrantyEndDate: '17/02/2035',
        deliveredDate: '23/09/2045',
        isDefective: 'Yes',
        usageStatus: 'Used',
      });

      await user.click(screen.getByRole('button', { name: 'Next' }));

      await modifyPropertiesValues({
        resolution: '12',
        frameRate: '60',
        sensorType: 'IO',
        sensorBrand: 'pixel',
        broken: 'True',
        older: 'False',
      });

      await user.click(screen.getByRole('button', { name: 'Next' }));

      await modifySystemValue({
        system: 'Giant laser',
      });

      await user.click(screen.getByRole('button', { name: 'Finish' }));

      expect(axiosPostSpy).toHaveBeenCalledWith('/v1/items/', {
        asset_number: 'test43',
        catalogue_item_id: '1',
        delivered_date: '2045-09-23T00:00:00.000Z',
        is_defective: true,
        notes: 'test',
        properties: [
          { name: 'Resolution', value: 12 },
          { name: 'Frame Rate', value: 60 },
          { name: 'Sensor Type', value: 'IO' },
          { name: 'Sensor brand', value: 'pixel' },
          { name: 'Broken', value: true },
          { name: 'Older than five years', value: false },
        ],
        purchase_order_number: 'test21',
        serial_number: 'test12',
        system_id: '65328f34a40ff5301575a4e3',
        usage_status: 2,
        warranty_end_date: '2035-02-17T00:00:00.000Z',
      });
    }, 10000);

    it('adds an item (case empty string with spaces returns null and change property boolean values)', async () => {
      createView();

      await modifyDetailsValues({
        serialNumber: '   ',
        assetNumber: 'test43',
        purchaseOrderNumber: 'test21',
        notes: 'test',
        warrantyEndDate: '17/02/2035',
        deliveredDate: '23/09/2045',
        isDefective: 'Yes',
        usageStatus: 'Used',
      });

      await user.click(screen.getByRole('button', { name: 'Next' }));

      await modifyPropertiesValues({
        resolution: '12',
        frameRate: '60',
        sensorType: 'IO',
        sensorBrand: 'pixel',
        broken: 'False',
        older: 'True',
      });

      await user.click(screen.getByRole('button', { name: 'Next' }));

      await modifySystemValue({
        system: 'Giant laser',
      });

      await user.click(screen.getByRole('button', { name: 'Finish' }));

      expect(axiosPostSpy).toHaveBeenCalledWith('/v1/items/', {
        asset_number: 'test43',
        catalogue_item_id: '1',
        delivered_date: '2045-09-23T00:00:00.000Z',
        is_defective: true,
        notes: 'test',
        properties: [
          { name: 'Resolution', value: 12 },
          { name: 'Frame Rate', value: 60 },
          { name: 'Sensor Type', value: 'IO' },
          { name: 'Sensor brand', value: 'pixel' },
          { name: 'Broken', value: false },
          { name: 'Older than five years', value: true },
        ],
        purchase_order_number: 'test21',
        serial_number: null,
        system_id: '65328f34a40ff5301575a4e3',
        usage_status: 2,
        warranty_end_date: '2035-02-17T00:00:00.000Z',
      });
    }, 10000);

    it('displays error message when mandatory property values missing', async () => {
      createView();

      await modifyDetailsValues({
        serialNumber: '   ',
        assetNumber: 'test43',
        purchaseOrderNumber: 'test21',
        notes: 'test',
        warrantyEndDate: '17/02/2035',
        deliveredDate: '23/09/2045',
        isDefective: 'Yes',
        usageStatus: 'Used',
      });

      await user.click(screen.getByRole('button', { name: 'Next' }));

      await modifyPropertiesValues({
        resolution: '',
        sensorType: '',
        broken: 'None',
      });

      await user.click(screen.getByRole('button', { name: 'Next' }));

      const mandatoryFieldHelperText = screen.getAllByText(
        'Please enter a valid value as this field is mandatory'
      );

      const mandatoryFieldBooleanHelperText = screen.getByText(
        'Please select either True or False'
      );

      expect(mandatoryFieldBooleanHelperText).toBeInTheDocument();
      expect(mandatoryFieldHelperText.length).toBe(2);

      expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();

      await modifyPropertiesValues({
        broken: 'False',
        resolution: '12',
        frameRate: '60',
        sensorType: 'IO',
        sensorBrand: 'pixel',
      });

      expect(mandatoryFieldBooleanHelperText).not.toBeInTheDocument();

      expect(
        screen.queryByText(
          'Please enter a valid value as this field is mandatory'
        )
      ).not.toBeInTheDocument();

      expect(screen.getByRole('button', { name: 'Next' })).not.toBeDisabled();
    }, 10000);

    it('displays error message when property values type is incorrect', async () => {
      createView();

      await modifyDetailsValues({
        serialNumber: '   ',
        assetNumber: 'test43',
        purchaseOrderNumber: 'test21',
        notes: 'test',
        warrantyEndDate: '17',
        deliveredDate: '23',
        isDefective: 'Yes',
        usageStatus: 'Used',
      });

      const validDateHelperText = screen.getAllByText(
        'Date format: dd/MM/yyyy'
      );
      expect(validDateHelperText.length).toEqual(2);

      expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();

      await modifyDetailsValues({
        warrantyEndDate: '17/02/4000',
        deliveredDate: '23/09/4000',
      });

      const validDateMaxHelperText = screen.getAllByText(
        'Exceeded maximum date'
      );
      expect(validDateMaxHelperText.length).toEqual(2);

      expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();

      await modifyDetailsValues({
        warrantyEndDate: '17/02/2000',
        deliveredDate: '23/09/2000',
      });

      expect(
        screen.queryByText('Exceeded maximum date')
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText(
          'Please enter a valid value as this field is mandatory'
        )
      ).not.toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Next' }));

      await modifyPropertiesValues({
        resolution: 'rwererw',
        sensorType: '',
        broken: 'None',
      });

      await user.click(screen.getByRole('button', { name: 'Next' }));

      const validNumberHelperText = screen.getByText(
        'Please enter a valid number'
      );

      expect(validNumberHelperText).toBeInTheDocument();

      expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();

      await modifyPropertiesValues({
        resolution: '12',
      });
      expect(
        screen.queryByText('Please enter a valid number')
      ).not.toBeInTheDocument();
    }, 10000);

    it('displays warning message when an unknown error occurs', async () => {
      createView();
      await modifyDetailsValues({
        serialNumber: 'Error 500',
      });

      await user.click(screen.getByRole('button', { name: 'Next' }));
      await user.click(screen.getByRole('button', { name: 'Next' }));

      await modifySystemValue({
        system: 'Giant laser',
      });

      await user.click(screen.getByRole('button', { name: 'Finish' }));

      await waitFor(() => {
        expect(
          screen.getByText('Please refresh and try again')
        ).toBeInTheDocument();
      });
      expect(onClose).not.toHaveBeenCalled();
    });

    it('save as an item', async () => {
      props.selectedItem = getItemById('G463gOIA');
      props.type = 'save as';
      createView();

      await user.click(screen.getByRole('button', { name: 'Next' }));
      await user.click(screen.getByRole('button', { name: 'Next' }));
      await user.click(screen.getByRole('button', { name: 'Finish' }));

      expect(axiosPostSpy).toHaveBeenCalledWith('/v1/items/', {
        asset_number: '03MXnOfP5C',
        catalogue_item_id: '1',
        delivered_date: '2023-05-11T23:00:00.000Z',
        is_defective: false,
        notes: 'rRXBHQFbF3zts6XS279k',
        properties: [
          { name: 'Resolution', value: 12 },
          { name: 'Frame Rate', value: 30 },
          { name: 'Sensor Type', value: 'CMOS' },
          { name: 'Sensor brand', value: null },
          { name: 'Broken', value: true },
          { name: 'Older than five years', value: false },
        ],
        purchase_order_number: 'tIWiCOow',
        serial_number: 'vYs9Vxx6yWbn',
        system_id: '656ef565ed0773f82e44bc6d',
        usage_status: 2,
        warranty_end_date: '2023-05-18T23:00:00.000Z',
      });
    }, 10000);

    it('displays catalogue item notes tooltip on hover', async () => {
      createView();
      await waitFor(() => {
        expect(
          screen.getByLabelText('Catalogue item note: None')
        ).toBeInTheDocument();
      });

      const infoIcon = screen.getByLabelText('Catalogue item note: None');

      await user.hover(infoIcon);

      await waitFor(() => {
        expect(screen.getByText('Catalogue item note:')).toBeInTheDocument();
      });
      expect(screen.getByText('None')).toBeInTheDocument();

      await user.unhover(infoIcon);

      await waitFor(() => {
        expect(screen.queryByText('None')).not.toBeInTheDocument();
      });
    });
  });

  describe('Edit Item', () => {
    let axiosPatchSpy;

    beforeEach(() => {
      axiosPatchSpy = jest.spyOn(axios, 'patch');
      props.selectedItem = getItemById('G463gOIA');
      props.type = 'edit';
    });

    it('edit an item (all input values)', async () => {
      createView();

      await modifyDetailsValues({
        serialNumber: 'test12',
        assetNumber: 'test43',
        purchaseOrderNumber: 'test21',
        notes: 'test',
        warrantyEndDate: '17/02/2035',
        deliveredDate: '23/09/2045',
        isDefective: 'Yes',
        usageStatus: 'Used',
      });

      await user.click(screen.getByRole('button', { name: 'Next' }));

      await modifyPropertiesValues({
        resolution: '12',
        frameRate: '60',
        sensorType: 'IO',
        sensorBrand: 'pixel',
        broken: 'True',
        older: 'False',
      });

      await user.click(screen.getByRole('button', { name: 'Next' }));

      //navigate to home for systems table to then be able to change system
      await user.click(
        screen.getByRole('button', { name: 'navigate to systems home' })
      );

      await modifySystemValue({
        system: 'Giant laser',
      });

      await user.click(screen.getByRole('button', { name: 'Finish' }));

      expect(axiosPatchSpy).toHaveBeenCalledWith('/v1/items/G463gOIA', {
        asset_number: 'test43',
        delivered_date: '2045-09-23T23:00:00.000Z',
        is_defective: true,
        notes: 'test',
        properties: [
          { name: 'Resolution', value: 12 },
          { name: 'Frame Rate', value: 60 },
          { name: 'Sensor Type', value: 'IO' },
          { name: 'Sensor brand', value: 'pixel' },
          { name: 'Broken', value: true },
          { name: 'Older than five years', value: false },
        ],
        purchase_order_number: 'test21',
        serial_number: 'test12',
        warranty_end_date: '2035-02-17T23:00:00.000Z',
        system_id: '65328f34a40ff5301575a4e3',
      });
    }, 10000);

    it('edits an item where the item property has an allowed list of values', async () => {
      props = {
        ...props,
        catalogueCategory: getCatalogueCategoryById('12'),
        catalogueItem: getCatalogueItemById('17'),
      };
      createView();

      await user.click(
        screen.getByRole('button', { name: 'Edit item properties' })
      );

      await fireEvent.change(
        screen.getByLabelText('Ultimate Pressure (millibar) *'),
        {
          target: { value: '10' },
        }
      );

      await fireEvent.mouseDown(screen.getByLabelText('Pumping Speed *'));
      await fireEvent.click(
        within(screen.getByRole('listbox')).getByText('400')
      );

      await fireEvent.mouseDown(screen.getByLabelText('Axis'));
      await fireEvent.click(within(screen.getByRole('listbox')).getByText('z'));
      await user.click(screen.getByRole('button', { name: 'Next' }));

      await user.click(screen.getByRole('button', { name: 'Finish' }));
      expect(axiosPatchSpy).toHaveBeenCalledWith('/v1/items/G463gOIA', {
        properties: [
          { name: 'Pumping Speed', value: 400 },
          { name: 'Ultimate Pressure', value: 10 },
          {
            name: 'Axis',
            value: 'z',
          },
        ],
      });
    });

    it('displays error message when property values type is incorrect', async () => {
      createView();

      await modifyDetailsValues({
        serialNumber: '   ',
        assetNumber: 'test43',
        purchaseOrderNumber: 'test21',
        notes: 'test',
        warrantyEndDate: '17',
        deliveredDate: '23',
        isDefective: 'Yes',
        usageStatus: 'Used',
      });

      await user.click(screen.getByRole('button', { name: 'Next' }));

      await modifyPropertiesValues({
        resolution: 'rwererw',
        sensorType: '',
        broken: 'None',
      });

      await user.click(screen.getByRole('button', { name: 'Next' }));

      const validNumberHelperText = screen.getByText(
        'Please enter a valid number'
      );

      expect(validNumberHelperText).toBeInTheDocument();

      expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();

      await modifyPropertiesValues({
        resolution: '12',
      });
      expect(
        screen.queryByText('Please enter a valid number')
      ).not.toBeInTheDocument();
    }, 10000);

    it('displays warning message when an unknown error occurs', async () => {
      createView();

      await modifyDetailsValues({
        serialNumber: 'Error 500',
      });

      await user.click(screen.getByRole('button', { name: 'Next' }));
      await user.click(screen.getByRole('button', { name: 'Next' }));
      await user.click(screen.getByRole('button', { name: 'Finish' }));

      await waitFor(() => {
        expect(
          screen.getByText('Please refresh and try again')
        ).toBeInTheDocument();
      });
      expect(screen.getByRole('button', { name: 'Finish' })).toBeDisabled();
      expect(onClose).not.toHaveBeenCalled();
    });

    it('displays error message if no fields have been changed (when they are no catalogue property fields)', async () => {
      createView();

      await user.click(screen.getByRole('button', { name: 'Next' }));
      await user.click(screen.getByRole('button', { name: 'Next' }));
      await user.click(screen.getByRole('button', { name: 'Finish' }));

      await waitFor(() => {
        expect(
          screen.getByText('Please edit a form entry before clicking save')
        ).toBeInTheDocument();
      });
    });
  });
});
