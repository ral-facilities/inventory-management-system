import { screen, waitFor } from '@testing-library/react';
import { renderComponentWithBrowserRouter } from '../../testUtils';

import userEvent from '@testing-library/user-event';
import CatalogueCategoryTableView, {
  CatalogueCategoryTableViewProps,
} from './catalogueCategoryTableView.component';

describe('CatalogueCategoryTableView', () => {
  let props: CatalogueCategoryTableViewProps;
  let user;

  const onChangeParentCategoryId = vi.fn();
  const createView = () => {
    return renderComponentWithBrowserRouter(
      <CatalogueCategoryTableView {...props} />
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
          is_leaf: true,
          catalogue_item_properties: [
            {
              name: 'Measurement Range',
              type: 'number',
              unit: 'Joules',
              mandatory: true,
            },
            {
              name: 'Accuracy',
              type: 'string',
              mandatory: false,
            },
          ],
        },
      ],
      onChangeParentCategoryId: onChangeParentCategoryId,
      requestType: 'standard',
      catalogueCategoryData: [
        {
          id: '79',
          name: 'test_dup',
          parent_id: '1',
          code: 'test_dup',
          is_leaf: false,
        },
        {
          id: '4',
          name: 'Cameras',
          parent_id: '1',
          code: 'cameras',
          is_leaf: true,
          catalogue_item_properties: [
            {
              name: 'Resolution',
              type: 'number',
              unit: 'megapixels',
              mandatory: true,
            },
            {
              name: 'Frame Rate',
              type: 'number',
              unit: 'fps',
              mandatory: false,
            },
            {
              name: 'Sensor Type',
              type: 'string',
              mandatory: true,
            },
            {
              name: 'Sensor brand',
              type: 'string',
              mandatory: false,
            },
            {
              name: 'Broken',
              type: 'boolean',
              mandatory: true,
            },
            {
              name: 'Older than five years',
              type: 'boolean',
              mandatory: false,
            },
          ],
        },
        {
          id: '5',
          name: 'Energy Meters',
          parent_id: '1',
          code: 'energy-meters',
          is_leaf: true,
          catalogue_item_properties: [
            {
              name: 'Measurement Range',
              type: 'number',
              unit: 'Joules',
              mandatory: true,
            },
            {
              name: 'Accuracy',
              type: 'string',
              mandatory: false,
            },
          ],
        },
        {
          id: '6',
          name: 'Wavefront Sensors',
          parent_id: '1',
          code: 'wavefront-sensors',
          is_leaf: true,
          catalogue_item_properties: [
            {
              name: 'Wavefront Measurement Range',
              type: 'string',
              mandatory: true,
            },
            {
              name: 'Spatial Resolution',
              type: 'number',
              unit: 'micrometers',
              mandatory: false,
            },
          ],
        },
        {
          id: '18',
          name: 'Voltage Meters',
          parent_id: '1',
          code: 'voltage-meters',
          is_leaf: true,
          catalogue_item_properties: [
            {
              name: 'Measurement Range',
              type: 'number',
              unit: 'volts',
              mandatory: true,
            },
            {
              name: 'Accuracy',
              type: 'string',
              mandatory: true,
            },
          ],
        },
        {
          id: '19',
          name: 'Amp Meters',
          parent_id: '1',
          code: 'amp-meters',
          is_leaf: false,
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
        is_leaf: false,
      },
      {
        id: '19',
        name: 'Amp Meters',
        parent_id: '1',
        code: 'amp-meters',
        is_leaf: false,
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
});
