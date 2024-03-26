import {
  act,
  fireEvent,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import {
  getCatalogueCategoryById,
  getCatalogueItemById,
  renderComponentWithBrowserRouter,
} from '../../testUtils';
import CatalogueItemsDialog, {
  CatalogueItemsDialogProps,
} from './catalogueItemsDialog.component';

import { imsApi } from '../../api/api';
import handleIMS_APIError from '../../handleIMS_APIError';

vi.mock('../../handleIMS_APIError');

describe('Catalogue Items Dialog', () => {
  let props: CatalogueItemsDialogProps;
  let user: UserEvent;
  let axiosPostSpy;
  const onClose = vi.fn();

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
    axiosPostSpy = vi.spyOn(imsApi, 'post');
  });
  const modifyValues = async (values: {
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
    manufacturer?: string;
    notes?: string;
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

    if (values.manufacturer !== undefined) {
      const manufacturerPopup = screen.getAllByRole('combobox')[0];
      await user.type(manufacturerPopup, values.manufacturer);
    }

    values.notes !== undefined &&
      fireEvent.change(screen.getByLabelText('Notes'), {
        target: { value: values.notes },
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
    vi.clearAllMocks();
  });

  it('renders details step correctly', async () => {
    props.parentInfo = getCatalogueCategoryById('4');

    let baseElement;
    await act(async () => {
      baseElement = createView().baseElement;
    });
    expect(baseElement).toMatchSnapshot();
  });

  it('renders properties step correctly', async () => {
    props.parentInfo = getCatalogueCategoryById('4');

    let baseElement;
    await act(async () => {
      baseElement = createView().baseElement;
    });

    await user.click(screen.getByText('Add catalogue item properties'));
    expect(baseElement).toMatchSnapshot();
  });

  it('adds a catalogue item', async () => {
    props = {
      ...props,
      parentInfo: getCatalogueCategoryById('4'),
    };

    createView();

    await modifyValues({
      costGbp: '1200',
      costToReworkGbp: '400',
      daysToReplace: '20',
      daysToRework: '2',
      description: '',
      drawingLink: 'https://example.com',
      drawingNumber: 'mk4324',
      itemModelNumber: 'mk4324',
      name: 'test',
      manufacturer: 'Man{arrowdown}{enter}',
      notes: 'Test note',
    });

    await user.click(screen.getByRole('button', { name: 'Next' }));

    await modifyValues({
      resolution: '12',
      frameRate: '60',
      sensorType: 'IO',
      sensorBrand: 'pixel',
      broken: 'True',
      older: 'False',
    });

    await user.click(screen.getByRole('button', { name: 'Finish' }));

    expect(axiosPostSpy).toHaveBeenCalledWith('/v1/catalogue-items', {
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
      notes: 'Test note',
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
  }, 10000);

  it('adds a catalogue item where the catalogue item property has an allowed list of values', async () => {
    props = {
      ...props,
      parentInfo: getCatalogueCategoryById('12'),
    };

    createView();

    await modifyValues({
      costGbp: '1200',
      costToReworkGbp: '400',
      daysToReplace: '20',
      daysToRework: '2',
      description: '',
      drawingLink: 'https://example.com',
      drawingNumber: 'mk4324',
      itemModelNumber: 'mk4324',
      name: 'test',
      manufacturer: 'Man{arrowdown}{enter}',
    });

    await user.click(screen.getByRole('button', { name: 'Next' }));

    fireEvent.change(screen.getByLabelText('Ultimate Pressure (millibar) *'), {
      target: { value: '10' },
    });

    fireEvent.mouseDown(screen.getByLabelText('Pumping Speed *'));
    fireEvent.click(within(screen.getByRole('listbox')).getByText('400'));

    fireEvent.mouseDown(screen.getByLabelText('Axis'));
    fireEvent.click(within(screen.getByRole('listbox')).getByText('y'));

    await user.click(screen.getByRole('button', { name: 'Finish' }));

    expect(axiosPostSpy).toHaveBeenCalledWith('/v1/catalogue-items', {
      catalogue_category_id: '12',
      cost_gbp: 1200,
      cost_to_rework_gbp: 400,
      days_to_replace: 20,
      days_to_rework: 2,
      description: null,
      drawing_link: 'https://example.com',
      drawing_number: 'mk4324',
      is_obsolete: false,
      item_model_number: 'mk4324',
      notes: null,
      manufacturer_id: '1',
      name: 'test',
      obsolete_reason: null,
      obsolete_replacement_catalogue_item_id: null,
      properties: [
        { name: 'Pumping Speed', value: 400 },
        { name: 'Ultimate Pressure', value: 10 },
        {
          name: 'Axis',
          value: 'y',
        },
      ],
    });
  }, 10000);

  it('displays an error message if a step has errored and clears the errors until the finish button is enabled', async () => {
    props = {
      ...props,
      parentInfo: getCatalogueCategoryById('4'),
    };

    createView();
    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
    expect(screen.getByText('Invalid details')).toBeInTheDocument();

    await user.click(screen.getByText('Add catalogue item properties'));
    expect(screen.getByRole('button', { name: 'Finish' })).toBeDisabled();

    await user.click(screen.getByText('Add catalogue item details'));
    await modifyValues({
      costGbp: '1200',
      costToReworkGbp: '400',
      daysToReplace: '20',
      daysToRework: '2',
      description: '',
      drawingLink: 'https://example.com',
      drawingNumber: 'mk4324',
      itemModelNumber: 'mk4324',
      name: 'test',
      manufacturer: 'Man{arrowdown}{enter}',
    });

    await user.click(screen.getByRole('button', { name: 'Next' }));
    await user.click(screen.getByRole('button', { name: 'Finish' }));

    expect(screen.getByRole('button', { name: 'Finish' })).toBeDisabled();

    await modifyValues({
      resolution: '12',
      frameRate: '60',
      sensorType: 'IO',
      sensorBrand: 'pixel',
      broken: 'True',
      older: 'False',
    });
    expect(screen.getByRole('button', { name: 'Finish' })).not.toBeDisabled();
  }, 10000);

  it('displays an error if a mandatory catalogue item property is not defined (allowed list of values )', async () => {
    props = {
      ...props,
      parentInfo: getCatalogueCategoryById('12'),
    };

    createView();

    await modifyValues({
      costGbp: '1200',
      costToReworkGbp: '400',
      daysToReplace: '20',
      daysToRework: '2',
      description: '',
      drawingLink: 'https://example.com',
      drawingNumber: 'mk4324',
      itemModelNumber: 'mk4324',
      name: 'test',
      manufacturer: 'Man{arrowdown}{enter}',
    });

    await user.click(screen.getByRole('button', { name: 'Next' }));

    fireEvent.change(screen.getByLabelText('Ultimate Pressure (millibar) *'), {
      target: { value: '10' },
    });

    await user.click(screen.getByRole('button', { name: 'Finish' }));

    const mandatoryFieldHelperText = screen.getAllByText(
      'Please enter a valid value as this field is mandatory'
    );

    expect(mandatoryFieldHelperText[0]).toHaveTextContent(
      'Please enter a valid value as this field is mandatory'
    );
  }, 10000);

  it('adds a catalogue item (just mandatory fields)', async () => {
    props = {
      ...props,
      parentInfo: getCatalogueCategoryById('4'),
    };

    createView();

    await modifyValues({
      costGbp: '200',
      daysToReplace: '5',
      name: 'test',
      manufacturer: 'Man{arrowdown}{enter}',
    });

    await user.click(screen.getByRole('button', { name: 'Next' }));

    await modifyValues({
      resolution: '12',
      sensorType: 'IO',
      broken: 'True',
    });

    await user.click(screen.getByRole('button', { name: 'Finish' }));

    expect(axiosPostSpy).toHaveBeenCalledWith('/v1/catalogue-items', {
      catalogue_category_id: '4',
      cost_gbp: 200,
      cost_to_rework_gbp: null,
      days_to_replace: 5,
      days_to_rework: null,
      description: null,
      drawing_link: null,
      drawing_number: null,
      is_obsolete: false,
      item_model_number: null,
      manufacturer_id: '1',
      name: 'test',
      notes: null,
      obsolete_reason: null,
      obsolete_replacement_catalogue_item_id: null,
      properties: [
        { name: 'Resolution', value: 12 },
        { name: 'Frame Rate', value: null },
        { name: 'Sensor Type', value: 'IO' },
        { name: 'Sensor brand', value: null },
        { name: 'Broken', value: true },
        { name: 'Older than five years', value: null },
      ],
    });
  });

  it('display error message when mandatory field is not filled in', async () => {
    props = {
      ...props,
      parentInfo: getCatalogueCategoryById('4'),
    };

    createView();

    await user.click(screen.getByRole('button', { name: 'Next' }));

    expect(
      screen.getByText(
        'Please choose a manufacturer, or add a new manufacturer'
      )
    ).toBeInTheDocument();

    const nameHelperText = screen.getByText('Please enter a name');
    const costHelperText = screen.getByText('Please enter a cost');
    const daysToReplaceHelperText = screen.getByText(
      'Please enter how many days it would take to replace'
    );
    expect(nameHelperText).toBeInTheDocument();
    expect(costHelperText).toBeInTheDocument();
    expect(daysToReplaceHelperText).toBeInTheDocument();

    await modifyValues({
      costGbp: '200',
      daysToReplace: '5',
      name: 'test',
      manufacturer: 'Man{arrowdown}{enter}',
    });

    await user.click(screen.getByRole('button', { name: 'Next' }));
    await user.click(screen.getByRole('button', { name: 'Finish' }));

    const mandatoryFieldHelperText = screen.getAllByText(
      'Please enter a valid value as this field is mandatory'
    );

    const mandatoryFieldBooleanHelperText = screen.getByText(
      'Please select either True or False'
    );

    expect(mandatoryFieldBooleanHelperText).toBeInTheDocument();

    expect(mandatoryFieldHelperText.length).toBe(2);
    expect(mandatoryFieldHelperText[0]).toHaveTextContent(
      'Please enter a valid value as this field is mandatory'
    );
  }, 6000);

  it('display error message when invalid number format', async () => {
    props = {
      ...props,
      parentInfo: getCatalogueCategoryById('4'),
    };

    createView();

    await modifyValues({
      costGbp: '1200a',
      costToReworkGbp: '400a',
      daysToReplace: '20a',
      daysToRework: '2a',
      description: '',
      drawingLink: 'example.com',
      drawingNumber: 'mk4324',
      itemModelNumber: 'mk4324',
      name: 'test',
      manufacturer: 'Man{arrowdown}{enter}',
    });

    await user.click(screen.getByRole('button', { name: 'Next' }));
    const validNumberDetailsHelperText = screen.getAllByText(
      'Please enter a valid number'
    );

    expect(validNumberDetailsHelperText.length).toBe(4);
    expect(validNumberDetailsHelperText[0]).toHaveTextContent(
      'Please enter a valid number'
    );

    expect(
      screen.getByText(
        'Please enter a valid Drawing link. Only "http://" and "https://" links with typical top-level domain are accepted'
      )
    ).toBeInTheDocument();

    await modifyValues({
      costGbp: '1200',
      costToReworkGbp: '400',
      daysToReplace: '20',
      daysToRework: '2',
      drawingLink: 'https://example.com',
    });

    await user.click(screen.getByRole('button', { name: 'Next' }));

    await modifyValues({
      resolution: '12a',
      frameRate: '60a',
      sensorType: 'IO',
      sensorBrand: 'pixel',
      broken: 'True',
      older: 'False',
    });

    await user.click(screen.getByRole('button', { name: 'Finish' }));

    const validNumberPropertiesHelperText = screen.getAllByText(
      'Please enter a valid number'
    );
    expect(validNumberPropertiesHelperText.length).toBe(2);
    expect(validNumberPropertiesHelperText[0]).toHaveTextContent(
      'Please enter a valid number'
    );
  }, 10000);

  it('displays warning message when an unknown error occurs', async () => {
    props = {
      ...props,
      parentInfo: getCatalogueCategoryById('4'),
    };
    createView();

    await modifyValues({
      costGbp: '1200',
      costToReworkGbp: '400',
      daysToReplace: '20',
      daysToRework: '2',
      description: '',
      drawingLink: 'https://example.com',
      drawingNumber: 'mk4324',
      itemModelNumber: 'mk4324',
      name: 'Error 500',
      manufacturer: 'Man{arrowdown}{enter}',
    });

    await user.click(screen.getByRole('button', { name: 'Next' }));

    await modifyValues({
      resolution: '12',
      frameRate: '60',
      sensorType: 'IO',
      sensorBrand: 'pixel',
      broken: 'True',
      older: 'False',
    });

    await user.click(screen.getByRole('button', { name: 'Finish' }));

    expect(handleIMS_APIError).toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  }, 10000);

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

  it('does not close dialog on background click, but does on escape key', async () => {
    createView();

    await userEvent.click(document.body);

    expect(onClose).not.toHaveBeenCalled();

    fireEvent.keyDown(screen.getByRole('dialog'), {
      key: 'Escape',
      code: 'Escape',
      keyCode: 27,
      charCode: 27,
    });

    expect(onClose).toHaveBeenCalled();
  });

  describe('Edit a catalogue item', () => {
    let axiosPatchSpy;

    beforeEach(() => {
      props = {
        ...props,
        type: 'edit',
      };

      axiosPatchSpy = vi.spyOn(imsApi, 'patch');
    });

    it('Edit a catalogue item (catalogue detail)', async () => {
      props = {
        ...props,
        parentInfo: getCatalogueCategoryById('4'),
        selectedCatalogueItem: getCatalogueItemById('1'),
      };

      createView();

      await modifyValues({
        costGbp: '687',
        costToReworkGbp: '89',
        daysToReplace: '78',
        daysToRework: '68',
        description: ' ',
        drawingLink: 'http://example.com',
        drawingNumber: 'test',
        itemModelNumber: 'test1',
        name: 'test',
        manufacturer: 'Man{arrowdown}{arrowdown}{enter}',
        notes: 'test',
      });

      await user.click(screen.getByRole('button', { name: 'Next' }));
      await user.click(screen.getByRole('button', { name: 'Finish' }));

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
        notes: 'test',
      });

      expect(onClose).toHaveBeenCalled();
    }, 10000);

    it('edits a catalogue item where the catalogue item property has an allowed list of values', async () => {
      props = {
        ...props,
        parentInfo: getCatalogueCategoryById('12'),
        selectedCatalogueItem: getCatalogueItemById('17'),
      };

      createView();
      await user.click(screen.getByRole('button', { name: 'Next' }));

      fireEvent.change(
        screen.getByLabelText('Ultimate Pressure (millibar) *'),
        {
          target: { value: '10' },
        }
      );

      fireEvent.mouseDown(screen.getByLabelText('Pumping Speed *'));
      fireEvent.click(within(screen.getByRole('listbox')).getByText('400'));

      fireEvent.mouseDown(screen.getByLabelText('Axis'));
      fireEvent.click(within(screen.getByRole('listbox')).getByText('y'));

      await user.click(screen.getByRole('button', { name: 'Finish' }));

      expect(axiosPatchSpy).toHaveBeenCalledWith('/v1/catalogue-items/17', {
        properties: [
          { name: 'Pumping Speed', value: 400 },
          { name: 'Ultimate Pressure', value: 10 },
          {
            name: 'Axis',
            value: 'y',
          },
        ],
      });
    }, 10000);

    it('edits a catalogue item where the catalogue item property has an allowed list of values (Optional)', async () => {
      props = {
        ...props,
        parentInfo: getCatalogueCategoryById('12'),
        selectedCatalogueItem: getCatalogueItemById('17'),
      };

      createView();
      await user.click(screen.getByRole('button', { name: 'Next' }));

      fireEvent.change(
        screen.getByLabelText('Ultimate Pressure (millibar) *'),
        {
          target: { value: '10' },
        }
      );

      fireEvent.mouseDown(screen.getByLabelText('Pumping Speed *'));
      fireEvent.click(within(screen.getByRole('listbox')).getByText('400'));

      fireEvent.mouseDown(screen.getByLabelText('Axis'));
      fireEvent.click(within(screen.getByRole('listbox')).getByText('None'));

      await user.click(screen.getByRole('button', { name: 'Finish' }));

      expect(axiosPatchSpy).toHaveBeenCalledWith('/v1/catalogue-items/17', {
        properties: [
          { name: 'Pumping Speed', value: 400 },
          { name: 'Ultimate Pressure', value: 10 },
          {
            name: 'Axis',
            value: null,
          },
        ],
      });
    }, 10000);

    it('display error message when mandatory field is not filled in', async () => {
      props = {
        ...props,
        parentInfo: getCatalogueCategoryById('4'),
        selectedCatalogueItem: getCatalogueItemById('1'),
      };

      createView();

      await modifyValues({
        costGbp: '',
        costToReworkGbp: '',
        daysToReplace: '',
        daysToRework: '',
        description: '',
        drawingLink: '',
        drawingNumber: '',
        itemModelNumber: '',
        name: '',
        manufacturer: '{delete}',
        notes: '',
      });

      await user.click(screen.getByRole('button', { name: 'Next' }));

      const nameHelperText = screen.getByText('Please enter a name');
      const costHelperText = screen.getByText('Please enter a cost');
      const daysToReplaceHelperText = screen.getByText(
        'Please enter how many days it would take to replace'
      );

      expect(nameHelperText).toBeInTheDocument();
      expect(costHelperText).toBeInTheDocument();
      expect(daysToReplaceHelperText).toBeInTheDocument();

      expect(
        screen.getByText(
          'Please choose a manufacturer, or add a new manufacturer'
        )
      ).toBeInTheDocument();

      await modifyValues({
        costGbp: '200',
        daysToReplace: '5',
        name: 'test',
        manufacturer: '{arrowdown}{enter}',
      });

      await user.click(screen.getByRole('button', { name: 'Next' }));

      await modifyValues({
        resolution: '',
        frameRate: '',
        sensorType: '',
        sensorBrand: '',
        broken: 'None',
        older: 'None',
      });

      await user.click(screen.getByRole('button', { name: 'Finish' }));

      const mandatoryFieldHelperText = screen.getAllByText(
        'Please enter a valid value as this field is mandatory'
      );

      const mandatoryFieldBooleanHelperText = screen.getByText(
        'Please select either True or False'
      );

      expect(mandatoryFieldBooleanHelperText).toBeInTheDocument();

      expect(mandatoryFieldHelperText.length).toBe(2);
      expect(mandatoryFieldHelperText[0]).toHaveTextContent(
        'Please enter a valid value as this field is mandatory'
      );
    }, 6000);

    it('Edit a catalogue item (catalogue properties)', async () => {
      props = {
        ...props,
        parentInfo: getCatalogueCategoryById('4'),
        selectedCatalogueItem: getCatalogueItemById('1'),
      };

      createView();

      await user.click(screen.getByRole('button', { name: 'Next' }));
      await modifyValues({
        resolution: '24',
        frameRate: '240',
        sensorType: 'CCD',
        sensorBrand: 'Nikon',
        broken: 'True',
        older: 'True',
      });
      await user.click(screen.getByRole('button', { name: 'Finish' }));
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

      await modifyValues({
        manufacturer: 'Man{arrowdown}{arrowdown}{enter}',
      });

      await user.click(screen.getByRole('button', { name: 'Next' }));

      await user.click(screen.getByRole('button', { name: 'Finish' }));

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

      await user.click(screen.getByRole('button', { name: 'Next' }));
      await user.click(screen.getByRole('button', { name: 'Finish' }));

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

      await user.click(screen.getByRole('button', { name: 'Next' }));
      // checks the back button works as expected
      await user.click(screen.getByRole('button', { name: 'Back' }));
      await user.click(screen.getByRole('button', { name: 'Next' }));
      await user.click(screen.getByRole('button', { name: 'Finish' }));

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

      await modifyValues({
        name: 'test_has_children_elements',
      });

      await user.click(screen.getByRole('button', { name: 'Next' }));
      await user.click(screen.getByRole('button', { name: 'Finish' }));

      expect(axiosPatchSpy).toHaveBeenCalledWith('/v1/catalogue-items/1', {
        name: 'test_has_children_elements',
      });

      await waitFor(() => {
        expect(
          screen.getByText(
            'Catalogue item has child elements and cannot be edited'
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

      await modifyValues({
        name: 'Error 500',
      });

      await user.click(screen.getByRole('button', { name: 'Next' }));

      await user.click(screen.getByRole('button', { name: 'Finish' }));

      expect(handleIMS_APIError).toHaveBeenCalled();
      expect(onClose).not.toHaveBeenCalled();
    });
  });
});
