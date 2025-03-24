import { RenderResult, screen, waitFor } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { storageApi } from '../api/api';
import AttachmentsJSON from '../mocks/Attachments.json';
import ImagesJSON from '../mocks/Images.json';
import { renderComponentWithRouterProvider } from '../testUtils';
import DownloadFileDialog, {
  DownloadFileProps,
} from './downloadFileDialog.component';
import { MockInstance } from 'vitest';

vi.mock('../handleIMS_APIError');

describe('Download File dialog', () => {
  let axiosGetSpy : MockInstance;
  let props: DownloadFileProps;
  let user: UserEvent;
  const onClose = vi.fn();
  const createView = (): RenderResult => {
    return renderComponentWithRouterProvider(<DownloadFileDialog {...props} />);
  };

  beforeEach(() => {
    axiosGetSpy = vi.spyOn(storageApi, 'get');
    user = userEvent.setup();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Download an image', () => {
    beforeEach(() => {
      props = {
        open: true,
        onClose: onClose,
        fileType: 'Image',
        file: ImagesJSON[0],
      };
    });

    it('calls handleClick and sends image get request when the continue button is clicked', async () => {
      createView();
      const continueButton = screen.getByRole('button', { name: 'Continue' });

      await waitFor(() => {
        expect(continueButton).not.toBeDisabled();
      });

      await user.click(continueButton);

      expect(axiosGetSpy).toHaveBeenCalledWith('/images/1')

      await waitFor(() => {
        expect(onClose).toHaveBeenCalled();
      });
    });
  });

  describe('Download an attachment', () => {
    beforeEach(() => {
      props = {
        open: true,
        onClose: onClose,
        fileType: 'Attachment',
        file: AttachmentsJSON[0],
      };
    });

    it('calls handleClick and sends attachment get request when the continue button is clicked', async () => {
      createView();
      const continueButton = screen.getByRole('button', { name: 'Continue' });

      await waitFor(() => {
        expect(continueButton).not.toBeDisabled();
      });

      await user.click(continueButton);

      expect(axiosGetSpy).toHaveBeenCalledWith('/attachments/1')

      await waitFor(() => {
        expect(onClose).toHaveBeenCalled();
      });
    });

  });

  it('calls onClose when cancel button is clicked', async () => {
    createView();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onClose).toHaveBeenCalled();

    expect(axiosGetSpy).not.toHaveBeenCalled();
  });

});
