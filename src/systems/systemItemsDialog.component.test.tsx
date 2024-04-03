import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { imsApi } from '../api/api';
import { Item } from '../app.types';
import ItemsJSON from '../mocks/Items.json';
import { renderComponentWithRouterProvider } from '../testUtils';
import SystemItemsDialog, {
  SystemItemsDialogProps,
} from './systemItemsDialog.component';

describe('SystemItemsDialog', () => {
  let props: SystemItemsDialogProps;
  let user: UserEvent;
  let axiosPatchSpy;

  const mockOnClose = vi.fn();
  const mockOnChangeSelectedItems = vi.fn();

  const mockSelectedItems: Item[] = [
    ItemsJSON[0] as Item,
    ItemsJSON[1] as Item,
  ];

  const createView = () => {
    return renderComponentWithRouterProvider(<SystemItemsDialog {...props} />);
  };

  beforeEach(() => {
    props = {
      open: true,
      onClose: mockOnClose,
      selectedItems: mockSelectedItems,
      onChangeSelectedItems: mockOnChangeSelectedItems,
      parentSystemId: null,
    };

    user = userEvent.setup();
    axiosPatchSpy = vi.spyOn(imsApi, 'patch');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const selectUsageStatus = async (values: {
    index: number;
    usageStatus: string;
  }) => {
    await user.click(screen.getAllByRole('combobox')[values.index]);

    const dropdown = await screen.findByRole('listbox');

    await user.click(
      within(dropdown).getByRole('option', { name: values.usageStatus })
    );
  };
  it('calls onClose when Cancel button is clicked', async () => {
    createView();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(axiosPatchSpy).not.toHaveBeenCalled();
    expect(mockOnChangeSelectedItems).not.toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('does not close dialog on background click, or on escape key press', async () => {
    createView();

    await userEvent.click(document.body);

    expect(mockOnClose).not.toHaveBeenCalled();

    fireEvent.keyDown(screen.getByRole('dialog'), {
      key: 'Escape',
      code: 'Escape',
      keyCode: 27,
      charCode: 27,
    });

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('renders the breadcrumbs and navigates correctly', async () => {
    createView();

    await waitFor(() => {
      expect(screen.getByText('Giant laser')).toBeInTheDocument();
    });

    expect(
      screen.queryByRole('link', { name: 'Giant laser' })
    ).not.toBeInTheDocument();

    await user.click(screen.getByText('Giant laser'));

    await waitFor(() => {
      expect(screen.getByText('Smaller laser')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Smaller laser'));

    await waitFor(() => {
      expect(screen.getByText('Pulse Laser')).toBeInTheDocument();
    });

    expect(
      screen.getByRole('link', { name: 'Giant laser' })
    ).toBeInTheDocument();
    expect(screen.getByText('Smaller laser')).toBeInTheDocument();

    // Jump back to home again
    await user.click(screen.getByLabelText('navigate to systems home'));

    await waitFor(() => {
      expect(screen.queryByText('Smaller laser')).not.toBeInTheDocument();
    });
    expect(screen.getByText('Giant laser')).toBeInTheDocument();
  });

  it('starts navigation in the parent when given', async () => {
    props.parentSystemId = '65328f34a40ff5301575a4e4';

    createView();

    await waitFor(() => {
      expect(screen.getByText('Pulse Laser')).toBeInTheDocument();
    });

    expect(
      screen.getByRole('link', { name: 'Giant laser' })
    ).toBeInTheDocument();
    expect(screen.getByText('Smaller laser')).toBeInTheDocument();
  });

  describe('Move to', () => {
    it('renders dialog correctly with multiple selected items', () => {
      createView();

      expect(
        screen.getByText('Move 2 items to a different system')
      ).toBeInTheDocument();
    });

    it('renders dialog correctly with one selected item', () => {
      props.selectedItems = [mockSelectedItems[0]];

      createView();

      expect(
        screen.getByText('Move 1 item to a different system')
      ).toBeInTheDocument();
    });

    it('cannot move selected items to the same parent system and resets back to an non error state after error have been resolved', async () => {
      props.parentSystemId = '65328f34a40ff5301575a4e3';

      createView();

      await waitFor(() => {
        expect(screen.getByText('Giant laser')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Giant laser'));

      await waitFor(() => {
        expect(screen.getByText('Smaller laser')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: 'Next' }));

      expect(
        await screen.findByRole('button', { name: 'Next' })
      ).toBeDisabled();
      expect(
        screen.getByText(
          'Move items from current location or root to another directory'
        )
      ).toBeInTheDocument();

      await user.click(screen.getByText('Smaller laser'));

      expect(
        await screen.findByRole('button', { name: 'Next' })
      ).not.toBeDisabled();
      expect(
        screen.queryByText(
          'Move items from current location or root to another directory'
        )
      ).not.toBeInTheDocument();
    });

    it('cannot move selected items to the same parent system and resets back to an non error state after error have been resolved (root)', async () => {
      props.parentSystemId = '65328f34a40ff5301575a4e3';

      createView();

      await waitFor(() => {
        expect(screen.getByText('Giant laser')).toBeInTheDocument();
      });

      await user.click(screen.getByLabelText('navigate to systems home'));

      await waitFor(() => {
        expect(screen.getByText('Giant laser')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: 'Next' }));

      expect(
        await screen.findByRole('button', { name: 'Next' })
      ).toBeDisabled();
      expect(
        screen.getByText(
          'Move items from current location or root to another directory'
        )
      ).toBeInTheDocument();

      await user.click(screen.getByText('Pulse Laser'));

      expect(
        await screen.findByRole('button', { name: 'Next' })
      ).not.toBeDisabled();
      expect(
        screen.queryByText(
          'Move items from current location or root to another directory'
        )
      ).not.toBeInTheDocument();
    });

    it('sets the finish button to disabled when the usage statues and system is not set and clears the states when resolved', async () => {
      props.parentSystemId = '65328f34a40ff5301575a4e3';

      createView();

      await waitFor(() => {
        expect(screen.getByText('Giant laser')).toBeInTheDocument();
      });
      await user.click(screen.getByText('Set usage statues'));
      await user.click(screen.getByRole('button', { name: 'Finish' }));

      expect(
        await screen.findByRole('button', { name: 'Finish' })
      ).toBeDisabled();
      expect(
        screen.getByText(
          'Move items from current location or root to another directory'
        )
      ).toBeInTheDocument();
      expect(
        screen.getByText('Please select a usage status for all items')
      ).toBeInTheDocument();

      await user.click(screen.getAllByLabelText('Expand all')[1]);
      const helperTexts = screen.getAllByText('Please select a usage status');
      expect(helperTexts.length).toEqual(2);

      await user.click(screen.getByText('Place into a system'));

      await waitFor(() => {
        expect(screen.getByText('Smaller laser')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Smaller laser'));
      await user.click(await screen.findByRole('button', { name: 'Next' }));
      expect(
        screen.queryByText(
          'Move items from current location or root to another directory'
        )
      ).not.toBeInTheDocument();

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

      await selectUsageStatus({ index: 1, usageStatus: 'Used' });

      expect(
        await screen.findByRole('button', { name: 'Finish' })
      ).not.toBeDisabled();
      expect(
        screen.queryByText('Please select a usage status for all items')
      ).not.toBeInTheDocument();
    }, 10000);

    it('moves selected systems (to non-root system)', async () => {
      createView();

      await waitFor(() => {
        expect(screen.getByText('Giant laser')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Giant laser'));

      await waitFor(() => {
        expect(screen.getByText('Smaller laser')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: 'Next' }));

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
      await user.click(screen.getAllByLabelText('Expand all')[1]);

      await selectUsageStatus({
        index: 2,
        usageStatus: 'Used',
      });

      await selectUsageStatus({
        index: 3,
        usageStatus: 'Used',
      });

      await user.click(screen.getByRole('button', { name: 'Back' }));
      await user.click(screen.getByRole('button', { name: 'Next' }));

      await user.click(screen.getByRole('button', { name: 'Finish' }));

      expect(axiosPatchSpy).toHaveBeenCalledWith('/v1/items/KvT2Ox7n', {
        system_id: '65328f34a40ff5301575a4e3',
        usage_status: 2,
      });
      expect(axiosPatchSpy).toHaveBeenCalledWith('/v1/items/G463gOIA', {
        system_id: '65328f34a40ff5301575a4e3',
        usage_status: 2,
      });

      expect(mockOnClose).toHaveBeenCalled();
      expect(mockOnChangeSelectedItems).toHaveBeenCalledWith({});
    });
  });
});
