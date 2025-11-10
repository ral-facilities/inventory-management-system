import { screen, waitFor, within } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { Item } from '../api/api.types';
import ItemJSON from '../mocks/Items.json';
import { renderComponentWithRouterProvider } from '../testUtils';
import {
  SystemItemsUsageStatusTable,
  SystemItemsUsageStatusTableProps,
} from './systemItemsUsageStatuses.component';

describe('SystemItemsUsageStatusTable', () => {
  vi.setConfig({ testTimeout: 10000 });

  let props: SystemItemsUsageStatusTableProps;
  let user: UserEvent;

  const createView = () => {
    return renderComponentWithRouterProvider(
      <SystemItemsUsageStatusTable {...props} />,
      'any',
      '/'
    );
  };

  const onChangeUsageStatuses = vi.fn();
  const onChangeItemUsageStatusesErrorState = vi.fn();
  const moveToSelectedItems: Item[] = [
    ItemJSON[0],
    ItemJSON[1],
    ItemJSON[22],
    ItemJSON[23],
  ];

  beforeEach(() => {
    props = {
      onChangeUsageStatuses,
      onChangeItemUsageStatusesErrorState,
      usageStatuses: [
        { item_id: 'KvT2Ox7n', catalogue_item_id: '1', usage_status_id: '' },
        { item_id: 'G463gOIA', catalogue_item_id: '1', usage_status_id: '' },
        { item_id: '7Lrj9KVu', catalogue_item_id: '25', usage_status_id: '' },
        { item_id: 'QQen23yW', catalogue_item_id: '25', usage_status_id: '' },
      ],
      itemUsageStatusesErrorState: {},
      items: moveToSelectedItems,
    };

    user = userEvent.setup();

    window.Element.prototype.getBoundingClientRect = vi
      .fn()
      .mockReturnValue({ height: 100, width: 200 });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const selectUsageStatus = async (values: {
    index: number;
    usage_status_id: string;
  }) => {
    await user.click(screen.getAllByRole('combobox')[values.index]);

    const dropdown = await screen.findByRole('listbox');

    await user.click(
      within(dropdown).getByRole('option', { name: values.usage_status_id })
    );
  };

  const modifyUsageStatus = async (values: {
    cameras1?: string;
    cameras6?: string;
    cameras1Item1?: string;
    cameras1Item2?: string;
    cameras6Item1?: string;
    cameras6Item2?: string;
  }) => {
    if (
      values.cameras1Item1 ||
      values.cameras1Item2 ||
      values.cameras6Item1 ||
      values.cameras6Item2
    ) {
      await user.click(screen.getByTestId('CancelIcon'));

      if (values.cameras1Item1) {
        await selectUsageStatus({
          index: 1,
          usage_status_id: values.cameras1Item1,
        });
      }

      if (values.cameras1Item2) {
        await selectUsageStatus({
          index: 2,
          usage_status_id: values.cameras1Item2,
        });
      }

      if (values.cameras6Item1) {
        await selectUsageStatus({
          index: 3,
          usage_status_id: values.cameras6Item1,
        });
      }

      if (values.cameras6Item2) {
        await selectUsageStatus({
          index: 4,
          usage_status_id: values.cameras6Item2,
        });
      }
    }
    if (values.cameras1)
      await selectUsageStatus({
        index: 1,
        usage_status_id: values.cameras1,
      });

    if (values.cameras6)
      await selectUsageStatus({
        index: 2,
        usage_status_id: values.cameras6,
      });
  };

  it('renders correctly', async () => {
    const view = createView();

    // Name (obtained from catalogue category item)
    await waitFor(
      () => {
        expect(
          screen.getByRole('cell', {
            name: `Cameras 1 (2)`,
          })
        ).toBeInTheDocument();
      },
      { timeout: 4000 }
    );

    // Ensure no loading bars visible
    await waitFor(() =>
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    );

    // Rest in a snapshot
    expect(view.asFragment()).toMatchSnapshot();
  });

  it('sets the usages status using the aggregate cell (sets all items of a catalogue item to the selected usage status)', async () => {
    createView();

    // Name (obtained from catalogue category item)
    await waitFor(
      () => {
        expect(
          screen.getByRole('cell', {
            name: `Cameras 1 (2)`,
          })
        ).toBeInTheDocument();
      },
      { timeout: 4000 }
    );

    // Ensure no loading bars visible
    await waitFor(() =>
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    );

    await modifyUsageStatus({ cameras1: 'Used' });

    // Change usages status for cameras 1 items
    expect(onChangeUsageStatuses).toHaveBeenCalledWith([
      { item_id: 'KvT2Ox7n', catalogue_item_id: '1', usage_status_id: '2' },
      { item_id: 'G463gOIA', catalogue_item_id: '1', usage_status_id: '2' },
      { item_id: '7Lrj9KVu', catalogue_item_id: '25', usage_status_id: '' },
      { item_id: 'QQen23yW', catalogue_item_id: '25', usage_status_id: '' },
    ]);

    await modifyUsageStatus({ cameras6: 'Used' });

    // Change usages status for cameras 6 items
    expect(onChangeUsageStatuses).toHaveBeenCalledWith([
      { item_id: 'KvT2Ox7n', catalogue_item_id: '1', usage_status_id: '2' },
      { item_id: 'G463gOIA', catalogue_item_id: '1', usage_status_id: '2' },
      { item_id: '7Lrj9KVu', catalogue_item_id: '25', usage_status_id: '2' },
      { item_id: 'QQen23yW', catalogue_item_id: '25', usage_status_id: '2' },
    ]);
  });

  it('displays errors messages correctly', async () => {
    props.itemUsageStatusesErrorState = {
      ['KvT2Ox7n']: {
        catalogue_item_id: '1',
        message: 'Please select a usage status',
      },
      ['G463gOIA']: {
        catalogue_item_id: '1',
        message: 'Please select a usage status',
      },
      ['7Lrj9KVu']: {
        catalogue_item_id: '25',
        message: 'Please select a usage status',
      },
      ['QQen23yW']: {
        catalogue_item_id: '25',
        message: 'Please select a usage status',
      },
    };

    createView();

    // Name (obtained from catalogue category item)
    await waitFor(
      () => {
        expect(
          screen.getByRole('cell', {
            name: `Cameras 1 (2)`,
          })
        ).toBeInTheDocument();
      },
      { timeout: 4000 }
    );

    // Ensure no loading bars visible
    await waitFor(() =>
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    );

    const errorIcon = screen.getAllByTestId('ErrorIcon');

    expect(errorIcon.length).toEqual(2);

    await user.click(screen.getAllByRole('button', { name: 'Expand' })[0]);
    const helperTexts = screen.getAllByText('Please select a usage status');
    expect(helperTexts.length).toEqual(2);

    await modifyUsageStatus({ cameras1: 'Used' });

    expect(onChangeItemUsageStatusesErrorState).toHaveBeenCalledWith({
      ['7Lrj9KVu']: {
        catalogue_item_id: '25',
        message: 'Please select a usage status',
      },
      ['QQen23yW']: {
        catalogue_item_id: '25',
        message: 'Please select a usage status',
      },
    });
  });

  it('sets the usages status one by one', async () => {
    createView();

    // Name (obtained from catalogue category item)
    await waitFor(
      () => {
        expect(
          screen.getByRole('cell', {
            name: `Cameras 1 (2)`,
          })
        ).toBeInTheDocument();
      },
      { timeout: 4000 }
    );

    // Ensure no loading bars visible
    await waitFor(() =>
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    );

    await modifyUsageStatus({
      cameras1Item1: 'Used',
      cameras1Item2: 'Used',
      cameras6Item1: 'Used',
      cameras6Item2: 'Used',
    });

    expect(onChangeUsageStatuses).toHaveBeenCalledWith([
      { item_id: 'KvT2Ox7n', catalogue_item_id: '1', usage_status_id: '2' },
      { item_id: 'G463gOIA', catalogue_item_id: '1', usage_status_id: '2' },
      { item_id: '7Lrj9KVu', catalogue_item_id: '25', usage_status_id: '2' },
      { item_id: 'QQen23yW', catalogue_item_id: '25', usage_status_id: '2' },
    ]);
  });
});
