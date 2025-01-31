import { RenderResult, screen, waitFor } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { http } from 'msw';
import { APIImage } from '../api/api.types';
import ImagesJSON from '../mocks/Images.json';
import { server } from '../mocks/server';
import { renderComponentWithRouterProvider } from '../testUtils';
import DownloadFileDialog, {
  DownloadFileProps,
} from './downloadFileDialog.component';

vi.mock('../handleIMS_APIError');

describe('Download File dialog', () => {
  let props: DownloadFileProps;
  let user: UserEvent;
  const onClose = vi.fn();
  let file: APIImage;
  const createView = (): RenderResult => {
    return renderComponentWithRouterProvider(<DownloadFileDialog {...props} />);
  };

  beforeEach(() => {
    file = ImagesJSON[0];
    props = {
      open: true,
      onClose: onClose,
      fileType: 'Image',
      file: file,
    };
    user = userEvent.setup();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('calls handleDownloadImages when the continue button is clicked', async () => {
    createView();
    const continueButton = screen.getByRole('button', { name: 'Continue' });

    await waitFor(() => {
      expect(continueButton).not.toBeDisabled();
    });

    await user.click(continueButton);

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('disables continue button and shows circular progress indicator when request is pending', async () => {
    server.use(
      http.get('/images/:id', () => {
        return new Promise(() => {});
      })
    );

    createView();
    const continueButton = screen.getByRole('button', { name: 'Continue' });
    // Request is only enabled when id is set (which happens when continue is clicked)
    continueButton.click();
    await waitFor(() => expect(continueButton).toBeDisabled());
    expect(await screen.findByRole('progressbar')).toBeInTheDocument();
  });

  it('calls onClose when cancel button is clicked', async () => {
    createView();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(props.onClose).toHaveBeenCalled();
  });

  it('displays warning message when session data is not loaded', async () => {
    file.id = '5';
    createView();

    const continueButton = screen.getByRole('button', { name: 'Continue' });

    await waitFor(() => {
      expect(continueButton).not.toBeDisabled();
    });

    await user.click(continueButton);

    expect(
      await screen.findByText('No data provided. Please refresh and try again')
    ).toBeInTheDocument();
  });
});
