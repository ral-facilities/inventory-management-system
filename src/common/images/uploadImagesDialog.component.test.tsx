import { createTheme, ThemeProvider } from '@mui/material';
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

  const createView = (themeMode: 'light' | 'dark' = 'light') => {
    const theme = createTheme({
      palette: {
        mode: themeMode,
      },
    });
    return renderComponentWithRouterProvider(
      <ThemeProvider theme={theme}>
        <UploadImagesDialog {...props} />
      </ThemeProvider>
    );
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

  it('renders dialog correctly, in light theme', async () => {
    let baseElement;
    await act(async () => {
      baseElement = createView().baseElement;
    });

    expect(
      screen.getByText('Files cannot be larger than', { exact: false })
    ).toBeInTheDocument();
    expect(baseElement).toMatchSnapshot();

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
    const [filename, title, _] = screen.getAllByRole('textbox');

    await user.click(filename);

    const parentElement = screen.getByTestId('filename-input-div-element');

    expect(parentElement).toHaveStyle(
      'boxShadow: rgba(18, 105, 207, 0.15) 0px 0px 0px 3px'
    );
    expect(parentElement).toHaveStyle('borderColor: rgba(18, 105, 207, 0.6)');

    await user.click(title);

    expect(parentElement?.style.length == 0);
  });

  it('renders dialog correctly, in dark theme', async () => {
    createView('dark');

    expect(
      screen.getByText('Files cannot be larger than', { exact: false })
    ).toBeInTheDocument();

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
    const [filename, _, __] = screen.getAllByRole('textbox');

    await user.click(filename);
    const parentElement = screen.getByTestId('filename-input-div-element');

    expect(parentElement).toHaveStyle('boxShadow: none');
    expect(parentElement).toHaveStyle('borderColor: rgb(82, 82, 82)');
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

    // Checks if file extension is displayed. If it's editable, actual value will disappear after editing.
    expect(screen.getByText('.png')).toBeInTheDocument();

    const [name, title, description] = screen.getAllByRole('textbox');

    await user.type(name, 'test.jpeg');
    await user.type(title, 'test');
    await user.type(description, 'test');

    expect(screen.getByText('.png')).toBeInTheDocument();

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
      { timeout: 5000 }
    );
  });
});
