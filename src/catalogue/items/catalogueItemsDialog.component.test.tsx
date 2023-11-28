import React from 'react';
import axios from 'axios';
import {
  renderComponentWithBrowserRouter,
  getCatalogueCategoryById,
  getCatalogueItemById,
} from '../../setupTests';
import {
  act,
  fireEvent,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CatalogueItemsDialog, {
  CatalogueItemsDialogProps,
} from './catalogueItemsDialog.component';
jest.setTimeout(10000); //multiple long running tests
describe('Catalogue Items Dialog', () => {
  let props: CatalogueItemsDialogProps;
  let user;
  let axiosPostSpy;
  const onClose = jest.fn();

  const createView = () => {
    return renderComponentWithBrowserRouter(
      <CatalogueItemsDialog {...props} />
    );
  };

  beforeEach(() => {
    props = {
      open: true,
      onClose: onClose,
      parentInfo: undefined,
      type: 'create',
    };

    user = userEvent.setup();
    axiosPostSpy = jest.spyOn(axios, 'post');
  });
  const modifyValues = (values: {
    name?: string;
    description?: string;
    costGbp?: string;
    costToReworkGbp?: string;
    daysToReplace?: string;
    daysToRework?: string;
    drawingNumber?: string;
    drawingLink?: string;
    itemModelNumber?: string;
    resolution?: string;
    frameRate?: string;
    sensorType?: string;
    sensorBrand?: string;
    broken?: string;
    older?: string;
  }) => {
    values.name !== undefined &&
      fireEvent.change(screen.getByLabelText('Name *'), {
        target: { value: values.name },
      });

    values.description !== undefined &&
      fireEvent.change(screen.getByLabelText('Description'), {
        target: { value: values.description },
      });

    values.costGbp !== undefined &&
      fireEvent.change(screen.getByLabelText('Cost (£) *'), {
        target: { value: values.costGbp },
      });

    values.costToReworkGbp !== undefined &&
      fireEvent.change(screen.getByLabelText('Cost to rework (£)'), {
        target: { value: values.costToReworkGbp },
      });

    values.daysToReplace !== undefined &&
      fireEvent.change(screen.getByLabelText('Time to replace (days) *'), {
        target: { value: values.daysToReplace },
      });

    values.daysToRework !== undefined &&
      fireEvent.change(screen.getByLabelText('Time to rework (days)'), {
        target: { value: values.daysToRework },
      });

    values.drawingNumber !== undefined &&
      fireEvent.change(screen.getByLabelText('Drawing number'), {
        target: { value: values.drawingNumber },
      });

    values.drawingLink !== undefined &&
      fireEvent.change(screen.getByLabelText('Drawing link'), {
        target: { value: values.drawingLink },
      });

    values.itemModelNumber !== undefined &&
      fireEvent.change(screen.getByLabelText('Model number'), {
        target: { value: values.itemModelNumber },
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
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders text correctly', async () => {
    props.parentInfo = getCatalogueCategoryById('4');

    let baseElement;
    await act(async () => {
      baseElement = createView().baseElement;
    });
    expect(baseElement).toMatchSnapshot();
  });

  it('adds a catalogue item', async () => {
    props = {
      ...props,
      parentInfo: getCatalogueCategoryById('4'),
    };

    createView();

    modifyValues({
      costGbp: '1200',
      costToReworkGbp: '400',
      daysToReplace: '20',
      daysToRework: '2',
      description: '',
      drawingLink: 'https://example.com',
      drawingNumber: 'mk4324',
      itemModelNumber: 'mk4324',
      name: 'test',
      resolution: '12',
      frameRate: '60',
      sensorType: 'IO',
      sensorBrand: 'pixel',
      broken: 'True',
      older: 'False',
    });

    const manufacturerPopup = screen.getAllByRole('combobox')[0];
    await user.type(manufacturerPopup, 'M{arrowdown}{enter}');
    const saveButton = screen.getByRole('button', { name: 'Save' });
    await user.click(saveButton);

    expect(axiosPostSpy).toHaveBeenCalledWith('/v1/catalogue-items/', {
      catalogue_category_id: '4',
      cost_gbp: 1200,
      cost_to_rework_gbp: 400,
      days_to_replace: 20,
      days_to_rework: 2,
      description: null,
      drawing_link: 'https://example.com',
      drawing_number: 'mk4324',
      is_obsolete: false,
      manufacturer_id: '1',
      item_model_number: 'mk4324',
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
      parentInfo: getCatalogueCategoryById('4'),
    };

    createView();

    modifyValues({
      costGbp: '200',
      daysToReplace: '5',
      name: 'test',
      resolution: '12',
      sensorType: 'IO',
      broken: 'True',
    });

    const manufacturerPopup = screen.getAllByRole('combobox')[0];
    await user.type(manufacturerPopup, 'Man{arrowdown}{enter}');

    const saveButton = screen.getByRole('button', { name: 'Save' });

    await user.click(saveButton);

    expect(axiosPostSpy).toHaveBeenCalledWith('/v1/catalogue-items/', {
      catalogue_category_id: '4',
      cost_gbp: 200,
      cost_to_rework_gbp: null,
      days_to_replace: 5,
      days_to_rework: null,
      description: null,
      drawing_link: null,
      drawing_number: null,
      is_obsolete: false,
      manufacturer_id: '1',
      item_model_number: null,
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

  it('display error message when mandatory field is not filled in', async () => {
    props = {
      ...props,
      parentInfo: getCatalogueCategoryById('4'),
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
      screen.getByText('Please chose a manufacturer, or add a new manufacturer')
    ).toBeInTheDocument();
  });
  it('display error message when invalid number format', async () => {
    props = {
      ...props,
      parentInfo: getCatalogueCategoryById('4'),
    };

    createView();

    modifyValues({
      costGbp: '1200a',
      costToReworkGbp: '400a',
      daysToReplace: '20a',
      daysToRework: '2a',
      description: '',
      drawingLink: 'example.com',
      drawingNumber: 'mk4324',
      itemModelNumber: 'mk4324',
      name: 'test',
      resolution: '12a',
      frameRate: '60a',
      sensorType: 'IO',
      sensorBrand: 'pixel',
      broken: 'True',
      older: 'False',
    });

    const manufacturerPopup = screen.getAllByRole('combobox')[0];
    await user.type(manufacturerPopup, 'Man{arrowdown}{enter}');

    const saveButton = screen.getByRole('button', { name: 'Save' });

    await user.click(saveButton);

    const validNumberHelperText = screen.getAllByText(
      'Please enter a valid number'
    );

    expect(validNumberHelperText.length).toBe(6);
    expect(validNumberHelperText[0]).toHaveTextContent(
      'Please enter a valid number'
    );

    expect(
      screen.getByText(
        'Please enter a valid Drawing link. Only "http://" and "https://" links with typical top-level domain are accepted'
      )
    ).toBeInTheDocument();
  });

  it('displays warning message when an unknown error occurs', async () => {
    props = {
      ...props,
      parentInfo: getCatalogueCategoryById('4'),
    };
    createView();

    modifyValues({
      costGbp: '1200',
      costToReworkGbp: '400',
      daysToReplace: '20',
      daysToRework: '2',
      description: '',
      drawingLink: 'https://example.com',
      drawingNumber: 'mk4324',
      itemModelNumber: 'mk4324',
      name: 'Error 500',
      resolution: '12',
      frameRate: '60',
      sensorType: 'IO',
      sensorBrand: 'pixel',
      broken: 'True',
      older: 'False',
    });

    const manufacturerPopup = screen.getAllByRole('combobox')[0];
    await user.type(manufacturerPopup, 'Man{arrowdown}{enter}');

    const saveButton = screen.getByRole('button', { name: 'Save' });
    await user.click(saveButton);

    await waitFor(() => {
      expect(
        screen.getByText('Please refresh and try again')
      ).toBeInTheDocument();
    });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('opens add manufacturer dialog and returns back to catalogue item dialog', async () => {
    props = {
      ...props,
      parentInfo: getCatalogueCategoryById('4'),
    };
    createView();

    const addManufacturerButton = screen.getByRole('button', {
      name: 'add manufacturer',
    });
    await user.click(addManufacturerButton);

    expect(screen.getByText('Add Manufacturer')).toBeInTheDocument();

    const closeButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(closeButton);

    expect(screen.getByText('Add Catalogue Item')).toBeInTheDocument();
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
        parentInfo: getCatalogueCategoryById('4'),
        selectedCatalogueItem: getCatalogueItemById('1'),
      };

      createView();

      modifyValues({
        costGbp: '687',
        costToReworkGbp: '89',
        daysToReplace: '78',
        daysToRework: '68',
        description: ' ',
        drawingLink: 'http://example.com',
        drawingNumber: 'test',
        itemModelNumber: 'test1',
        name: 'test',
      });

      const manufacturerPopup = screen.getAllByRole('combobox')[0];
      await user.type(manufacturerPopup, 'Man{arrowdown}{arrowdown}{enter}');

      const saveButton = screen.getByRole('button', { name: 'Save' });

      await user.click(saveButton);

      expect(axiosPatchSpy).toHaveBeenCalledWith('/v1/catalogue-items/1', {
        cost_gbp: 687,
        cost_to_rework_gbp: 89,
        days_to_replace: 78,
        days_to_rework: 68,
        description: null,
        drawing_link: 'http://example.com',
        drawing_number: 'test',
        item_model_number: 'test1',
        name: 'test',
        manufacturer_id: '3',
      });

      expect(onClose).toHaveBeenCalled();
    });

    it('display error message when mandatory field is not filled in', async () => {
      props = {
        ...props,
        parentInfo: getCatalogueCategoryById('4'),
        selectedCatalogueItem: getCatalogueItemById('1'),
      };

      createView();

      modifyValues({
        costGbp: '',
        costToReworkGbp: '',
        daysToReplace: '',
        daysToRework: '',
        description: '',
        drawingLink: '',
        drawingNumber: '',
        itemModelNumber: '',
        name: '',
        resolution: '',
        frameRate: '',
        sensorType: '',
        sensorBrand: '',
        broken: 'None',
        older: 'None',
      });

      const manufacturerPopup = screen.getAllByRole('combobox')[0];
      await user.type(manufacturerPopup, '{delete}');

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
        screen.getByText(
          'Please chose a manufacturer, or add a new manufacturer'
        )
      ).toBeInTheDocument();
    });

    it('Edit a catalogue item (catalogue properties)', async () => {
      props = {
        ...props,
        parentInfo: getCatalogueCategoryById('4'),
        selectedCatalogueItem: getCatalogueItemById('1'),
      };

      createView();
      modifyValues({
        resolution: '24',
        frameRate: '240',
        sensorType: 'CCD',
        sensorBrand: 'Nikon',
        broken: 'True',
        older: 'True',
      });
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

    it('Edit a catalogue item (manufacturer)', async () => {
      props = {
        ...props,
        parentInfo: getCatalogueCategoryById('4'),
        selectedCatalogueItem: getCatalogueItemById('1'),
      };

      createView();

      const manufacturerPopup = screen.getAllByRole('combobox')[0];
      await user.type(manufacturerPopup, 'Man{arrowdown}{arrowdown}{enter}');
      const saveButton = screen.getByRole('button', { name: 'Save' });

      await user.click(saveButton);
      expect(axiosPatchSpy).toHaveBeenCalledWith('/v1/catalogue-items/1', {
        manufacturer_id: '3',
      });

      expect(onClose).toHaveBeenCalled();
    });

    it('displays error message if no values have been changed', async () => {
      props = {
        ...props,
        parentInfo: getCatalogueCategoryById('4'),
        selectedCatalogueItem: getCatalogueItemById('1'),
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

    it('displays error message if no fields have been changed (when they are no catalogue property fields)', async () => {
      props = {
        ...props,
        parentInfo: getCatalogueCategoryById('17'),

        selectedCatalogueItem: {
          ...getCatalogueItemById('1'),
          properties: [],
        },
      };

      createView();

      const saveButton = screen.getByRole('button', { name: 'Save' });

      await user.click(saveButton);

      await waitFor(() => {
        expect(
          screen.getByText('Please edit a form entry before clicking save')
        ).toBeInTheDocument();
      });
    });

    it('displays error message if catalogue item has children elements', async () => {
      props = {
        ...props,
        parentInfo: getCatalogueCategoryById('4'),
        selectedCatalogueItem: getCatalogueItemById('1'),
      };

      createView();

      modifyValues({
        name: 'test_has_children_elements',
      });

      const saveButton = screen.getByRole('button', { name: 'Save' });

      await user.click(saveButton);
      expect(axiosPatchSpy).toHaveBeenCalledWith('/v1/catalogue-items/1', {
        name: 'test_has_children_elements',
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
        parentInfo: getCatalogueCategoryById('4'),
        selectedCatalogueItem: getCatalogueItemById('1'),
      };
      createView();

      modifyValues({
        name: 'Error 500',
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
