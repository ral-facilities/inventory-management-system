import { screen, waitFor, within } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { Item, System } from '../api/api.types';
import ItemJSON from '../mocks/Items.json';
import SystemsJSON from '../mocks/Systems.json';
import { renderComponentWithRouterProvider } from '../testUtils';
import {
  SystemItemsTable,
  SystemItemsTableProps,
} from './systemItemsTable.component';

describe('SystemItemsTable', () => {
  vi.setConfig({ testTimeout: 10000 });

  let props: SystemItemsTableProps;
  let user: UserEvent;

  const mockSystem: System = SystemsJSON[3] as System;

  const createView = () => {
    return renderComponentWithRouterProvider(
      <SystemItemsTable {...props} />,
      'any',
      '/'
    );
  };

  beforeEach(() => {
    props = { system: mockSystem, type: 'normal' };

    user = userEvent.setup();

    window.Element.prototype.getBoundingClientRect = vi
      .fn()
      .mockReturnValue({ height: 100, width: 200 });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('SystemItemsTable (normal)', () => {
    afterEach(() => {
      vi.clearAllMocks();
    });

    it('renders correctly', async () => {
      const view = createView();

      // Name (obtained from catalogue category item)
      await waitFor(
        () => {
          expect(
            screen.getByRole('cell', {
              name: `Turbomolecular Pumps 42 (2)`,
            })
          ).toBeInTheDocument();
        },
        { timeout: 4000 }
      );

      // Ensure no loading bars visible
      await waitFor(() =>
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
      );

      // Expand a group so all columns are rendered to improve test coverage
      // (expanding all causes an infinite loop due to an issue with details panels)
      await user.click(screen.getAllByRole('button', { name: 'Expand' })[0]);
      //also unhide created column
      await user.click(
        await screen.findByRole('button', { name: 'Show/Hide columns' })
      );
      await user.click(screen.getByText('Created'));

      // Rest in a snapshot
      expect(view.asFragment()).toMatchSnapshot();
    });

    it('renders correctly when there are no items to display', async () => {
      props.system = { ...props.system, id: 'invalid' } as System;

      createView();

      expect(screen.getByText('No items found')).toBeInTheDocument();
    });

    it('links to catalogue item landing page', async () => {
      createView();

      // Name (obtained from catalogue category item)
      await waitFor(
        () => {
          expect(
            screen.getByRole('cell', {
              name: `Turbomolecular Pumps 42 (2)`,
            })
          ).toBeInTheDocument();
        },
        { timeout: 4000 }
      );

      expect(
        screen.getByRole('link', {
          name: `Turbomolecular Pumps 42`,
        })
      ).toHaveAttribute('href', '/catalogue/13/items/21');
    });

    it('can set a table filter and clear them again', async () => {
      createView();

      // Name (obtained from catalogue category item)
      await waitFor(
        () => {
          expect(
            screen.getByRole('cell', {
              name: `Turbomolecular Pumps 42 (2)`,
            })
          ).toBeInTheDocument();
        },
        { timeout: 4000 }
      );

      const clearFiltersButton = screen.getByRole('button', {
        name: 'Clear Filters',
      });
      expect(clearFiltersButton).toBeDisabled();

      await user.type(screen.getByLabelText('Filter by Serial Number'), '43');

      await waitFor(
        () => {
          expect(
            screen.queryByRole('cell', {
              name: `Turbomolecular Pumps 42 (2)`,
            })
          ).not.toBeInTheDocument();
        },
        { timeout: 4000 }
      );

      await user.click(clearFiltersButton);

      await waitFor(
        () => {
          expect(
            screen.getByRole('cell', {
              name: `Turbomolecular Pumps 42 (2)`,
            })
          ).toBeInTheDocument();
        },
        { timeout: 4000 }
      );
    });

    it('displays delivered date grouped cell', async () => {
      createView();

      // Name (obtained from catalogue category item)
      await waitFor(
        () => {
          expect(
            screen.getByRole('cell', {
              name: 'Turbomolecular Pumps 42 (2)',
            })
          ).toBeInTheDocument();
        },
        { timeout: 4000 }
      );

      await user.click(screen.getByTestId('CancelIcon'));

      // Delivered date column action button
      await user.click(
        screen.getAllByRole('button', { name: 'Column Actions' })[3]
      );

      await user.click(await screen.findByText('Group by Delivered Date'));

      expect(
        screen.getByRole('tooltip', { name: '09 Sep 2023 (1)' })
      ).toBeInTheDocument();

      expect(
        screen.getByRole('tooltip', { name: 'No Delivered Date (1)' })
      ).toBeInTheDocument();
    });

    it('can select and deselect items', async () => {
      createView();

      // Name (obtained from catalogue category item)
      await waitFor(
        () => {
          expect(
            screen.getByRole('cell', {
              name: `Turbomolecular Pumps 42 (2)`,
            })
          ).toBeInTheDocument();
        },
        { timeout: 4000 }
      );

      expect(screen.getByRole('button', { name: 'Move to' })).toBeDisabled();

      const checkboxes = screen.getAllByRole('checkbox', {
        name: 'Toggle select row',
      });

      await user.click(checkboxes[0]);
      await user.click(checkboxes[1]);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Move to' })).toBeEnabled();
      });

      await user.click(checkboxes[0]);
      await user.click(checkboxes[1]);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Move to' })).toBeDisabled();
      });
    });

    it('can open and close the move items dialog', async () => {
      createView();

      // Name (obtained from catalogue category item)
      await waitFor(
        () => {
          expect(
            screen.getByRole('cell', {
              name: `Turbomolecular Pumps 42 (2)`,
            })
          ).toBeInTheDocument();
        },
        { timeout: 4000 }
      );

      expect(screen.getByRole('button', { name: 'Move to' })).toBeDisabled();

      const checkboxes = screen.getAllByRole('checkbox', {
        name: 'Toggle select row',
      });

      await user.click(checkboxes[0]);

      const moveToButton = screen.getByRole('button', { name: 'Move to' });
      await waitFor(() => {
        expect(moveToButton).toBeEnabled();
      });

      await user.click(moveToButton);

      expect(screen.getByRole('dialog')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Cancel' }));

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });

  describe('SystemItemsTable (usageStatus)', () => {
    const onChangeUsageStatuses = vi.fn();
    const onChangeItemUsageStatusesErrorState = vi.fn();
    const onChangeAggregatedCellUsageStatus = vi.fn();
    const moveToSelectedItems: Item[] = [
      ItemJSON[0],
      ItemJSON[1],
      ItemJSON[22],
      ItemJSON[23],
    ];

    beforeEach(() => {
      props = {
        system: undefined,
        type: 'usageStatus',
        onChangeAggregatedCellUsageStatus,
        onChangeUsageStatuses,
        onChangeItemUsageStatusesErrorState,
        aggregatedCellUsageStatus: [
          { catalogue_item_id: '1', usage_status_id: '' },
          { catalogue_item_id: '25', usage_status_id: '' },
        ],
        usageStatuses: [
          { item_id: 'KvT2Ox7n', catalogue_item_id: '1', usage_status_id: '' },
          { item_id: 'G463gOIA', catalogue_item_id: '1', usage_status_id: '' },
          { item_id: '7Lrj9KVu', catalogue_item_id: '25', usage_status_id: '' },
          { item_id: 'QQen23yW', catalogue_item_id: '25', usage_status_id: '' },
        ],
        itemUsageStatusesErrorState: {},
        moveToSelectedItems: moveToSelectedItems,
      };
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
      expect(onChangeAggregatedCellUsageStatus).toHaveBeenCalledWith([
        { catalogue_item_id: '1', usage_status_id: '2' },
        { catalogue_item_id: '25', usage_status_id: '' },
      ]);

      await modifyUsageStatus({ cameras6: 'Used' });

      // Change usages status for cameras 6 items
      expect(onChangeUsageStatuses).toHaveBeenCalledWith([
        { item_id: 'KvT2Ox7n', catalogue_item_id: '1', usage_status_id: '2' },
        { item_id: 'G463gOIA', catalogue_item_id: '1', usage_status_id: '2' },
        { item_id: '7Lrj9KVu', catalogue_item_id: '25', usage_status_id: '2' },
        { item_id: 'QQen23yW', catalogue_item_id: '25', usage_status_id: '2' },
      ]);
      expect(onChangeAggregatedCellUsageStatus).toHaveBeenCalledWith([
        { catalogue_item_id: '1', usage_status_id: '2' },
        { catalogue_item_id: '25', usage_status_id: '2' },
      ]);
    });

    it('set the initial aggregated Cell Usage Status  ', async () => {
      props.aggregatedCellUsageStatus = [];
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

      await waitFor(() => {
        expect(onChangeAggregatedCellUsageStatus).toHaveBeenCalledWith([
          { catalogue_item_id: '1', usage_status_id: '' },
          { catalogue_item_id: '25', usage_status_id: '' },
        ]);
      });
    });

    it('selects the correct usage status text value according to the number value', async () => {
      props.aggregatedCellUsageStatus = [
        { catalogue_item_id: '1', usage_status_id: '0' },
        { catalogue_item_id: '25', usage_status_id: '1' },
      ];

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

      expect((await screen.findAllByRole('combobox'))[1]).toHaveValue('New');
      expect(screen.getAllByRole('combobox')[2]).toHaveValue('In Use');
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
});
