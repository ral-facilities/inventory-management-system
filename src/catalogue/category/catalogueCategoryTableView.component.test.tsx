import { screen, waitFor } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { CatalogueCategoryPropertyType } from '../../api/api.types';
import APIConfigProvider from '../../apiConfigProvider.component';
import { server } from '../../mocks/server';
import { RootState } from '../../state/store';
import {
  CREATED_MODIFIED_TIME_VALUES,
  renderComponentWithRouterProvider,
} from '../../testUtils';
import CatalogueCategoryTableView, {
  CatalogueCategoryTableViewProps,
} from './catalogueCategoryTableView.component';

describe('CatalogueCategoryTableView', () => {
  let props: CatalogueCategoryTableViewProps;
  let user: UserEvent;

  const onChangeParentCategoryId = vi.fn();
  const createView = (preloadedState?: Partial<RootState>) => {
    return renderComponentWithRouterProvider(
      <APIConfigProvider>
        <CatalogueCategoryTableView {...props} />
      </APIConfigProvider>,
      undefined,
      undefined,
      preloadedState
    );
  };

  beforeEach(() => {
    props = {
      selectedCategories: [
        {
          id: '5',
          name: 'Energy Meters',
          parent_id: '1',
          code: 'energy-meters',
          is_flagged: false,
          is_leaf: true,
          properties: [
            {
              id: '1',
              name: 'Measurement Range',
              type: CatalogueCategoryPropertyType.Number,
              unit: 'Joules',
              unit_id: '3',
              allowed_values: null,
              mandatory: true,
            },
            {
              id: '2',
              name: 'Accuracy',
              type: CatalogueCategoryPropertyType.Text,
              unit: null,
              unit_id: null,
              allowed_values: null,
              mandatory: false,
            },
          ],
          ...CREATED_MODIFIED_TIME_VALUES,
        },
      ],
      onChangeParentCategoryId: onChangeParentCategoryId,
      requestType: 'standard',
      requestOrigin: 'category',
      catalogueCategoryData: [
        {
          id: '79',
          name: 'test_dup',
          parent_id: '1',
          code: 'test_dup',
          is_flagged: false,
          is_leaf: false,
          properties: [],
          ...CREATED_MODIFIED_TIME_VALUES,
        },
        {
          id: '4',
          name: 'Cameras',
          parent_id: '1',
          code: 'cameras',
          is_flagged: false,
          is_leaf: true,
          properties: [
            {
              id: '3',
              name: 'Resolution',
              type: CatalogueCategoryPropertyType.Number,
              unit: 'megapixels',
              mandatory: true,
              unit_id: '1',
              allowed_values: null,
            },
            {
              id: '4',
              name: 'Frame Rate',
              type: CatalogueCategoryPropertyType.Number,
              unit: 'fps',
              mandatory: false,
              unit_id: '2',
              allowed_values: null,
            },
            {
              id: '5',
              name: 'Sensor Type',
              type: CatalogueCategoryPropertyType.Text,
              mandatory: true,
              unit_id: null,
              unit: null,
              allowed_values: null,
            },
            {
              id: '6',
              name: 'Sensor brand',
              type: CatalogueCategoryPropertyType.Text,
              mandatory: false,
              unit_id: null,
              unit: null,
              allowed_values: null,
            },
            {
              id: '7',
              name: 'Broken',
              type: CatalogueCategoryPropertyType.Boolean,
              mandatory: true,
              unit_id: null,
              unit: null,
              allowed_values: null,
            },
            {
              id: '8',
              name: 'Older than five years',
              type: CatalogueCategoryPropertyType.Boolean,
              mandatory: false,
              unit_id: null,
              unit: null,
              allowed_values: null,
            },
          ],
          ...CREATED_MODIFIED_TIME_VALUES,
        },
        {
          id: '5',
          name: 'Energy Meters',
          parent_id: '1',
          code: 'energy-meters',
          is_flagged: null,
          is_leaf: true,
          properties: [
            {
              id: '1',
              name: 'Measurement Range',
              type: CatalogueCategoryPropertyType.Number,
              unit: 'Joules',
              mandatory: true,
              unit_id: '3',
              allowed_values: null,
            },
            {
              id: '2',
              name: 'Accuracy',
              type: CatalogueCategoryPropertyType.Text,
              mandatory: false,
              unit_id: null,
              unit: null,
              allowed_values: null,
            },
          ],
          ...CREATED_MODIFIED_TIME_VALUES,
        },
        {
          id: '6',
          name: 'Wavefront Sensors',
          parent_id: '1',
          code: 'wavefront-sensors',
          is_flagged: true,
          is_leaf: true,
          properties: [
            {
              id: '10',
              name: 'Wavefront Measurement Range',
              type: CatalogueCategoryPropertyType.Text,
              mandatory: true,
              unit_id: null,
              unit: null,
              allowed_values: null,
            },
            {
              id: '11',
              name: 'Spatial Resolution',
              type: CatalogueCategoryPropertyType.Number,
              unit: 'micrometers',
              mandatory: false,
              unit_id: '4',
              allowed_values: null,
            },
          ],
          ...CREATED_MODIFIED_TIME_VALUES,
        },
        {
          id: '18',
          name: 'Voltage Meters',
          parent_id: '1',
          code: 'voltage-meters',
          is_flagged: false,
          is_leaf: true,
          properties: [
            {
              id: '12',
              name: 'Measurement Range',
              type: CatalogueCategoryPropertyType.Number,
              unit: 'volts',
              mandatory: true,
              unit_id: '9',
              allowed_values: null,
            },
            {
              id: '14',
              name: 'Accuracy',
              type: CatalogueCategoryPropertyType.Text,
              mandatory: true,
              unit_id: null,
              unit: null,
              allowed_values: null,
            },
          ],
          ...CREATED_MODIFIED_TIME_VALUES,
        },
        {
          id: '19',
          name: 'Amp Meters',
          parent_id: '1',
          code: 'amp-meters',
          is_flagged: false,
          is_leaf: false,
          ...CREATED_MODIFIED_TIME_VALUES,
          properties: [],
        },
      ],
      catalogueCategoryDataLoading: false,
    };

    user = userEvent.setup();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders text correctly', async () => {
    createView();
    await waitFor(() => {
      expect(screen.getByText('Name')).toBeInTheDocument();
    });

    expect(screen.getByText('test_dup')).toBeInTheDocument();
    expect(screen.getByText('Cameras')).toBeInTheDocument();
    expect(screen.getByText('Energy Meters')).toBeInTheDocument();
    expect(screen.getByText('Wavefront Sensors')).toBeInTheDocument();
    expect(screen.getByText('Voltage Meters')).toBeInTheDocument();
  });

  it('renders no results page correctly', async () => {
    props.catalogueCategoryData = [];

    createView();
    await waitFor(() => {
      expect(
        screen.getByText('No catalogue categories found')
      ).toBeInTheDocument();
    });
  });

  it('calls onChangeParentCategoryId when clicking on a Table row (standard)', async () => {
    createView();

    await waitFor(() => {
      expect(screen.getByText('Cameras')).toBeInTheDocument();
    });

    const camerasRow = screen.getByRole('row', { name: 'Cameras row' });
    await user.click(camerasRow);

    expect(onChangeParentCategoryId).toHaveBeenCalledWith('4');
  });

  it('calls onChangeParentCategoryId when clicking on a Table row (CopyTo)', async () => {
    props.requestType = 'copyTo';
    createView();

    await waitFor(() => {
      expect(screen.getByText('Cameras')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Go to page 2' }));

    await waitFor(() => {
      expect(screen.getByText('Amp Meters')).toBeInTheDocument();
    });

    const AmpMetersRow = screen.getByRole('row', { name: 'Amp Meters row' });
    await user.click(AmpMetersRow);

    expect(onChangeParentCategoryId).toHaveBeenCalledWith('19');
  });

  it('disables the leaf categories and the selected categories', async () => {
    props.selectedCategories = [
      {
        id: '79',
        name: 'test_dup',
        parent_id: '1',
        code: 'test_dup',
        is_flagged: false,
        is_leaf: false,
        ...CREATED_MODIFIED_TIME_VALUES,
        properties: [],
      },
      {
        id: '19',
        name: 'Amp Meters',
        parent_id: '1',
        code: 'amp-meters',
        is_flagged: false,
        is_leaf: false,
        ...CREATED_MODIFIED_TIME_VALUES,
        properties: [],
      },
    ];

    props.requestType = 'moveTo';

    createView();

    await waitFor(() => {
      expect(
        screen.getByRole('row', { name: 'test_dup row' })
      ).toBeInTheDocument();
    });

    const camerasRow = screen.getByRole('row', { name: 'Cameras row' });
    const test_dupRow = screen.getByRole('row', { name: 'test_dup row' });
    const energyMetersRow = screen.getByRole('row', {
      name: 'Energy Meters row',
    });
    const wavefrontSensorsRow = screen.getByRole('row', {
      name: 'Wavefront Sensors row',
    });
    const voltageMetersRow = screen.getByRole('row', {
      name: 'Voltage Meters row',
    });

    // Not allowed cursor
    expect(camerasRow).toHaveStyle('cursor: not-allowed;');
    expect(test_dupRow).toHaveStyle('cursor: not-allowed;');

    expect(energyMetersRow).toHaveStyle('cursor: not-allowed;');
    expect(wavefrontSensorsRow).toHaveStyle('cursor: not-allowed;');
    expect(voltageMetersRow).toHaveStyle('cursor: not-allowed;');

    // checks nothing happens on click
    await user.click(camerasRow);
    await user.click(test_dupRow);
    await user.click(energyMetersRow);
    await user.click(wavefrontSensorsRow);
    await user.click(voltageMetersRow);

    expect(onChangeParentCategoryId).not.toHaveBeenCalled();
  });

  it('shows critical catalogue categories', async () => {
    props.selectedCategories = [
      {
        id: '79',
        name: 'test_dup',
        parent_id: '1',
        code: 'test_dup',
        is_flagged: false,
        is_leaf: false,
        ...CREATED_MODIFIED_TIME_VALUES,
        properties: [],
      },
      {
        id: '19',
        name: 'Amp Meters',
        parent_id: '1',
        code: 'amp-meters',
        is_flagged: false,
        is_leaf: false,
        ...CREATED_MODIFIED_TIME_VALUES,
        properties: [],
      },
    ];

    props.requestType = 'moveTo';

    createView({
      criticality: { isCriticalMode: true },
    });

    await waitFor(() => {
      expect(screen.getByTestId('ErrorIcon')).toBeInTheDocument();
    });

    await user.hover(screen.getByTestId('ErrorIcon'));

    expect(
      await screen.findByText('This catalogue category is critical.')
    ).toBeInTheDocument();
    await user.hover(screen.getAllByTestId('CheckCircleIcon')[0]);

    expect(
      await screen.findByText('This catalogue category is not critical.')
    ).toBeInTheDocument();

    await user.hover(screen.getByTestId('WarningIcon'));

    expect(
      await screen.findByText(
        'Unable to determine if this catalogue category is critical. Please contact support.'
      )
    ).toBeInTheDocument();
  });

  it('does not shows critical catalogue categories when spares is undefined', async () => {
    props.selectedCategories = [
      {
        id: '79',
        name: 'test_dup',
        parent_id: '1',
        code: 'test_dup',
        is_flagged: false,
        is_leaf: false,
        ...CREATED_MODIFIED_TIME_VALUES,
        properties: [],
      },
      {
        id: '19',
        name: 'Amp Meters',
        parent_id: '1',
        code: 'amp-meters',
        is_flagged: false,
        is_leaf: false,
        ...CREATED_MODIFIED_TIME_VALUES,
        properties: [],
      },
    ];

    props.requestType = 'moveTo';

    server.use(
      http.get('/v1/settings/spares-definition', () => {
        return HttpResponse.json(undefined, { status: 204 });
      })
    );
    createView({
      criticality: { isCriticalMode: true },
    });
    await waitFor(() => {
      expect(screen.queryByTestId('ErrorIcon')).not.toBeInTheDocument();
    });
  });
});
