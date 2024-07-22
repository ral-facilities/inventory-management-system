import userEvent, { UserEvent } from '@testing-library/user-event';
import { renderComponentWithRouterProvider } from '../../testUtils';
import PropertiesTable, {
  PropertiesTableProps,
} from './catalogueItemPropertiesTable.component';
import { screen, waitFor } from '@testing-library/react';

describe('CatalogeItemPropertiesTable', () => {
  let props: PropertiesTableProps;
  let user: UserEvent;

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
          //unit: 'liters per second',
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
          cip_placement_id: 'cip_placement_id_14',
        },
        {
          name: 'Ultimate Pressure',
          type: 'number',
          //unit: 'millibar',
          unit_id: '8',
          mandatory: true,
          allowed_values: null,
          cip_placement_id: 'cip_placement_id_16',
        },
        {
          name: 'Axis',
          type: 'string',
          //unit: null,
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
          cip_placement_id: 'cip_placement_id_20',
        },
      ],
      editingProperties: false,
      onChangeEditCatalogueItemField: onChangeEditCatalogueItemField,
      tableHeightPx: '600px',
    };

    user = userEvent.setup();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders table correctly (not editing properties)', async () => {
    const { asFragment } = createView();
    await waitFor(() => {
      const propertyTable = screen.getByRole('table');
      expect(propertyTable).toBeInTheDocument();
    });
    expect(asFragment()).toMatchSnapshot();
  });

  it('renders table correctly (editing properties)', async () => {
    props.editingProperties = true;

    const { asFragment } = createView();
    await waitFor(() => {
      const propertyTable = screen.getByRole('table');
      expect(propertyTable).toBeInTheDocument();
    });
    expect(asFragment()).toMatchSnapshot();
  });

  it('calls onChangeEditCatalogueItemField when selecting property', async () => {
    props.editingProperties = true;
    createView();

    await waitFor(() => {
      const propertyTable = screen.getByRole('table');
      expect(propertyTable).toBeInTheDocument();
    });

    const radioButton = screen.getAllByRole('radio', {
      name: 'Toggle select row',
    })[0];
    user.click(radioButton);

    expect(onChangeEditCatalogueItemField).toHaveBeenCalled();
  });
});
