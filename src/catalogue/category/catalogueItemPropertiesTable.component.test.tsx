import { renderComponentWithRouterProvider } from '../../testUtils';
import PropertiesTable, {
  PropertiesTableProps,
} from './catalogueItemPropertiesTable.component';
import { screen, waitFor } from '@testing-library/react';

describe('CatalogeItemPropertiesTable', () => {
  let props: PropertiesTableProps;

  const onChangeEditCatalogueItemField = vi.fn();
  const createView = () => {
    return renderComponentWithRouterProvider(<PropertiesTable {...props} />);
  };

  beforeEach(() => {
    props = {
      properties: [
        {
          name: 'Pumping Speed',
          type: 'number',
          unit: 'liters per second',
          unit_id: '7',
          mandatory: true,
          allowed_values: {
            type: 'list',
            values: [
              {
                av_placement_id: 'av_placement_id_11',
                value: 300,
              },
              {
                av_placement_id: 'av_placement_id_12',
                value: 400,
              },
              {
                av_placement_id: 'av_placement_id_13',
                value: 500,
              },
            ],
          },
          id: '1',
        },
        {
          name: 'Ultimate Pressure',
          type: 'number',
          unit: 'millibar',
          unit_id: '8',
          mandatory: true,
          allowed_values: null,
          id: '2',
        },
        {
          name: 'Axis',
          type: 'string',
          unit: null,
          unit_id: null,
          mandatory: false,
          allowed_values: {
            type: 'list',
            values: [
              {
                av_placement_id: 'av_placement_id_17',
                value: 'y',
              },
              {
                av_placement_id: 'av_placement_id_18',
                value: 'x',
              },
              {
                av_placement_id: 'av_placement_id_19',
                value: 'z',
              },
            ],
          },
          id: '3',
        },
      ],
      editingProperties: false,
      onChangeEditCatalogueItemField: onChangeEditCatalogueItemField,
      tableHeightPx: '240px',
    };

    window.Element.prototype.getBoundingClientRect = vi
      .fn()
      .mockReturnValue({ height: 100, width: 200 });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders table correctly (not editing properties)', async () => {
    const { asFragment } = createView();
    expect(screen.getByRole('table')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    expect(asFragment()).toMatchSnapshot();
  });

  it('renders table correctly (editing properties)', async () => {
    props.editingProperties = true;

    const { asFragment } = createView();
    expect(screen.getByRole('table')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    expect(asFragment()).toMatchSnapshot();
  });
});
