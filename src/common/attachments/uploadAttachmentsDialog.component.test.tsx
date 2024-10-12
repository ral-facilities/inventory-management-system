import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { act } from 'react';
import { renderComponentWithRouterProvider } from '../../testUtils';

import { MockInstance } from 'vitest';
import { storageApi } from '../../api/api';
import UploadAttachmentsDialog, {
  UploadAttachmentsDialogProps,
} from './uploadAttachmentsDialog.component';

//
describe('Upload attachment dialog', () => {
  let props: UploadAttachmentsDialogProps;
  let user: UserEvent;
  let axiosPostSpy: MockInstance;
  let xhrPostSpy: MockInstance;

  const onClose = vi.fn();

  const createView = () => {
    return renderComponentWithRouterProvider(
      <UploadAttachmentsDialog {...props} />
    );
  };

  beforeEach(() => {
    props = {
      open: true,
      onClose: onClose,
      entityId: '1',
    };
    user = userEvent.setup();
    axiosPostSpy = vi.spyOn(storageApi, 'post');
    xhrPostSpy = vi.spyOn(window.XMLHttpRequest.prototype, 'open');
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
    axiosPostSpy.mockRestore();
    xhrPostSpy.mockRestore();
  });

  it('renders dialog correctly', async () => {
    let baseElement;
    await act(async () => {
      baseElement = createView().baseElement;
    });

    expect(
      screen.getByText('Files cannot be larger than 100MB')
    ).toBeInTheDocument();
    expect(baseElement).toMatchSnapshot();
  });

  it('calls onclose when close button is clicked', async () => {
    createView();

    await user.click(screen.getByRole('button', { name: 'Close' }));

    expect(onClose).toHaveBeenCalled();
  });

  it('posts attachment metadata successfully', async () => {
    // Render the component

    createView();

    const file1 = new File(['test'], 'test1.txt', {
      type: 'text/plain',
    });

    // Find the Uppy Dashboard's drop zone (it usually has a label like "Drop files here" or "Browse files")
    const dropZone = screen.getByText(/files cannot be larger than/i);

    // Create a drag-and-drop event for the file
    Object.defineProperty(dropZone, 'files', {
      value: [file1],
    });

    // Fire the drop event

    fireEvent.drop(dropZone, {
      dataTransfer: {
        files: [file1],
      },
    });

    // Wait for the UI to update with the added file
    await waitFor(() => {
      expect(screen.getByText('test1.txt')).toBeInTheDocument();
    });

    await user.click(await screen.findByText('Upload 1 file'));

    // Assert axios post was called
    expect(axiosPostSpy).toHaveBeenCalledWith('/attachments', {
      description: '',
      entity_id: '1',
      file_name: 'test1.txt',
      title: '',
    });

    expect(xhrPostSpy).toHaveBeenCalledWith(
      'POST',
      'object-storage/test1',
      true
    );
  });
  // Works locally but doesn't work on CI
  it.skip('errors when presigned url fails', async () => {
    // Render the component

    createView();

    const file1 = new File(['test'], 'uploadError.txt', {
      type: 'text/plain',
    });

    // Find the Uppy Dashboard's drop zone (it usually has a label like "Drop files here" or "Browse files")
    const dropZone = screen.getByText(/files cannot be larger than/i);

    // Create a drag-and-drop event for the file
    Object.defineProperty(dropZone, 'files', {
      value: [file1],
    });

    // Fire the drop event

    fireEvent.drop(dropZone, {
      dataTransfer: {
        files: [file1],
      },
    });

    // Wait for the UI to update with the added file
    await waitFor(() => {
      expect(screen.getByText('uploadError.txt')).toBeInTheDocument();
    });

    await user.click(await screen.findByText('Upload 1 file'));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Close' })).toBeDisabled();
    });

    // Assert axios post was called
    expect(axiosPostSpy).toHaveBeenCalledWith('/attachments', {
      description: '',
      entity_id: '1',
      file_name: 'uploadError.txt',
      title: '',
    });

    expect(xhrPostSpy).toHaveBeenCalledWith(
      'POST',
      'object-storage/uploadError',
      true
    );
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Close' })).not.toBeDisabled();
    });
    expect(await screen.findByText('Upload failed')).toBeInTheDocument();
    expect(
      await screen.findByLabelText('Show error details')
    ).toBeInTheDocument();
  }, 20000);

  it('errors when file is removed mid upload', async () => {
    // Render the component

    createView();

    const file1 = new File(['test'], 'removeError.txt', {
      type: 'text/plain',
    });

    // Find the Uppy Dashboard's drop zone (it usually has a label like "Drop files here" or "Browse files")
    const dropZone = screen.getByText(/files cannot be larger than/i);

    // Create a drag-and-drop event for the file
    Object.defineProperty(dropZone, 'files', {
      value: [file1],
    });

    // Fire the drop event

    fireEvent.drop(dropZone, {
      dataTransfer: {
        files: [file1],
      },
    });

    // Wait for the UI to update with the added file
    await waitFor(() => {
      expect(screen.getByText('removeError.txt')).toBeInTheDocument();
    });

    await user.click(await screen.findByText('Upload 1 file'));

    // Assert axios post was called
    expect(axiosPostSpy).toHaveBeenCalledWith('/attachments', {
      description: '',
      entity_id: '1',
      file_name: 'removeError.txt',
      title: '',
    });

    expect(xhrPostSpy).toHaveBeenCalledWith(
      'POST',
      'object-storage/removeError',
      true
    );

    await user.click(
      await screen.findByRole('button', { name: 'Remove file' })
    );

    expect(screen.queryByText('Upload 1 file')).not.toBeInTheDocument();
  });
});
