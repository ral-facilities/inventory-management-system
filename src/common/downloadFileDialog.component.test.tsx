import { RenderResult, screen, waitFor } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { http } from 'msw';
import handleIMS_APIError from '../../handleIMS_APIError';
import { server } from '../../mocks/server';
import { renderComponentWithRouterProvider } from '../../testUtils';
import { APIImageWithURL } from '../api/api.types';
import DownloadFileDialog, {
  DownloadFileProps,
} from './downloadFileDialog.component';

vi.mock('../../handleIMS_APIError');

describe('Download File dialog', () => {
  let props: DownloadFileProps;
  let user: UserEvent;
  const onClose = vi.fn();
  let file: APIImageWithURL;
  const createView = (): RenderResult => {
    return renderComponentWithRouterProvider(<DownloadFileDialog {...props} />);
  };

  beforeEach(() => {
    file = {
      id: '1',
      file_name: 'test',
      title: 'test',
      description: 'test',
      primary: false,
      thumbnail_base64:
        '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',
      created_time: '2024-01-01T12:00:00.000+00:00',
      modified_time: '2024-01-02T13:10:10.000+00:00',
    };
    props = {
      open: true,
      onClose: onClose,
      usageStatus: usageStatus,
    };
    user = userEvent.setup();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('displays warning message when session data is not loaded', async () => {
    props = {
      ...props,
      usageStatus: undefined,
    };
    createView();
    const continueButton = screen.getByRole('button', { name: 'Continue' });
    await user.click(continueButton);
    const helperTexts = screen.getByText(
      'No data provided. Please refresh and try again'
    );
    expect(helperTexts).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('disables continue button and shows circular progress indicator when request is pending', async () => {
    server.use(
      http.delete('/v1/usage-statuses/:id', () => {
        return new Promise(() => {});
      })
    );

    createView();
    const continueButton = screen.getByRole('button', { name: 'Continue' });
    await user.click(continueButton);

    expect(continueButton).toBeDisabled();
    expect(await screen.findByRole('progressbar')).toBeInTheDocument();
  });

  it('calls handleDeleteUsageStatus when the continue button is clicked and the usage status is not currently used by one or more items ', async () => {
    createView();
    const continueButton = screen.getByRole('button', { name: 'Continue' });
    await user.click(continueButton);

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('displays error message when user tries to delete a usage status that is in an Item', async () => {
    usageStatus.id = '2';
    createView();
    const continueButton = screen.getByRole('button', { name: 'Continue' });
    await user.click(continueButton);

    await waitFor(() => {
      expect(
        screen.getByText(
          'This usage status is currently used by one or more items. Remove all uses before deleting it here.'
        )
      ).toBeInTheDocument();
    });
  });

  it('displays error message if an unknown error occurs', async () => {
    usageStatus.id = '1190';
    createView();
    const continueButton = screen.getByRole('button', { name: 'Continue' });
    await user.click(continueButton);

    expect(handleIMS_APIError).toHaveBeenCalled();
  });
});
