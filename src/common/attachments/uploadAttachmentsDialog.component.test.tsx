import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { delay, http, HttpResponse } from 'msw';
import { act } from 'react';
import { MockInstance } from 'vitest';
import { storageApi } from '../../api/api';
import { server } from '../../mocks/server';
import { renderComponentWithRouterProvider } from '../../testUtils';
import UploadAttachmentsDialog, {
  UploadAttachmentsDialogProps,
} from './uploadAttachmentsDialog.component';

describe('Upload attachment dialog', () => {
  let props: UploadAttachmentsDialogProps;
  let user: UserEvent;
  let axiosDeleteSpy: MockInstance;
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
    axiosDeleteSpy = vi.spyOn(storageApi, 'delete');
    axiosPostSpy = vi.spyOn(storageApi, 'post');
    xhrPostSpy = vi.spyOn(window.XMLHttpRequest.prototype, 'open');
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
    axiosDeleteSpy.mockRestore();
    axiosPostSpy.mockRestore();
    xhrPostSpy.mockRestore();
  });

  it('renders dialog correctly', async () => {
    let baseElement;
    await act(async () => {
      baseElement = createView().baseElement;
    });

    expect(
      screen.getByText('Files cannot be larger than', { exact: false })
    ).toBeInTheDocument();
    expect(baseElement).toMatchSnapshot();
  });

  it('calls onclose when close button is clicked', async () => {
    createView();

    await user.click(screen.getByLabelText('Close Modal'));

    expect(onClose).toHaveBeenCalled();
  });

  it('posts attachment metadata successfully', async () => {
    createView();

    const file1 = new File(['test'], 'test1.txt', {
      type: 'text/plain',
    });

    const dropZone = screen.getByText('Files cannot be larger than', {
      exact: false,
    });

    Object.defineProperty(dropZone, 'files', {
      value: [file1],
    });

    fireEvent.drop(dropZone, {
      dataTransfer: {
        files: [file1],
      },
    });

    await waitFor(() => {
      expect(screen.getByText('test1.txt')).toBeInTheDocument();
    });

    await user.click(
      await screen.findByRole('button', { name: 'Edit file test1.txt' })
    );

    expect(await screen.findByText('File name')).toBeInTheDocument();

    // Checks if file extension is displayed. If it's editable, actual value will disappear after editing.
    expect(await screen.findByText('.txt')).toBeInTheDocument();

    const description: HTMLInputElement = screen.getByRole('textbox', {
      name: 'Description',
    });

    const title: HTMLInputElement = screen.getByRole('textbox', {
      name: 'Title',
    });

    expect(await screen.findByDisplayValue('test1')).toBeInTheDocument();

    // The input elements would be upto date, but the last form attribute would be missing a word/letter,
    // likely caused by the automated typing and submission being too fast for the form to update.
    // Adding a typing delay fixed this issue, ensuring enough time for the form to update.

    const delayedUser = userEvent.setup({ delay: 20 });

    await delayedUser.type(title, 'test title');

    await delayedUser.type(description, 'test description');

    expect(await screen.findByText('.txt')).toBeInTheDocument();

    expect(
      await screen.findByDisplayValue('test description')
    ).toBeInTheDocument();

    await user.click(await screen.findByText('Save changes'));

    await user.click(await screen.findByText('Upload 1 file'));

    expect(axiosPostSpy).toHaveBeenCalledWith('/attachments', {
      description: 'test description',
      entity_id: '1',
      file_name: 'test1.txt',
      title: 'test title',
    });

    expect(xhrPostSpy).toHaveBeenCalledWith(
      'POST',
      'http://localhost:3000/object-storage',
      true
    );

    expect(await screen.findByText('Complete')).toBeInTheDocument();
  });

  it('errors when presigned url fails', async () => {
    server.use(
      http.post('/object-storage', async () => {
        await delay(1000);
        return HttpResponse.error();
      })
    );

    createView();

    const file1 = new File(['test'], 'uploadError.txt', {
      type: 'text/plain',
    });

    const dropZone = screen.getByText('Files cannot be larger than', {
      exact: false,
    });

    Object.defineProperty(dropZone, 'files', {
      value: [file1],
    });

    fireEvent.drop(dropZone, {
      dataTransfer: {
        files: [file1],
      },
    });

    await waitFor(() => {
      expect(screen.getByText('uploadError.txt')).toBeInTheDocument();
    });

    await user.click(await screen.findByText('Upload 1 file'));

    expect(axiosPostSpy).toHaveBeenCalledWith('/attachments', {
      entity_id: '1',
      file_name: 'uploadError.txt',
    });

    expect(xhrPostSpy).toHaveBeenCalledWith(
      'POST',
      'http://localhost:3000/object-storage',
      true
    );

    expect(await screen.findByText('Upload failed')).toBeInTheDocument();

    expect(
      await screen.findByLabelText('Show error details')
    ).toBeInTheDocument();

    await waitFor(() =>
      expect(axiosDeleteSpy).toHaveBeenCalledWith('/attachments/1', {})
    );
  });

  it('errors when maximum upload limit reached', async () => {
    server.use(
      http.post('/attachments', async () => {
        await delay(1000);
        return HttpResponse.json(
          {
            detail:
              'Limit for the maximum number of attachments for the provided `entity_id` has been reached.',
          },
          { status: 422 }
        );
      })
    );

    createView();

    const file1 = new File(['test'], 'uploadError.txt', {
      type: 'text/plain',
    });

    const dropZone = screen.getByText('Files cannot be larger than', {
      exact: false,
    });

    Object.defineProperty(dropZone, 'files', {
      value: [file1],
    });

    fireEvent.drop(dropZone, {
      dataTransfer: {
        files: [file1],
      },
    });

    await waitFor(() => {
      expect(screen.getByText('uploadError.txt')).toBeInTheDocument();
    });

    await user.click(await screen.findByText('Upload 1 file'));

    expect(axiosPostSpy).toHaveBeenCalledWith('/attachments', {
      entity_id: '1',
      file_name: 'uploadError.txt',
    });

    expect(await screen.findByText('Upload failed')).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getAllByLabelText('Maximum number of files reached.').length
      ).toBe(2);
    });
  });

  it('should error when file name already exists', async () => {
    server.use(
      http.post('/attachments', async () => {
        await delay(1000);
        return HttpResponse.json(
          {
            detail:
              'An image with the same file name already exists within the parent entity.',
          },
          { status: 409 }
        );
      })
    );

    createView();

    const file1 = new File(['test'], 'uploadError.txt', {
      type: 'text/plain',
    });

    const dropZone = screen.getByText('Files cannot be larger than', {
      exact: false,
    });

    Object.defineProperty(dropZone, 'files', {
      value: [file1],
    });

    fireEvent.drop(dropZone, {
      dataTransfer: {
        files: [file1],
      },
    });

    await waitFor(() => {
      expect(screen.getByText('uploadError.txt')).toBeInTheDocument();
    });

    await user.click(await screen.findByText('Upload 1 file'));

    expect(axiosPostSpy).toHaveBeenCalledWith('/attachments', {
      entity_id: '1',
      file_name: 'uploadError.txt',
    });

    expect(await screen.findByText('Upload failed')).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getAllByLabelText(
          'A file with this name already exists. To rename it, remove the file and add it again. You’ll then be able to click the pencil icon just below the file to change its name.'
        ).length
      ).toBe(2);
    });
  });

  it('should send a DELETE request for the attachment document if a file is removed during upload', async () => {
    server.use(
      http.post('/attachments', async () => {
        return HttpResponse.json(
          {
            id: '1',
            title: null,
            description: null,
            upload_info: {},
            modified_time: '2024-01-02T13:10:10.000+00:00',
            created_time: '2024-01-01T12:00:00.000+00:00',
          },
          { status: 200 }
        );
      })
    );

    server.use(
      http.post('/object-storage', async () => {
        await delay(1000);
        return new HttpResponse(undefined, {
          status: 204,
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            // This is need for uppy
            ETag: '"e76fe3d21078d7a3b9ec95edf437d010"',
          },
        });
      })
    );

    createView();

    const file1 = new File(['test'], 'removeError.txt', {
      type: 'text/plain',
    });

    const dropZone = screen.getByText('Files cannot be larger than', {
      exact: false,
    });

    Object.defineProperty(dropZone, 'files', {
      value: [file1],
    });

    fireEvent.drop(dropZone, {
      dataTransfer: {
        files: [file1],
      },
    });

    await waitFor(() => {
      expect(screen.getByText('removeError.txt')).toBeInTheDocument();
    });

    await user.click(await screen.findByText('Upload 1 file'));

    expect(axiosPostSpy).toHaveBeenCalledWith('/attachments', {
      entity_id: '1',
      file_name: 'removeError.txt',
    });

    await user.click(
      await screen.findByRole('button', { name: 'Remove file' })
    );

    await waitFor(() =>
      expect(axiosDeleteSpy).toHaveBeenCalledWith('/attachments/1', {})
    );

    expect(screen.queryByText('Upload 1 file')).not.toBeInTheDocument();
  });
});
