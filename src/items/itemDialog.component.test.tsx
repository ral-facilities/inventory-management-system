import React from 'react';
import {
  getCatalogueCategoryById,
  getCatalogueItemById,
  renderComponentWithBrowserRouter,
} from '../setupTests';
import ItemDialog, { ItemDialogProps } from './itemDialog.component';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';

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
      type: 'add',
      catalogueCategory: getCatalogueCategoryById('4'),
      catalogueItem: getCatalogueItemById('1'),
    };
    user = userEvent.setup();
  });

  const modifyValues = async (values: {
    serialNumber?: string;
    assetNumber?: string;
    purchaseOrderNumber?: string;
    warrantyEndDate?: string;
    deliveredDate?: string;
    isDefective?: string;
    notes?: string;
    resolution?: string;
    frameRate?: string;
    sensorType?: string;
    sensorBrand?: string;
    broken?: string;
    older?: string;
    usageStatus?: string;
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
      fireEvent.change(screen.getByLabelText('Warranty end date'), {
        target: { value: values.warrantyEndDate },
      });

    values.deliveredDate !== undefined &&
      fireEvent.change(screen.getByLabelText('Delivered date'), {
        target: { value: values.deliveredDate },
      });

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

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Add Item', () => {
    let axiosPostSpy;

    beforeEach(() => {
      axiosPostSpy = jest.spyOn(axios, 'post');
    });

    it('adds a item with just the default values', async () => {
      createView();
      const saveButton = screen.getByRole('button', { name: 'Save' });
      await user.click(saveButton);
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
          { name: 'Broken', value: true },
          { name: 'Older than five years', value: false },
        ],
        purchase_order_number: null,
        serial_number: null,
        system_id: null,
        usage_status: 0,
        warranty_end_date: null,
      });
    });

    it('adds a item (all input vales)', async () => {
      createView();
      await modifyValues({
        serialNumber: 'test12',
        assetNumber: 'test43',
        purchaseOrderNumber: 'test21',
        notes: 'test',
        warrantyEndDate: '17/02/2035',
        deliveredDate: '23/09/2045',
        isDefective: 'Yes',
        usageStatus: 'Used',
        resolution: '12',
        frameRate: '60',
        sensorType: 'IO',
        sensorBrand: 'pixel',
        broken: 'True',
        older: 'False',
      });
      const saveButton = screen.getByRole('button', { name: 'Save' });
      await user.click(saveButton);
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
        system_id: null,
        usage_status: 2,
        warranty_end_date: '2035-02-17T00:00:00.000Z',
      });
    });

    it('adds a item (case empty string with spaces returns null and chnage propetery boolean values)', async () => {
      createView();
      await modifyValues({
        serialNumber: '   ',
        assetNumber: 'test43',
        purchaseOrderNumber: 'test21',
        notes: 'test',
        warrantyEndDate: '17/02/2035',
        deliveredDate: '23/09/2045',
        isDefective: 'Yes',
        usageStatus: 'Used',
        resolution: '12',
        frameRate: '60',
        sensorType: 'IO',
        sensorBrand: 'pixel',
        broken: 'False',
        older: 'True',
      });
      const saveButton = screen.getByRole('button', { name: 'Save' });
      await user.click(saveButton);
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
        system_id: null,
        usage_status: 2,
        warranty_end_date: '2035-02-17T00:00:00.000Z',
      });
    });

    it('displays error message when mandatory property values missing', async () => {
      createView();
      await modifyValues({
        serialNumber: '   ',
        assetNumber: 'test43',
        purchaseOrderNumber: 'test21',
        notes: 'test',
        warrantyEndDate: '17/02/2035',
        deliveredDate: '23/09/2045',
        isDefective: 'Yes',
        usageStatus: 'Used',
        resolution: '',
        sensorType: '',
        broken: 'None',
      });
      const saveButton = screen.getByRole('button', { name: 'Save' });
      await user.click(saveButton);
      const mandatoryFieldHelperText = screen.getAllByText(
        'This field is mandatory'
      );

      const mandatoryFieldBooleanHelperText = screen.getByText(
        'Please select either True or False'
      );

      expect(mandatoryFieldBooleanHelperText).toBeInTheDocument();
      expect(mandatoryFieldHelperText.length).toBe(2);
    });

    it('displays error message when property values type is incorrect', async () => {
      createView();
      await modifyValues({
        serialNumber: '   ',
        assetNumber: 'test43',
        purchaseOrderNumber: 'test21',
        notes: 'test',
        warrantyEndDate: '17/02/2035',
        deliveredDate: '23/09/2045',
        isDefective: 'Yes',
        usageStatus: 'Used',
        resolution: 'rwererw',
        sensorType: '',
        broken: 'None',
      });
      const saveButton = screen.getByRole('button', { name: 'Save' });
      await user.click(saveButton);

      const validNumberHelperText = screen.getByText(
        'Please enter a valid number'
      );
      expect(validNumberHelperText).toBeInTheDocument();
    });

    it('displays warning message when an unknown error occurs', async () => {
      createView();
      await modifyValues({
        serialNumber: 'error',
      });
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
});
