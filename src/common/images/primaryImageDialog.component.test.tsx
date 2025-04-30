import { screen, waitFor } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { act } from 'react';
import { MockInstance } from 'vitest';
import { storageApi } from '../../api/api';
import handleIMS_APIError from '../../handleIMS_APIError';
import { server } from '../../mocks/server';
import { renderComponentWithRouterProvider } from '../../testUtils';
import PrimaryImageDialog, {
  PrimaryImageProps,
} from './primaryImageDialog.component';

vi.mock('../../handleIMS_APIError');

describe('Primary Image Dialog', () => {
  let props: PrimaryImageProps;
  let user: UserEvent;
  let axiosPatchSpy: MockInstance;
  const onClose = vi.fn();

  const createView = () => {
    return renderComponentWithRouterProvider(<PrimaryImageDialog {...props} />);
  };

  beforeEach(() => {
    props = {
      open: true,
      onClose: onClose,
      entityID: '1',
    };
    user = userEvent.setup();
    axiosPatchSpy = vi.spyOn(storageApi, 'patch');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', async () => {
    let baseElement;
    await act(async () => {
      baseElement = createView().baseElement;
    });

    await waitFor(
      () => {
        expect(screen.queryAllByRole('progressbar')).toHaveLength(0);
      },
      { timeout: 10000 }
    );

    expect((await screen.findAllByText('logo1.png')).length).toEqual(9);

    expect(baseElement).toMatchSnapshot();
  });

  it('can open and close the upload dialog', async () => {
    createView();

    await waitFor(() =>
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    );

    expect((await screen.findAllByText('logo1.png')).length).toEqual(9);

    const uploadImageButton = screen.getByRole('button', {
      name: 'Upload Images',
    });

    await user.click(uploadImageButton);
    await waitFor(() => {
      expect(screen.getAllByRole('dialog').length).toBe(2);
    });

    const closeButton = screen.getByRole('button', { name: 'Close Modal' });
    await user.click(closeButton);
    await waitFor(() => {
      expect(screen.queryAllByRole('dialog').length).toBe(1);
    });
  });

  it('renders no results page correctly, and can still open and close the upload dialog', async () => {
    server.use(
      http.get('/images', async () => {
        return HttpResponse.json([], { status: 200 });
      })
    );
    let baseElement;
    await act(async () => {
      baseElement = createView().baseElement;
    });

    await waitFor(() =>
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    );

    expect(
      screen.getByText(
        'Please add an image by clicking the Upload Images button.'
      )
    ).toBeInTheDocument();

    expect(screen.queryByText('logo1.png')).not.toBeInTheDocument();
    expect(baseElement).toMatchSnapshot();

    const uploadImageButton = screen.getByRole('button', {
      name: 'Upload Images',
    });

    await user.click(uploadImageButton);
    await waitFor(() => {
      expect(screen.getAllByRole('dialog').length).toBe(2);
    });

    const closeButton = screen.getByRole('button', { name: 'Close Modal' });
    await user.click(closeButton);
    await waitFor(() => {
      expect(screen.getAllByRole('dialog').length).toBe(1);
    });
  });

  it('calls onClose when Close button is clicked', async () => {
    createView();
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('sets an image to primary', async () => {
    createView();

    await waitFor(() =>
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    );

    expect((await screen.findAllByText('logo1.png')).length).toEqual(9);

    const imageCard = screen.getAllByRole('radio', {
      name: 'Toggle select card',
    })[0];
    await user.click(imageCard);

    const saveButton: HTMLButtonElement = screen.getByRole('button', {
      name: 'Save',
    });

    await waitFor(() => expect(saveButton.disabled).toBe(false));

    await user.click(saveButton);

    await waitFor(() => expect(onClose).toHaveBeenCalled());

    expect(axiosPatchSpy).toHaveBeenCalledWith('/images/1', {
      primary: true,
    });
  });

  it('displays error message if an unknown error occurs', async () => {
    createView();
    await waitFor(() =>
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    );

    expect((await screen.findAllByText('logo1.png')).length).toEqual(9);

    const imageCard = screen.getAllByRole('radio', {
      name: 'Toggle select card',
    })[16];

    await user.click(imageCard);

    const saveButton: HTMLButtonElement = screen.getByRole('button', {
      name: 'Save',
    });

    await waitFor(() => expect(saveButton.disabled).toBe(false));

    await user.click(saveButton);

    await waitFor(() => expect(handleIMS_APIError).toHaveBeenCalled());
  });
});
