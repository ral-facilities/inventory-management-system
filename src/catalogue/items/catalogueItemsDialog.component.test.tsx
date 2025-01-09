import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import {
  getCatalogueCategoryById,
  getCatalogueItemById,
  renderComponentWithRouterProvider,
} from '../../testUtils';
import CatalogueItemsDialog, {
  CatalogueItemsDialogProps,
} from './catalogueItemsDialog.component';

import { http } from 'msw';
import { MockInstance } from 'vitest';
import { imsApi } from '../../api/api';
import { CatalogueItem } from '../../api/api.types';
import handleIMS_APIError from '../../handleIMS_APIError';
import { server } from '../../mocks/server';

vi.mock('../../handleIMS_APIError');

describe('Catalogue Items Dialog', () => {
  let props: CatalogueItemsDialogProps;
  let user: UserEvent;
  let axiosPostSpy: MockInstance;
  const onClose = vi.fn();

  const createView = () => {
    return renderComponentWithRouterProvider(
      <CatalogueItemsDialog {...props} />
    );
  };

  beforeEach(() => {
    props = {
      open: true,
      onClose: onClose,
      parentInfo: undefined,
      requestType: 'post',
      duplicate: false,
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
    expectedLifetimeDays?: string;
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
    if (values.name !== undefined)
      fireEvent.change(screen.getByLabelText('Name *'), {
        target: { value: values.name },
      });

    if (values.description !== undefined)
      fireEvent.change(screen.getByLabelText('Description'), {
        target: { value: values.description },
      });

    if (values.costGbp !== undefined)
      fireEvent.change(screen.getByLabelText('Cost (£) *'), {
        target: { value: values.costGbp },
      });

    if (values.costToReworkGbp !== undefined)
      fireEvent.change(screen.getByLabelText('Cost to rework (£)'), {
        target: { value: values.costToReworkGbp },
      });

    if (values.daysToReplace !== undefined)
      fireEvent.change(screen.getByLabelText('Time to replace (days) *'), {
        target: { value: values.daysToReplace },
      });

    if (values.daysToRework !== undefined)
      fireEvent.change(screen.getByLabelText('Time to rework (days)'), {
        target: { value: values.daysToRework },
      });

    if (values.expectedLifetimeDays !== undefined)
      fireEvent.change(screen.getByLabelText('Expected Lifetime (days)'), {
        target: { value: values.expectedLifetimeDays },
      });

    if (values.drawingNumber !== undefined)
      fireEvent.change(screen.getByLabelText('Drawing number'), {
        target: { value: values.drawingNumber },
      });

    if (values.drawingLink !== undefined)
      fireEvent.change(screen.getByLabelText('Drawing link'), {
        target: { value: values.drawingLink },
      });

    if (values.itemModelNumber !== undefined)
      fireEvent.change(screen.getByLabelText('Model number'), {
        target: { value: values.itemModelNumber },
      });

    if (values.manufacturer !== undefined) {
      const manufacturerPopup = screen.getAllByRole('combobox')[0];
      await user.type(manufacturerPopup, values.manufacturer);
    }

    if (values.notes !== undefined)
      fireEvent.change(screen.getByLabelText('Notes'), {
        target: { value: values.notes },
      });

    if (values.resolution !== undefined)
      fireEvent.change(screen.getByLabelText('Resolution (megapixels) *'), {
        target: { value: values.resolution },
      });

    if (values.frameRate !== undefined)
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

    if (values.sensorBrand !== undefined)
      fireEvent.change(screen.getByLabelText('Sensor brand'), {
        target: { value: values.sensorBrand },
      });

    if (values.sensorType !== undefined)
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

  it('disables finish button and shows circular progress indicator when request is pending', async () => {
    server.use(
      http.post('/v1/catalogue-items', () => {
        return new Promise(() => {});
      })
    );
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
      broken: 'T{arrowdown}{enter}',
    });

    const finishButton = screen.getByRole('button', { name: 'Finish' });
    await user.click(finishButton);

    expect(finishButton).toBeDisabled();
    expect(await screen.findByRole('progressbar')).toBeInTheDocument();
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
      expectedLifetimeDays: '541',
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
      broken: 'T{arrowdown}{enter}',
      older: 'F{arrowdown}{enter}',
    });

    await user.click(screen.getByRole('button', { name: 'Finish' }));

    expect(axiosPostSpy).toHaveBeenCalledWith('/v1/catalogue-items', {
      catalogue_category_id: '4',
      cost_gbp: 1200,
      cost_to_rework_gbp: 400,
      days_to_replace: 20,
      days_to_rework: 2,
      expected_lifetime_days: 541,
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
        { id: '1', value: 12 },
        { id: '2', value: 60 },
        { id: '3', value: 'IO' },
        { id: '4', value: 'pixel' },
        { id: '5', value: true },
        { id: '6', value: false },
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
      expectedLifetimeDays: '146',
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

    const pumpingSpeedAutoComplete = screen.getAllByRole('combobox')[0];
    await user.type(pumpingSpeedAutoComplete, '4{arrowdown}{enter}');

    const axisAutocomplete = screen.getAllByRole('combobox')[1];
    await user.type(axisAutocomplete, 'y{enter}');

    await user.click(screen.getByRole('button', { name: 'Finish' }));

    expect(axiosPostSpy).toHaveBeenCalledWith('/v1/catalogue-items', {
      catalogue_category_id: '12',
      cost_gbp: 1200,
      cost_to_rework_gbp: 400,
      days_to_replace: 20,
      days_to_rework: 2,
      expected_lifetime_days: 146,
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
        { id: '17', value: 400 },
        { id: '18', value: 10 },
        {
          id: '19',
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
      expectedLifetimeDays: '321',
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
      broken: 'T{arrowdown}{enter}',
      older: 'F{arrowdown}{enter}',
    });
    expect(
      await screen.findByRole('button', { name: 'Finish' })
    ).not.toBeDisabled();
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
      expectedLifetimeDays: '524',
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
      'Please enter a valid value as this field is mandatory.'
    );

    expect(mandatoryFieldHelperText[0]).toHaveTextContent(
      'Please enter a valid value as this field is mandatory.'
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
      broken: 'T{arrowdown}{enter}',
    });

    await user.click(screen.getByRole('button', { name: 'Finish' }));

    expect(axiosPostSpy).toHaveBeenCalledWith('/v1/catalogue-items', {
      catalogue_category_id: '4',
      cost_gbp: 200,
      cost_to_rework_gbp: null,
      days_to_replace: 5,
      days_to_rework: null,
      expected_lifetime_days: null,
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
        { id: '1', value: 12 },
        { id: '2', value: null },
        { id: '3', value: 'IO' },
        { id: '4', value: null },
        { id: '5', value: true },
        { id: '6', value: null },
      ],
    });
  });

  it('displays error messages when mandatory fields are not filled in', async () => {
    props = {
      ...props,
      requestType: 'post',
      parentInfo: getCatalogueCategoryById('4'),
    };

    createView();

    await user.click(screen.getByRole('button', { name: 'Next' }));

    expect(
      screen.getByText(
        'Please choose a manufacturer or add a new manufacturer. Then select a manufacturer.'
      )
    ).toBeInTheDocument();

    const nameHelperText = screen.getByText('Please enter a name.');
    const costHelperText = screen.getByText('Please enter a cost.');
    const daysToReplaceHelperText = screen.getByText(
      'Please enter how many days it would take to replace.'
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
      'Please enter a valid value as this field is mandatory.'
    );

    const mandatoryFieldBooleanHelperText = screen.getByText(
      'Please select either True or False.'
    );

    expect(mandatoryFieldBooleanHelperText).toBeInTheDocument();

    expect(mandatoryFieldHelperText.length).toBe(2);
    expect(mandatoryFieldHelperText[0]).toHaveTextContent(
      'Please enter a valid value as this field is mandatory.'
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
      expectedLifetimeDays: '43ab',
      description: '',
      drawingLink: 'example.com',
      drawingNumber: 'mk4324',
      itemModelNumber: 'mk4324',
      name: 'test',
      manufacturer: 'Man{arrowdown}{enter}',
    });

    await user.click(screen.getByRole('button', { name: 'Next' }));
    const validNumberDetailsHelperText = screen.getAllByText(
      'Please enter a valid number.'
    );

    expect(validNumberDetailsHelperText.length).toBe(5);
    expect(validNumberDetailsHelperText[0]).toHaveTextContent(
      'Please enter a valid number.'
    );

    expect(
      screen.getByText(
        'Please enter a valid Drawing link. Only "http://" and "https://" links with typical top-level domain are accepted.'
      )
    ).toBeInTheDocument();

    await modifyValues({
      costGbp: '1200',
      costToReworkGbp: '400',
      daysToReplace: '20',
      daysToRework: '2',
      expectedLifetimeDays: '43',
      drawingLink: 'https://example.com',
    });

    await user.click(screen.getByRole('button', { name: 'Next' }));

    await modifyValues({
      resolution: '12a',
      frameRate: '60a',
      sensorType: 'IO',
      sensorBrand: 'pixel',
      broken: 'T{arrowdown}{enter}',
      older: 'F{arrowdown}{enter}',
    });

    await user.click(screen.getByRole('button', { name: 'Finish' }));

    const validNumberPropertiesHelperText = screen.getAllByText(
      'Please enter a valid number.'
    );
    expect(validNumberPropertiesHelperText.length).toBe(2);
    expect(validNumberPropertiesHelperText[0]).toHaveTextContent(
      'Please enter a valid number.'
    );
  }, 10000);

  it('display error message when a value is invalid because it is negative', async () => {
    props = {
      ...props,
      parentInfo: getCatalogueCategoryById('4'),
    };

    createView();

    await modifyValues({
      costGbp: '-5',
      costToReworkGbp: '-5',
      daysToReplace: '-5',
      daysToRework: '-5',
      description: '',
      drawingLink: 'https://example.com',
      drawingNumber: 'mk4324',
      expectedLifetimeDays: '-5',
      itemModelNumber: 'mk4324',
      name: 'test',
      manufacturer: 'Man{arrowdown}{enter}',
    });

    await user.click(screen.getByRole('button', { name: 'Next' }));

    const NegativeNumberErrorText = screen.getAllByText(
      'Number must be greater than or equal to 0'
    );

    expect(NegativeNumberErrorText.length).toBe(5);
    expect(NegativeNumberErrorText[0]).toHaveTextContent(
      'Number must be greater than or equal to 0'
    );

    await modifyValues({
      costGbp: '5',
      costToReworkGbp: '5',
      daysToReplace: '5',
      daysToRework: '5',
      expectedLifetimeDays: '5',
    });

    await user.click(screen.getByRole('button', { name: 'Next' }));
    await user.click(screen.getByRole('button', { name: 'Finish' }));
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
      expectedLifetimeDays: '421',
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
      broken: 'T{arrowdown}{enter}',
      older: 'F{arrowdown}{enter}',
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

  describe('Recently Added Section', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-01-09T12:00:00.000+00:00'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('displays recently added section', async () => {
      props = {
        ...props,
        parentInfo: getCatalogueCategoryById('4'),
      };

      createView();

      const manufacturerPopup = screen.getAllByRole('combobox')[0];

      vi.advanceTimersByTimeAsync(2000);
      await user.type(manufacturerPopup, 'Man');

      const options = await screen.findAllByRole('option');
      expect(options).toHaveLength(5);
      expect(screen.getAllByText('Manufacturer B')).toHaveLength(2);
      expect(screen.getByText('A-Z')).toBeInTheDocument();
      expect(screen.getByText('Recently Added')).toBeInTheDocument();
    }, 10000);
  });

  describe('Edit a catalogue item', () => {
    let axiosPatchSpy: MockInstance;

    beforeEach(() => {
      props = {
        ...props,
        requestType: 'patch',
      };

      axiosPatchSpy = vi.spyOn(imsApi, 'patch');
    });

    it('disables finish button and shows circular progress indicator when request is pending', async () => {
      server.use(
        http.patch('/v1/catalogue-items/:id', () => {
          return new Promise(() => {});
        })
      );
      props = {
        ...props,
        parentInfo: getCatalogueCategoryById('4'),
        selectedCatalogueItem: getCatalogueItemById('1'),
      };

      createView();

      await modifyValues({
        name: 'update',
      });

      await user.click(screen.getByRole('button', { name: 'Next' }));

      const finishButton = screen.getByRole('button', { name: 'Finish' });
      await user.click(finishButton);

      expect(finishButton).toBeDisabled();
      expect(await screen.findByRole('progressbar')).toBeInTheDocument();
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
        expectedLifetimeDays: '486',
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
        expected_lifetime_days: 486,
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

      const pumpingSpeedAutoComplete = screen.getAllByRole('combobox')[0];
      await user.type(pumpingSpeedAutoComplete, '4{arrowdown}{enter}');

      const axisAutocomplete = screen.getAllByRole('combobox')[1];
      await user.type(axisAutocomplete, 'y{arrowdown}{enter}');

      await user.click(screen.getByRole('button', { name: 'Finish' }));

      expect(axiosPatchSpy).toHaveBeenCalledWith('/v1/catalogue-items/17', {
        properties: [
          { id: '17', value: 400 },
          { id: '18', value: 10 },
          {
            id: '19',
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

      const pumpingSpeedAutoComplete = screen.getAllByRole('combobox')[0];
      await user.type(pumpingSpeedAutoComplete, '4{arrowdown}{enter}');

      const axisAutocomplete = screen.getAllByRole('combobox')[1];
      await user.type(axisAutocomplete, 'y{arrowdown}{enter}');

      await user.click(screen.getByRole('button', { name: 'Finish' }));

      expect(axiosPatchSpy).toHaveBeenCalledWith('/v1/catalogue-items/17', {
        properties: [
          { id: '17', value: 400 },
          { id: '18', value: 10 },
          {
            id: '19',
            value: 'y',
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
        expectedLifetimeDays: '',
        description: '',
        drawingLink: '',
        drawingNumber: '',
        itemModelNumber: '',
        name: '',
        notes: '',
      });

      await user.click(screen.getByRole('button', { name: 'Next' }));

      const nameHelperText = screen.getByText('Please enter a name.');
      const costHelperText = screen.getByText('Please enter a cost.');
      const daysToReplaceHelperText = screen.getByText(
        'Please enter how many days it would take to replace.'
      );

      expect(nameHelperText).toBeInTheDocument();
      expect(costHelperText).toBeInTheDocument();
      expect(daysToReplaceHelperText).toBeInTheDocument();

      await modifyValues({
        costGbp: '200',
        daysToReplace: '5',
        name: 'test',
      });

      await user.click(screen.getByRole('button', { name: 'Next' }));

      await modifyValues({
        resolution: '',
        frameRate: '',
        sensorType: '',
        sensorBrand: '',
        older: 'N{arrowdown}{enter}',
      });

      await user.click(screen.getByRole('button', { name: 'Finish' }));

      const mandatoryFieldHelperText = screen.getAllByText(
        'Please enter a valid value as this field is mandatory.'
      );

      expect(mandatoryFieldHelperText.length).toBe(2);
      expect(mandatoryFieldHelperText[0]).toHaveTextContent(
        'Please enter a valid value as this field is mandatory.'
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
        broken: 'T{arrowdown}{enter}',
        older: 'T{arrowdown}{enter}',
      });
      await user.click(screen.getByRole('button', { name: 'Finish' }));
      expect(axiosPatchSpy).toHaveBeenCalledWith('/v1/catalogue-items/1', {
        properties: [
          { id: '1', value: 24 },
          { id: '2', value: 240 },
          { id: '3', value: 'CCD' },
          { id: '4', value: 'Nikon' },
          { id: '5', value: true },
          { id: '6', value: true },
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
          screen.getByText(
            "There have been no changes made. Please change a field's value or press Cancel to exit."
          )
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
        } as CatalogueItem,
      };

      createView();

      await user.click(screen.getByRole('button', { name: 'Next' }));
      // checks the back button works as expected
      await user.click(screen.getByRole('button', { name: 'Back' }));
      await user.click(screen.getByRole('button', { name: 'Next' }));
      await user.click(screen.getByRole('button', { name: 'Finish' }));

      await waitFor(() => {
        expect(
          screen.getByText(
            "There have been no changes made. Please change a field's value or press Cancel to exit."
          )
        ).toBeInTheDocument();
      });
    });

    it('displays error message when editing manufacturer_id if catalogue item has child elements', async () => {
      props = {
        ...props,
        parentInfo: getCatalogueCategoryById('4'),
        selectedCatalogueItem: getCatalogueItemById('1'),
      };

      createView();

      await modifyValues({
        name: 'test_has_children_elements',
        manufacturer: 'Man{arrowdown}{arrowdown}{enter}',
      });

      await user.click(screen.getByRole('button', { name: 'Next' }));
      await user.click(screen.getByRole('button', { name: 'Finish' }));

      expect(axiosPatchSpy).toHaveBeenCalledWith('/v1/catalogue-items/1', {
        name: 'test_has_children_elements',
        manufacturer_id: '3',
      });

      await waitFor(() => {
        expect(
          screen.getByText(
            'Unable to update catalogue item properties and manufacturer '
              + '(Manufacturer A), as the catalogue item has associated items.'
          )
        ).toBeInTheDocument();
      });
    });

    it('displays error message when editing properties if catalogue item has child elements', async () => {
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

      await modifyValues({
        resolution: '24',
      });

      await user.click(screen.getByRole('button', { name: 'Finish' }));

      expect(axiosPatchSpy).toHaveBeenCalledWith('/v1/catalogue-items/1', {
        name: 'test_has_children_elements',
        properties: [
          { id: '1', value: 24 },
          { id: '2', value: 30 },
          { id: '3', value: 'CMOS' },
          { id: '4', value: null },
          { id: '5', value: true },
          { id: '6', value: false },
        ],
      });

      await waitFor(() => {
        expect(
          screen.getByText(
            'Unable to update catalogue item properties and manufacturer '
              + '(Manufacturer A), as the catalogue item has associated items.'
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
