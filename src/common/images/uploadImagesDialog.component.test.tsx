import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { act } from 'react';
import { renderComponentWithRouterProvider } from '../../testUtils';

import { MockInstance } from 'vitest';
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
      screen.getByText('Files cannot be larger than 500MB')
    ).toBeInTheDocument();
    expect(baseElement).toMatchSnapshot();
  });

  it('calls onclose when close button is clicked', async () => {
    createView();

    await user.click(screen.getByRole('button', { name: 'Close' }));

    expect(onClose).toHaveBeenCalled();
  });

  it('posts images metadata successfully', async () => {
    // Render the component

    createView();

    const file1 = new File(['hello world'], 'image.png', {
      type: 'image/png',
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
      expect(screen.getByText('image.png')).toBeInTheDocument();
    });

    await user.click(await screen.findByText('Upload 1 file'));

    expect(xhrPostSpy).toHaveBeenCalledWith('POST', '/images', true);
  });
});
