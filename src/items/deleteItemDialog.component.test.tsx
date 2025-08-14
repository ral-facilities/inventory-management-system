import {
  RenderResult,
  fireEvent,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { http } from 'msw';
import { act } from 'react';
import { Item } from '../api/api.types';
import handleIMS_APIError from '../handleIMS_APIError';
import SystemJSON from '../mocks/Systems.json';
import { server } from '../mocks/server';
import { getItemById, renderComponentWithRouterProvider } from '../testUtils';
import DeleteItemDialog, {
  DeleteItemDialogProps,
} from './deleteItemDialog.component';

vi.mock('../handleIMS_APIError');

describe('delete item dialog', () => {
  let props: DeleteItemDialogProps;
  let user: UserEvent;
  const onClose = vi.fn();
  const onChangeItem = vi.fn();
  let item: Item;

  const createView = (): RenderResult => {
    return renderComponentWithRouterProvider(<DeleteItemDialog {...props} />);
  };

  beforeEach(() => {
    item = getItemById('KvT2Ox7n');
    props = {
      open: true,
      onClose: onClose,
      item: item,
      onChangeItem: onChangeItem,
    };
    user = userEvent.setup(); // Assigning userEvent to 'user'
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', async () => {
    createView();
    let baseElement;
    await act(async () => {
      baseElement = createView().baseElement;
    });
    expect(baseElement).toMatchSnapshot();
  });

  it('renders correctly when the item has an system id', async () => {
    props.item = getItemById('wKsFzrSq');
    let baseElement;
    await act(async () => {
      baseElement = createView().baseElement;
    });

    await waitFor(() => {
      expect(
        screen.getByRole('link', { name: 'Pico Laser' })
      ).toBeInTheDocument();
    });
    expect(baseElement).toMatchSnapshot();
  });

  it('disables continue button and shows circular progress indicator when request is pending', async () => {
    item.system_id = SystemJSON[0].id;
    server.use(
      http.delete('/v1/items/:id', () => {
        return new Promise(() => {});
      })
    );

    createView();

    const continueButton = screen.getByRole('button', { name: 'Continue' });
    await user.click(continueButton);

    expect(continueButton).toBeDisabled();
    expect(await screen.findByRole('progressbar')).toBeInTheDocument();
  });

  it('calls onClose when Close button is clicked', async () => {
    createView();
    const closeButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(closeButton);

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('does not close dialog on background click, or on escape key press', async () => {
    createView();

    await userEvent.click(document.body);

    expect(onClose).not.toHaveBeenCalled();

    fireEvent.keyDown(screen.getByRole('dialog'), {
      key: 'Escape',
      code: 'Escape',
      keyCode: 27,
      charCode: 27,
    });

    expect(onClose).not.toHaveBeenCalled();
  });

  it('calls handleDeleteSession when continue button is clicked with', async () => {
    item.system_id = SystemJSON[0].id;
    createView();
    const continueButton = screen.getByRole('button', { name: 'Continue' });
    await user.click(continueButton);

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('displays error message if an unknown error occurs', async () => {
    item.id = 'Error 500';
    item.system_id = SystemJSON[0].id;

    createView();
    const continueButton = screen.getByRole('button', { name: 'Continue' });
    await user.click(continueButton);

    expect(handleIMS_APIError).toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('displays error message user tries delete item from a system type which is not allowed', async () => {
    createView();
    const continueButton = screen.getByRole('button', { name: 'Continue' });
    await user.click(continueButton);

    expect(
      await screen.findByText(
        'Please move item to a system with Type: Storage before trying to delete.'
      )
    ).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('renders correctly when items has no serial number', async () => {
    props.item = { ...getItemById('wKsFzrSq'), serial_number: null } as Item;
    createView();
    let baseElement;
    await act(async () => {
      baseElement = createView().baseElement;
    });

    await waitFor(() => {
      expect(
        screen.getByRole('link', { name: 'Pico Laser' })
      ).toBeInTheDocument();
    });
    expect(baseElement).toMatchSnapshot();
  });
});
