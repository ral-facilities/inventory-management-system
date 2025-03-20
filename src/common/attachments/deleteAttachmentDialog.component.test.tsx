import {
  RenderResult,
  fireEvent,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { http } from 'msw';
import { AttachmentMetadata } from '../../api/api.types';
import handleIMS_APIError from '../../handleIMS_APIError';
import { server } from '../../mocks/server';
import {
  CREATED_MODIFIED_TIME_VALUES,
  renderComponentWithRouterProvider,
} from '../../testUtils';
import DeleteAttachmentDialog, {
  DeleteAttachmentProps,
} from './deleteAttachmentDialog.component';

vi.mock('../../handleIMS_APIError');

describe('delete Attachment dialogue', () => {
  let props: DeleteAttachmentProps;
  let user: UserEvent;
  const onClose = vi.fn();
  let attachment: AttachmentMetadata;
  const createView = (): RenderResult => {
    return renderComponentWithRouterProvider(<DeleteAttachmentDialog {...props} />);
  };

  beforeEach(() => {
    attachment = {
      id: '1',
      file_name: 'Attachment_A.txt',
      entity_id: '2',
      title: 'a title',
      description: 'a description',
      ...CREATED_MODIFIED_TIME_VALUES,
    };
    props = {
      open: true,
      onClose: onClose,
      attachment: attachment,
    };
    user = userEvent.setup(); // Assigning userEvent to 'user'
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', async () => {
    createView();
    expect(screen.getByText('Delete Attachment')).toBeInTheDocument();
    expect(screen.getByTestId('delete-attachment-name')).toHaveTextContent(
      'Attachment_A.txt'
    );
  });

  it('disables continue button and shows circular progress indicator when request is pending', async () => {
    server.use(
      http.delete('/attachments/:id', () => {
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

  it('calls handleDeleteSession when continue button is clicked', async () => {
    createView();

    const continueButton = screen.getByRole('button', { name: 'Continue' });
    await user.click(continueButton);

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('displays error message if an unknown error occurs', async () => {
    attachment.id = 'Error 500';

    createView();

    const continueButton = screen.getByRole('button', { name: 'Continue' });
    await user.click(continueButton);

    expect(handleIMS_APIError).toHaveBeenCalled();
  });
});
