import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { imsApi } from '../api/api';
import handleIMS_APIError from '../handleIMS_APIError';
import {
  getCatalogueCategoryById,
  getCatalogueItemById,
  getItemById,
  renderComponentWithRouterProvider,
} from '../testUtils';
import ItemDialog, {
  ItemDialogProps,
  isValidDateTime,
} from './itemDialog.component';
import { server } from '../mocks/server';
import { http } from 'msw';

vi.mock('../handleIMS_APIError');

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
  let user: UserEvent;
  const onClose = vi.fn();

  const createView = () => {
    return renderComponentWithRouterProvider(<ItemDialog {...props} />);
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
    serialNumberAdvancedOptions?: { quantity?: string; startingValue?: string };
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

    if (Object.values(values.serialNumberAdvancedOptions ?? {}).length !== 0) {
      await user.click(screen.getByText('Show advanced options'));
      expect(screen.getByText('Close advanced options')).toBeInTheDocument();

      values.serialNumberAdvancedOptions?.quantity !== undefined &&
        fireEvent.change(screen.getByLabelText('Quantity'), {
          target: { value: values.serialNumberAdvancedOptions.quantity },
        });
      values.serialNumberAdvancedOptions?.startingValue !== undefined &&
        fireEvent.change(screen.getByLabelText('Starting value'), {
          target: { value: values.serialNumberAdvancedOptions.startingValue },
        });
    }

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
      const isDefectiveAutocomplete = screen.getAllByRole('combobox')[0];
      await user.type(isDefectiveAutocomplete, values.isDefective);
    }

    if (values.usageStatus !== undefined) {
      const usageStatusAutocomplete = screen.getAllByRole('combobox')[1];
      await user.type(usageStatusAutocomplete, values.usageStatus);
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
      const brokenAutoComplete = screen.getAllByRole('combobox')[0];
      await user.type(brokenAutoComplete, values.broken);
    }

    if (values.older !== undefined) {
      const olderAutocomplete = screen.getAllByRole('combobox')[1];
      await user.type(olderAutocomplete, values.older);
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
    vi.clearAllMocks();
  });

  describe('Add Item', () => {
    let axiosPostSpy;

    beforeEach(() => {
      axiosPostSpy = vi.spyOn(imsApi, 'post');
    });

    it('disables finish button and shows circular progress indicator when request is pending', async () => {
      server.use(
        http.post('/v1/items', () => {
          return new Promise(() => {});
        })
      );

      createView();

      await modifyDetailsValues({
        usageStatus: 'Used',
      });

      //navigate through stepper
      await user.click(screen.getByRole('button', { name: 'Next' }));
      await user.click(screen.getByRole('button', { name: 'Next' }));

      await modifySystemValue({
        system: 'Giant laser',
      });

      const finishButton = screen.getByRole('button', { name: 'Finish' });
      await user.click(finishButton);

      expect(finishButton).toBeDisabled();
      expect(await screen.findByRole('progressbar')).toBeInTheDocument();
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

      await user.click(screen.getByText('Add item properties'));
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

      await modifyDetailsValues({
        usageStatus: 'U{arrowdown}{arrowdown}{enter}',
      });

      //navigate through stepper
      await user.click(screen.getByRole('button', { name: 'Next' }));
      await user.click(screen.getByRole('button', { name: 'Next' }));

      await modifySystemValue({
        system: 'Giant laser',
      });

      await user.click(screen.getByRole('button', { name: 'Finish' }));

      expect(axiosPostSpy).toHaveBeenCalledWith('/v1/items', {
        asset_number: null,
        catalogue_item_id: '1',
        delivered_date: null,
        is_defective: false,
        notes: null,
        properties: [
          { id: '1', value: 12 },
          { id: '2', value: 30 },
          { id: '3', value: 'CMOS' },
          { id: '4', value: null },
          { id: '5', value: true },
          { id: '6', value: false },
        ],
        purchase_order_number: null,
        serial_number: null,
        system_id: '65328f34a40ff5301575a4e3',
        usage_status_id: '2',
        warranty_end_date: null,
      });
    });

    it('adds multiple items with just the default values', async () => {
      createView();

      await modifyDetailsValues({
        serialNumber: 'test12 %s',
        serialNumberAdvancedOptions: { quantity: '2', startingValue: '10' },
        usageStatus: 'U{arrowdown}{arrowdown}{enter}',
      });

      //navigate through stepper
      await user.click(screen.getByRole('button', { name: 'Next' }));
      await user.click(screen.getByRole('button', { name: 'Next' }));

      await modifySystemValue({
        system: 'Giant laser',
      });

      await user.click(screen.getByRole('button', { name: 'Finish' }));

      for (let i = 0; i < 2; i++) {
        expect(axiosPostSpy).toHaveBeenCalledWith('/v1/items', {
          asset_number: null,
          catalogue_item_id: '1',
          delivered_date: null,
          is_defective: false,
          notes: null,
          properties: [
            {
              id: '1',
              value: 12,
            },
            {
              id: '2',
              value: 30,
            },
            {
              id: '3',
              value: 'CMOS',
            },
            {
              id: '4',
              value: null,
            },
            {
              id: '5',
              value: true,
            },
            {
              id: '6',
              value: false,
            },
          ],
          purchase_order_number: null,
          serial_number: `test12 ${i + 10}`,
          system_id: '65328f34a40ff5301575a4e3',
          usage_status_id: '2',
          warranty_end_date: null,
        });
      }
    }, 10000);

    it('navigates through the stepper using the labels', async () => {
      createView();

      //navigate through stepper
      await user.click(screen.getByText('Add item properties'));

      await waitFor(() => {
        expect(
          screen.getByLabelText('Resolution (megapixels) *')
        ).toBeInTheDocument();
      });

      await user.click(screen.getByText('Place into a system'));

      await waitFor(() => {
        expect(screen.getByText('Giant laser')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Add item details'));

      await waitFor(() => {
        expect(screen.getByLabelText('Serial number')).toBeInTheDocument();
      });
    });

    it('should navigate back using the back button', async () => {
      createView();

      //navigate through stepper
      await user.click(screen.getByText('Add item properties'));

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

      await modifyDetailsValues({
        usageStatus: 'U{arrowdown}{arrowdown}{enter}',
      });

      await user.click(screen.getByText('Add item properties'));

      fireEvent.change(
        screen.getByLabelText('Ultimate Pressure (millibar) *'),
        {
          target: { value: '10' },
        }
      );

      const pumpingSpeedAutoComplete = screen.getAllByRole('combobox')[0];
      await user.type(pumpingSpeedAutoComplete, '4{arrowdown}{enter}');

      const axisAutocomplete = screen.getAllByRole('combobox')[1];
      await user.type(axisAutocomplete, 'z{arrowdown}{enter}');

      await user.click(screen.getByRole('button', { name: 'Next' }));

      await modifySystemValue({
        system: 'Giant laser',
      });

      await user.click(screen.getByRole('button', { name: 'Finish' }));

      expect(axiosPostSpy).toHaveBeenCalledWith('/v1/items', {
        asset_number: null,
        catalogue_item_id: '17',
        delivered_date: null,
        is_defective: false,
        notes: null,
        properties: [
          { id: '17', value: 400 },
          { id: '18', value: 10 },
          {
            id: '19',
            value: 'z',
          },
        ],
        purchase_order_number: null,
        serial_number: null,
        system_id: '65328f34a40ff5301575a4e3',
        usage_status_id: '2',
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
        isDefective: 'Y{arrowdown}{enter}',
        usageStatus: 'U{arrowdown}{arrowdown}{enter}',
      });

      await user.click(screen.getByRole('button', { name: 'Next' }));

      await modifyPropertiesValues({
        resolution: '12',
        frameRate: '60',
        sensorType: 'IO',
        sensorBrand: 'pixel',
        broken: 'T{arrowdown}{enter}',
        older: 'F{arrowdown}{enter}',
      });

      await user.click(screen.getByRole('button', { name: 'Next' }));

      await modifySystemValue({
        system: 'Giant laser',
      });

      await user.click(screen.getByRole('button', { name: 'Finish' }));

      expect(axiosPostSpy).toHaveBeenCalledWith('/v1/items', {
        asset_number: 'test43',
        catalogue_item_id: '1',
        delivered_date: '2045-09-23T00:00:00.000Z',
        is_defective: true,
        notes: 'test',
        properties: [
          { id: '1', value: 12 },
          { id: '2', value: 60 },
          { id: '3', value: 'IO' },
          { id: '4', value: 'pixel' },
          { id: '5', value: true },
          { id: '6', value: false },
        ],
        purchase_order_number: 'test21',
        serial_number: 'test12',
        system_id: '65328f34a40ff5301575a4e3',
        usage_status_id: '2',
        warranty_end_date: '2035-02-17T00:00:00.000Z',
      });
    }, 10000);

    it('displays an error message if a step is disabled and clears the errors until the finish button is enabled', async () => {
      createView();

      await modifyDetailsValues({
        serialNumber: 'test12',
        assetNumber: 'test43',
        purchaseOrderNumber: 'test21',
        notes: 'test',
        warrantyEndDate: '17/02/',
        deliveredDate: '23/09/',
        isDefective: 'Y{arrowdown}{enter}',
        usageStatus: 'U{arrowdown}{arrowdown}{enter}',
      });

      expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
      expect(screen.getByText('Invalid item details')).toBeInTheDocument();

      await user.click(screen.getByText('Add item properties'));

      await modifyPropertiesValues({
        resolution: 'ds',
      });

      await user.click(screen.getByRole('button', { name: 'Next' }));
      expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
      expect(screen.getByText('Invalid item properties')).toBeInTheDocument();

      await user.click(screen.getByText('Place into a system'));

      await modifySystemValue({
        system: 'Giant laser',
      });

      expect(screen.getByRole('button', { name: 'Finish' })).toBeDisabled();

      await user.click(screen.getByText('Add item properties'));

      await modifyPropertiesValues({
        resolution: '12',
      });

      await user.click(screen.getByRole('button', { name: 'Next' }));

      expect(screen.getByRole('button', { name: 'Finish' })).toBeDisabled();

      await user.click(screen.getByText('Add item details'));
      await modifyDetailsValues({
        warrantyEndDate: '17/02/2000',
        deliveredDate: '23/09/2000',
      });

      await user.click(screen.getByRole('button', { name: 'Next' }));
      await user.click(screen.getByRole('button', { name: 'Next' }));
      expect(screen.getByRole('button', { name: 'Finish' })).not.toBeDisabled();
    }, 10000);

    it('displays error messages for serial number advanced options', async () => {
      createView();
      await modifyDetailsValues({
        serialNumberAdvancedOptions: { startingValue: '10' },
      });

      expect(
        screen.getByText('Please enter a quantity value')
      ).toBeInTheDocument();

      await user.click(screen.getByText('Close advanced options'));
      await modifyDetailsValues({
        serialNumberAdvancedOptions: { quantity: '10a', startingValue: '10a' },
      });

      expect(screen.getAllByText('Please enter a valid number').length).toEqual(
        2
      );

      await user.click(screen.getByText('Close advanced options'));
      await modifyDetailsValues({
        serialNumberAdvancedOptions: {
          quantity: '10.5',
          startingValue: '10.5',
        },
      });

      expect(
        screen.getByText('Quantity must be an integer')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Starting value must be an integer')
      ).toBeInTheDocument();

      await user.click(screen.getByText('Close advanced options'));
      await modifyDetailsValues({
        serialNumberAdvancedOptions: {
          quantity: '-1',
          startingValue: '-1',
        },
      });

      expect(
        screen.getByText('Quantity must be greater than 1')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Starting value must be greater than or equal to 0')
      ).toBeInTheDocument();

      await user.click(screen.getByText('Close advanced options'));
      await modifyDetailsValues({
        serialNumberAdvancedOptions: {
          quantity: '100',
          startingValue: '2',
        },
      });

      expect(
        screen.getByText('Quantity must be less than 100')
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          'Please use %s to specify the location you want to append the number to serial number'
        )
      ).toBeInTheDocument();

      await user.click(screen.getByText('Close advanced options'));
      await modifyDetailsValues({
        serialNumber: 'test %s',
        serialNumberAdvancedOptions: {
          quantity: '4',
          startingValue: '2',
        },
      });

      expect(screen.getByText('e.g. test 2')).toBeInTheDocument();

      await user.clear(screen.getByLabelText('Quantity'));
      await user.clear(screen.getByLabelText('Starting value'));
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
        isDefective: 'Y{arrowdown}{enter}',
        usageStatus: 'U{arrowdown}{arrowdown}{enter}',
      });

      await user.click(screen.getByRole('button', { name: 'Next' }));

      await modifyPropertiesValues({
        resolution: '12',
        frameRate: '60',
        sensorType: 'IO',
        sensorBrand: 'pixel',
        broken: 'F{arrowdown}{enter}',
        older: 'T{arrowdown}{enter}',
      });

      await user.click(screen.getByRole('button', { name: 'Next' }));

      await modifySystemValue({
        system: 'Giant laser',
      });

      await user.click(screen.getByRole('button', { name: 'Finish' }));

      expect(axiosPostSpy).toHaveBeenCalledWith('/v1/items', {
        asset_number: 'test43',
        catalogue_item_id: '1',
        delivered_date: '2045-09-23T00:00:00.000Z',
        is_defective: true,
        notes: 'test',
        properties: [
          { id: '1', value: 12 },
          { id: '2', value: 60 },
          { id: '3', value: 'IO' },
          { id: '4', value: 'pixel' },
          { id: '5', value: false },
          { id: '6', value: true },
        ],
        purchase_order_number: 'test21',
        serial_number: null,
        system_id: '65328f34a40ff5301575a4e3',
        usage_status_id: '2',
        warranty_end_date: '2035-02-17T00:00:00.000Z',
      });
    }, 10000);

    it('displays error message when usage status not selected', async () => {
      createView();

      await user.click(screen.getByRole('button', { name: 'Next' }));

      expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
      expect(screen.getByText('Invalid item details')).toBeInTheDocument();
      expect(
        screen.getByText('Please select a Usage Status')
      ).toBeInTheDocument();

      await modifyDetailsValues({
        usageStatus: 'U{arrowdown}{arrowdown}{enter}',
      });

      expect(screen.queryByRole('button', { name: 'Next' })).not.toBeDisabled();
      expect(
        screen.queryByText('Invalid item details')
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText('Please select a Usage Status')
      ).not.toBeInTheDocument();
    });

    it('displays error message when mandatory property values missing', async () => {
      createView();

      await modifyDetailsValues({
        serialNumber: '   ',
        assetNumber: 'test43',
        purchaseOrderNumber: 'test21',
        notes: 'test',
        warrantyEndDate: '17/02/2035',
        deliveredDate: '23/09/2045',
        isDefective: 'Y{arrowdown}{enter}',
        usageStatus: 'U{arrowdown}{arrowdown}{enter}',
      });

      await user.click(screen.getByRole('button', { name: 'Next' }));

      await modifyPropertiesValues({
        resolution: '',
        sensorType: '',
        broken: '{delete}',
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
        broken: 'F{arrowdown}{enter}',
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
        isDefective: 'Y{arrowdown}{enter}',
        usageStatus: 'U{arrowdown}{arrowdown}{enter}',
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

    it('displays error message when mandatory property with allowed values is missing', async () => {
      props = {
        ...props,
        catalogueCategory: getCatalogueCategoryById('12'),
        catalogueItem: getCatalogueItemById('17'),
      };
      createView();

      await modifyDetailsValues({
        usageStatus: 'U{arrowdown}{arrowdown}{enter}',
      });

      await user.click(screen.getByRole('button', { name: 'Next' }));

      const pumpingSpeedAutoComplete = screen.getAllByRole('combobox')[0];
      await user.type(pumpingSpeedAutoComplete, '{delete}');

      await user.click(screen.getByRole('button', { name: 'Next' }));

      const mandatoryFieldHelperText = screen.getByText(
        'Please enter a valid value as this field is mandatory'
      );

      expect(mandatoryFieldHelperText).toBeInTheDocument();

      expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();

      await user.type(pumpingSpeedAutoComplete, '4{arrowdown}{enter}');

      expect(mandatoryFieldHelperText).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Next' })).not.toBeDisabled();
    });

    it('displays warning message when an unknown error occurs', async () => {
      createView();
      await modifyDetailsValues({
        serialNumber: 'Error 500',
        usageStatus: 'U{arrowdown}{arrowdown}{enter}',
      });
      await user.click(screen.getByRole('button', { name: 'Next' }));
      await user.click(screen.getByRole('button', { name: 'Next' }));
      await modifySystemValue({
        system: 'Giant laser',
      });
      await user.click(screen.getByRole('button', { name: 'Finish' }));
      expect(handleIMS_APIError).toHaveBeenCalled();
      expect(onClose).not.toHaveBeenCalled();
    });

    it('save as an item', async () => {
      props.selectedItem = getItemById('G463gOIA');
      props.type = 'save as';
      createView();

      await user.click(screen.getByRole('button', { name: 'Next' }));
      await user.click(screen.getByRole('button', { name: 'Next' }));
      await user.click(screen.getByRole('button', { name: 'Finish' }));

      expect(axiosPostSpy).toHaveBeenCalledWith('/v1/items', {
        asset_number: '03MXnOfP5C',
        catalogue_item_id: '1',
        delivered_date: '2023-05-11T23:00:00.000Z',
        is_defective: false,
        notes: 'rRXBHQFbF3zts6XS279k',
        properties: [
          { id: '1', value: 12 },
          { id: '2', value: 30 },
          { id: '3', value: 'CMOS' },
          { id: '4', value: null },
          { id: '5', value: true },
          { id: '6', value: false },
        ],
        purchase_order_number: 'tIWiCOow',
        serial_number: 'vYs9Vxx6yWbn',
        system_id: '656ef565ed0773f82e44bc6d',
        usage_status_id: '2',
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
  });
  describe('Edit Item', () => {
    let axiosPatchSpy;

    beforeEach(() => {
      axiosPatchSpy = vi.spyOn(imsApi, 'patch');
      props.selectedItem = getItemById('G463gOIA');
      props.type = 'edit';
    });

    it('disables finish button and shows circular progress indicator when request is pending', async () => {
      server.use(
        http.patch('/v1/items/:id', () => {
          return new Promise(() => {});
        })
      );

      createView();

      await modifyDetailsValues({
        serialNumber: 'test12',
      });

      //navigate through stepper
      await user.click(screen.getByRole('button', { name: 'Next' }));
      await user.click(screen.getByRole('button', { name: 'Next' }));

      const finishButton = screen.getByRole('button', { name: 'Finish' });
      await user.click(finishButton);

      expect(finishButton).toBeDisabled();
      expect(await screen.findByRole('progressbar')).toBeInTheDocument();
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
        isDefective: 'Y{arrowdown}{enter}',
        usageStatus: 'U{enter}',
      });

      await user.click(screen.getByRole('button', { name: 'Next' }));

      await modifyPropertiesValues({
        resolution: '12',
        frameRate: '60',
        sensorType: 'IO',
        sensorBrand: 'pixel',
        broken: 'T{arrowdown}{enter}',
        older: 'F{arrowdown}{enter}',
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
          { id: '1', value: 12 },
          { id: '2', value: 60 },
          { id: '3', value: 'IO' },
          { id: '4', value: 'pixel' },
          { id: '5', value: true },
          { id: '6', value: false },
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

      await user.click(screen.getByText('Edit item properties'));

      fireEvent.change(
        screen.getByLabelText('Ultimate Pressure (millibar) *'),
        {
          target: { value: '10' },
        }
      );

      const pumpingSpeedAutoComplete = screen.getAllByRole('combobox')[0];
      await user.type(pumpingSpeedAutoComplete, '4{arrowdown}{enter}');

      const axisAutocomplete = screen.getAllByRole('combobox')[1];
      await user.type(axisAutocomplete, 'z{arrowdown}{enter}');

      await user.click(screen.getByRole('button', { name: 'Next' }));

      await user.click(screen.getByRole('button', { name: 'Finish' }));
      expect(axiosPatchSpy).toHaveBeenCalledWith('/v1/items/G463gOIA', {
        properties: [
          { id: '17', value: 400 },
          { id: '18', value: 10 },
          {
            id: '19',
            value: 'z',
          },
        ],
      });
    });

    it('edits an item where the item property has an allowed list of values (optional)', async () => {
      props = {
        ...props,
        catalogueCategory: getCatalogueCategoryById('12'),
        catalogueItem: getCatalogueItemById('17'),
      };
      createView();

      await user.click(screen.getByText('Edit item properties'));

      fireEvent.change(
        screen.getByLabelText('Ultimate Pressure (millibar) *'),
        {
          target: { value: '10' },
        }
      );

      const pumpingSpeedAutoComplete = screen.getAllByRole('combobox')[0];
      await user.type(pumpingSpeedAutoComplete, '4{arrowdown}{enter}');

      const axisAutocomplete = screen.getAllByRole('combobox')[1];
      await user.type(axisAutocomplete, 'N{enter}');

      await user.click(screen.getByRole('button', { name: 'Next' }));

      await user.click(screen.getByRole('button', { name: 'Finish' }));
      expect(axiosPatchSpy).toHaveBeenCalledWith('/v1/items/G463gOIA', {
        properties: [
          { id: '17', value: 400 },
          { id: '18', value: 10 },
          {
            id: '19',
            value: null,
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
        isDefective: 'Y{arrowdown}{enter}',
        usageStatus: 'U{arrowdown}{arrowdown}{enter}',
      });

      await user.click(screen.getByRole('button', { name: 'Next' }));

      await modifyPropertiesValues({
        resolution: 'rwererw',
        sensorType: '',
        broken: 'N{arrowdown}{enter}',
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

    it('displays warning message when an unknown error occurs', async () => {
      createView();
      await modifyDetailsValues({
        serialNumber: 'Error 500',
      });
      await user.click(screen.getByRole('button', { name: 'Next' }));
      await user.click(screen.getByRole('button', { name: 'Next' }));
      await user.click(screen.getByRole('button', { name: 'Finish' }));

      expect(handleIMS_APIError).toHaveBeenCalled();
      expect(onClose).not.toHaveBeenCalled();
    });
  });
});
