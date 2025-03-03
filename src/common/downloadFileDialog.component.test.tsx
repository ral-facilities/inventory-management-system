import { RenderResult, screen, waitFor } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import ImagesJSON from '../mocks/Images.json';
import { renderComponentWithRouterProvider } from '../testUtils';
import DownloadFileDialog, {
  DownloadFileProps,
} from './downloadFileDialog.component';

vi.mock('../handleIMS_APIError');

describe('Download File dialog', () => {
  let props: DownloadFileProps;
  let user: UserEvent;
  const onClose = vi.fn();
  const createView = (): RenderResult => {
    return renderComponentWithRouterProvider(<DownloadFileDialog {...props} />);
  };

  beforeEach(() => {
    props = {
      open: true,
      onClose: onClose,
      fileType: 'Image',
      file: ImagesJSON[0],
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

  it('calls onClose when cancel button is clicked', async () => {
    createView();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onClose).toHaveBeenCalled();
  });
});
