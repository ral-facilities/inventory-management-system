import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { act } from 'react';
import { MockInstance } from 'vitest';
import { server } from '../../mocks/server';
import { renderComponentWithRouterProvider } from '../../testUtils';
import UploadImagesDialog, {
  UploadImagesDialogProps,
} from './uploadImagesDialog.component';

describe('Upload image dialog', () => {
  let props: UploadImagesDialogProps;
  let user: UserEvent;

  let xhrPostSpy: MockInstance;

  const onClose = vi.fn();

  const createView = () => {
    return renderComponentWithRouterProvider(<UploadImagesDialog {...props} />);
  };

  beforeEach(() => {
    props = {
      open: true,
      onClose: onClose,
      entityId: '1',
    };
    user = userEvent.setup();
    xhrPostSpy = vi.spyOn(window.XMLHttpRequest.prototype, 'open');
    global.URL.createObjectURL = vi.fn(() => 'mocked-url');
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
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

  it('uploads an image with a title and description and verifies completion message', async () => {
    createView();

    const file1 = new File(['hello world'], 'image.png', {
      type: 'image/png',
    });

    const dropZone = screen.getByText('files cannot be larger than', {
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
      expect(screen.getByText('image.png')).toBeInTheDocument();
    });

    await user.click(
      await screen.findByRole('button', { name: 'Edit file image.png' })
    );

    expect(await screen.findByText('File name')).toBeInTheDocument();
    const [_, title, description] = screen.getAllByRole('textbox');

    await user.type(title, 'test');
    await user.type(description, 'test');

    await user.click(await screen.findByText('Save changes'));

    await user.click(await screen.findByText('Upload 1 file'));

    expect(xhrPostSpy).toHaveBeenCalledWith('POST', '/images', true);

    expect(await screen.findByText('Complete')).toBeInTheDocument();
  });

  it('displays error if post is unsuccessful', async () => {
    server.use(
      http.post('/images', async () => {
        return HttpResponse.error();
      })
    );

    createView();

    const file1 = new File(['hello world'], 'image.png', {
      type: 'image/png',
    });

    const dropZone = screen.getByText('files cannot be larger than', {
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
      expect(screen.getByText('image.png')).toBeInTheDocument();
    });

    await user.click(await screen.findByText('Upload 1 file'));

    expect(xhrPostSpy).toHaveBeenCalledWith('POST', '/images', true);

    await waitFor(
      () => {
        expect(screen.getByText('Upload failed')).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  }, 15000);
});
