import { fireEvent, screen, waitFor } from '@testing-library/react';
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

    it('cannot move selected items to root and resets back to an non error state after error have been resolved', async () => {
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
        expect(screen.getByText('Giant laser')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Giant laser'));

      await waitFor(() => {
        expect(screen.getByText('Smaller laser')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: 'Move here' }));

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
  });
});
