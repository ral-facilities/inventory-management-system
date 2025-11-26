import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { MockInstance } from 'vitest';
import { imsApi } from '../api/api';
import { Item } from '../api/api.types';
import ItemsJSON from '../mocks/Items.json';
import SystemsJSON from '../mocks/Systems.json';
import { renderComponentWithRouterProvider } from '../testUtils';
import SystemItemsDialog, {
  SystemItemsDialogProps,
} from './systemItemsDialog.component';

describe('SystemItemsDialog', () => {
  let props: SystemItemsDialogProps;
  let user: UserEvent;
  let axiosPatchSpy: MockInstance;

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
      parentSystemId: SystemsJSON[0].id,
      isPrivilegedMode: false,
    };

    user = userEvent.setup();
    axiosPatchSpy = vi.spyOn(imsApi, 'patch');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

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

  it('displays correctly when in admin mode', async () => {
    props.isPrivilegedMode = true;
    let baseElement;
    await act(async () => {
      baseElement = createView().baseElement;
    });

    await waitFor(() => {
      expect(
        screen.getByText('Move 2 items to a different system as Admin')
      ).toBeInTheDocument();
    });

    const infoIcon = screen.getByTestId('admin-status-tooltip');

    await user.hover(infoIcon);

    await waitFor(() => {
      expect(
        screen.getByText(
          "As an admin, you can bypass rules that restrict item placement for other users, and you can modify the item's usage status"
        )
      ).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();

    expect(baseElement).toMatchSnapshot();
  });

  it('renders the breadcrumbs and navigates correctly', async () => {
    createView();

    await waitFor(() =>
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    );

    await user.click(screen.getByLabelText('navigate to systems home'));

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

    it('cannot move selected items to the same parent system and resets back to an non error state after errors have been resolved', async () => {
      props.parentSystemId = SystemsJSON[1].id;

      createView();

      await waitFor(() =>
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
      );

      await user.click(screen.getByRole('button', { name: 'Move here' }));

      expect(
        await screen.findByRole('button', { name: 'Move here' })
      ).toBeDisabled();

      const errorMessage =
        'Please move items from current location or root to another system.';

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      await user.click(screen.getByLabelText('navigate to systems home'));

      await waitFor(() => {
        expect(screen.getByText('Giant laser')).toBeInTheDocument();
      });

      await user.click(screen.getAllByText('Storage')[0]);

      expect(
        await screen.findByRole('button', { name: 'Move here' })
      ).not.toBeDisabled();
      expect(screen.queryByText(errorMessage)).not.toBeInTheDocument();
    });

    it('cannot move selected items to the same parent system and then clears error state they have been resolved (admin mode)', async () => {
      props.parentSystemId = SystemsJSON[1].id;
      props.isPrivilegedMode = true;

      createView();

      await waitFor(() =>
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
      );

      await user.click(screen.getByRole('button', { name: 'Next' }));

      expect(
        await screen.findByRole('button', { name: 'Next' })
      ).toBeDisabled();

      const errorMessage =
        'Please move items from current location or root to another system.';

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      await user.click(screen.getByLabelText('navigate to systems home'));

      await waitFor(() => {
        expect(screen.getByText('Giant laser')).toBeInTheDocument();
      });

      await user.click(screen.getAllByText('Storage')[0]);

      expect(
        await screen.findByRole('button', { name: 'Next' })
      ).not.toBeDisabled();
      expect(screen.queryByText(errorMessage)).not.toBeInTheDocument();
    });

    it('cannot move selected items to root and resets back to an non error state after error has been resolved', async () => {
      props.parentSystemId = SystemsJSON[1].id;

      createView();

      await waitFor(() =>
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
      );

      await user.click(screen.getByLabelText('navigate to systems home'));

      await waitFor(() => {
        expect(screen.getByText('Giant laser')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: 'Move here' }));
      const errorMessage =
        'Please move items from current location or root to another system.';
      expect(
        await screen.findByRole('button', { name: 'Move here' })
      ).toBeDisabled();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();

      await user.click(screen.getAllByText('Storage')[0]);

      expect(
        await screen.findByRole('button', { name: 'Move here' })
      ).not.toBeDisabled();
      expect(screen.queryByText(errorMessage)).not.toBeInTheDocument();
    });

    it('moves selected systems (to non-root system)', async () => {
      createView();

      await waitFor(() =>
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
      );

      await user.click(screen.getByLabelText('navigate to systems home'));

      await waitFor(() => {
        expect(screen.getByText('Pulse Laser')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Pulse Laser'));

      expect(
        await screen.findByText('Item Moving Rule Applied')
      ).toBeInTheDocument();
      expect(
        await screen.findByLabelText(
          'The items usage statuses will be updated to In Use, as defined by the rules'
        )
      ).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Move here' }));

      expect(axiosPatchSpy).toHaveBeenCalledWith('/v1/items/KvT2Ox7n', {
        system_id: '656da8ef9cba7a76c6f81a5d',
        usage_status_id: '1',
      });
      expect(axiosPatchSpy).toHaveBeenCalledWith('/v1/items/G463gOIA', {
        system_id: '656da8ef9cba7a76c6f81a5d',
        usage_status_id: '1',
      });

      expect(mockOnClose).toHaveBeenCalled();
      expect(mockOnChangeSelectedItems).toHaveBeenCalledWith({});
    }, 10000);

    it('moves selected systems (to non-root system with the same system type)', async () => {
      props.parentSystemId = SystemsJSON[2].id;
      createView();

      await waitFor(() =>
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
      );

      await user.click(screen.getByLabelText('navigate to systems home'));

      await waitFor(() => {
        expect(screen.getByText('Pulse Laser')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Pulse Laser'));

      expect(
        await screen.findByText('Item Moving Rule Applied')
      ).toBeInTheDocument();

      expect(
        await screen.findByLabelText(
          'The items usage statuses we remain the same, as defined by the rules'
        )
      ).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Move here' }));

      expect(axiosPatchSpy).toHaveBeenCalledWith('/v1/items/KvT2Ox7n', {
        system_id: '656da8ef9cba7a76c6f81a5d',
      });
      expect(axiosPatchSpy).toHaveBeenCalledWith('/v1/items/G463gOIA', {
        system_id: '656da8ef9cba7a76c6f81a5d',
      });

      expect(mockOnClose).toHaveBeenCalled();
      expect(mockOnChangeSelectedItems).toHaveBeenCalledWith({});
    }, 10000);
  });

  describe('Move to as Admin', () => {
    beforeEach(() => {
      props.isPrivilegedMode = true;
    });

    afterEach(() => {
      vi.clearAllMocks();
    });

    it('prepopulates usage statuses when system is selcted and then successfully moves items', async () => {
      createView();

      await waitFor(() =>
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
      );

      await user.click(screen.getByLabelText('navigate to systems home'));

      await waitFor(() => {
        expect(screen.getByText('Giant laser')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Giant laser'));

      await waitFor(() => {
        expect(screen.getByText('Smaller laser')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: 'Next' }));

      // Ensure no loading bars visible
      await waitFor(() =>
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
      );

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

      await user.click(screen.getAllByLabelText('Expand all')[1]);

      expect((await screen.findAllByRole('combobox'))[2]).toHaveValue('In Use');
      expect(screen.getAllByRole('combobox')[3]).toHaveValue('In Use');

      await user.click(screen.getByRole('button', { name: 'Finish' }));

      expect(axiosPatchSpy).toHaveBeenCalledWith('/v1/items/KvT2Ox7n', {
        system_id: '65328f34a40ff5301575a4e3',
        usage_status_id: '1',
      });
      expect(axiosPatchSpy).toHaveBeenCalledWith('/v1/items/G463gOIA', {
        system_id: '65328f34a40ff5301575a4e3',
        usage_status_id: '1',
      });

      expect(mockOnClose).toHaveBeenCalled();
      expect(mockOnChangeSelectedItems).toHaveBeenCalledWith({});
    }, 10000);

    it('displays error if switching to usage status tab without selecting system', async () => {
      createView();

      await user.click(screen.getByText('Confirm usage statuses'));

      // Ensure no loading bars visible
      await waitFor(() =>
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
      );

      await user.click(screen.getByRole('button', { name: 'Finish' }));

      expect(screen.getByRole('button', { name: 'Finish' })).toBeDisabled();
      expect(
        screen.getByText(
          'Move items from current location or root to another system'
        )
      ).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Back' }));

      await user.click(screen.getByLabelText('navigate to systems home'));

      await waitFor(() => {
        expect(screen.getByText('Giant laser')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Giant laser'));

      await waitFor(() => {
        expect(screen.getByText('Smaller laser')).toBeInTheDocument();
      });

      expect(
        screen.queryByText(
          'Please move items for current location or root to another system'
        )
      ).not.toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Next' }));

      // Ensure no loading bars visible
      await waitFor(() =>
        expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
      );

      expect(screen.getByRole('button', { name: 'Finish' })).not.toBeDisabled();
    }, 10000);
  });
});
