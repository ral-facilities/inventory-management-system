import { fireEvent, screen, waitFor } from '@testing-library/react';
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

  it('calls onClose when Cancel button is clicked', async () => {
    createView();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(axiosPatchSpy).not.toHaveBeenCalled();
    expect(mockOnChangeSelectedItems).not.toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('does not close dialog on background click, but does on escape key', async () => {
    createView();

    await userEvent.click(document.body);

    expect(mockOnClose).not.toHaveBeenCalled();

    fireEvent.keyDown(screen.getByRole('dialog'), {
      key: 'Escape',
      code: 'Escape',
      keyCode: 27,
      charCode: 27,
    });

    expect(mockOnClose).toHaveBeenCalled();
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

    it('cannot move selected items to the same parent system', async () => {
      props.parentSystemId = '65328f34a40ff5301575a4e3';

      createView();

      await waitFor(() => {
        expect(screen.getByText('Giant laser')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Giant laser'));

      await waitFor(() => {
        expect(screen.getByText('Smaller laser')).toBeInTheDocument();
      });

      expect(screen.getByRole('button', { name: 'Move here' })).toBeDisabled();
    });

    it('moves selected systems (to non-root system)', async () => {
      createView();

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
      });
      expect(axiosPatchSpy).toHaveBeenCalledWith('/v1/items/G463gOIA', {
        system_id: '65328f34a40ff5301575a4e3',
      });

      expect(mockOnClose).toHaveBeenCalled();
      expect(mockOnChangeSelectedItems).toHaveBeenCalledWith({});
    });
  });
});
