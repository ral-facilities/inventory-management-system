import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { http } from 'msw';
import { MockInstance } from 'vitest';
import { storageApi } from '../api/api';
import { usePatchAttachment } from '../api/attachments';
import { usePatchImage } from '../api/images';
import handleIMS_APIError from '../handleIMS_APIError';
import AttachmentsJSON from '../mocks/Attachments.json';
import ImagesJSON from '../mocks/Images.json';
import { server } from '../mocks/server';
import { renderComponentWithRouterProvider } from '../testUtils';
import EditFileDialog, { FileDialogProps } from './editFileDialog.component';

vi.mock('../handleIMS_APIError');

describe('Edit file dialog', () => {
  const onClose = vi.fn();
  let axiosPatchSpy: MockInstance;
  let props: FileDialogProps;
  let user: UserEvent;
  const createView = () => {
    return renderComponentWithRouterProvider(<EditFileDialog {...props} />);
  };

  beforeEach(() => {
    axiosPatchSpy = vi.spyOn(storageApi, 'patch');
    user = userEvent.setup();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const modifyFileValues = (values: {
    file_name?: string;
    title?: string;
    description?: string;
  }) => {
    if (values.file_name !== undefined)
      fireEvent.change(screen.getByLabelText('File Name *'), {
        target: { value: values.file_name },
      });

    if (values.title !== undefined)
      fireEvent.change(screen.getByLabelText('Title'), {
        target: { value: values.title },
      });

    if (values.description !== undefined)
      fireEvent.change(screen.getByLabelText('Description'), {
        target: { value: values.description },
      });
  };

  describe('Edit an image', () => {
    beforeEach(() => {
      props = {
        open: true,
        onClose: onClose,
        fileType: 'Image',
        usePatchFile: usePatchImage,
        selectedFile: ImagesJSON[0],
      };
    });

    it('disables save button and shows circular progress indicator when request is pending', async () => {
      server.use(
        http.patch('/images/:id', () => {
          return new Promise(() => {});
        })
      );

      createView();

      modifyFileValues({
        file_name: 'Image A',
      });

      const saveButton = screen.getByRole('button', { name: 'Save' });
      await user.click(saveButton);

      expect(saveButton).toBeDisabled();
      expect(await screen.findByRole('progressbar')).toBeInTheDocument();
    });

    it('Edits an image correctly', async () => {
      createView();

      // Checks if file extension is displayed. If it's editable, actual value will not match expected.
      expect(screen.getByText('.png')).toBeInTheDocument();

      modifyFileValues({
        file_name: 'test_file_name.jpeg',
        title: 'Test Title',
        description: 'Test Description',
      });

      const saveButton = screen.getByRole('button', { name: 'Save' });

      await user.click(saveButton);

      expect(axiosPatchSpy).toHaveBeenCalledWith('/images/1', {
        file_name: 'test_file_name.jpeg.png',
        title: 'Test Title',
        description: 'Test Description',
      });

      expect(onClose).toHaveBeenCalled();
    });

    it('shows correct error message when no values are changed', async () => {
      createView();

      const saveButton = screen.getByRole('button', { name: 'Save' });

      await user.click(saveButton);

      expect(
        screen.getByText(
          "There have been no changes made. Please change a field's value or press Cancel to exit."
        )
      ).toBeInTheDocument();
    });

    it('shows error message if required fields are whitespace or their current value was removed', async () => {
      createView();
      modifyFileValues({
        file_name: '',
      });
      const saveButton = screen.getByRole('button', { name: 'Save' });

      await user.click(saveButton);

      expect(screen.getByText('Please enter a file name.')).toBeInTheDocument();
      expect(onClose).not.toHaveBeenCalled();
    });

    it('should error when file name already exists', async () => {
      createView();
      modifyFileValues({
        file_name: 'duplicate_file_name',
      });
      const saveButton = screen.getByRole('button', { name: 'Save' });

      await user.click(saveButton);

      expect(
        screen.getByText(
          'A file with the same name has been found. Please enter a different name.'
        )
      ).toBeInTheDocument();
      expect(onClose).not.toHaveBeenCalled();
    });

    it('displays refresh page message and a CatchAllError request works correctly', async () => {
      createView();
      modifyFileValues({
        file_name: 'Error_500',
      });
      const saveButton = screen.getByRole('button', { name: 'Save' });

      await user.click(saveButton);

      expect(handleIMS_APIError).toHaveBeenCalled();
    });

    it('calls onClose when Close button is clicked', async () => {
      createView();
      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      await user.click(cancelButton);

      await waitFor(() => {
        expect(onClose).toHaveBeenCalled();
      });
    });
  });

  describe('Edit an attachment', () => {
    beforeEach(() => {
      props = {
        open: true,
        onClose: onClose,
        fileType: 'Attachment',
        usePatchFile: usePatchAttachment,
        selectedFile: AttachmentsJSON[0],
      };
    });

    it('disables save button and shows circular progress indicator when request is pending', async () => {
      server.use(
        http.patch('/attachments/:id', () => {
          return new Promise(() => {});
        })
      );

      createView();

      modifyFileValues({
        file_name: 'Attachment A',
      });

      const saveButton = screen.getByRole('button', { name: 'Save' });
      await user.click(saveButton);

      expect(saveButton).toBeDisabled();
      expect(await screen.findByRole('progressbar')).toBeInTheDocument();
    });

    it('Edits an attachment correctly', async () => {
      createView();

      // Checks if file extension is displayed. If it's editable, actual value will not match expected.
      expect(screen.getByText('.txt')).toBeInTheDocument();

      modifyFileValues({
        file_name: 'test_file_name.pdf',
        title: 'Test Title',
        description: 'Test Description',
      });

      const saveButton = screen.getByRole('button', { name: 'Save' });
      await user.click(saveButton);

      expect(axiosPatchSpy).toHaveBeenCalledWith('/attachments/1', {
        file_name: 'test_file_name.pdf.txt',
        title: 'Test Title',
        description: 'Test Description',
      });

      expect(onClose).toHaveBeenCalled();
    });

    it('shows correct error message when no values are changed', async () => {
      createView();

      const saveButton = screen.getByRole('button', { name: 'Save' });
      await user.click(saveButton);

      expect(
        screen.getByText(
          "There have been no changes made. Please change a field's value or press Cancel to exit."
        )
      ).toBeInTheDocument();
    });

    it('should error when file name already exists', async () => {
      createView();
      modifyFileValues({
        file_name: 'duplicate_file_name',
      });
      const saveButton = screen.getByRole('button', { name: 'Save' });

      await user.click(saveButton);

      expect(
        await screen.findByText(
          'A file with the same name has been found. Please enter a different name.'
        )
      ).toBeInTheDocument();
      expect(onClose).not.toHaveBeenCalled();
    });

    it('shows error message if required fields are whitespace or their current value was removed', async () => {
      createView();

      modifyFileValues({
        file_name: '',
      });

      const saveButton = screen.getByRole('button', { name: 'Save' });
      await user.click(saveButton);

      expect(screen.getByText('Please enter a file name.')).toBeInTheDocument();
      expect(onClose).not.toHaveBeenCalled();
    });

    it('displays refresh page message and a CatchAllError request works correctly', async () => {
      createView();

      modifyFileValues({
        file_name: 'Error_500',
      });

      const saveButton = screen.getByRole('button', { name: 'Save' });
      await user.click(saveButton);

      expect(handleIMS_APIError).toHaveBeenCalled();
    });

    it('calls onClose when Close button is clicked', async () => {
      createView();

      const cancelButton = screen.getByRole('button', { name: 'Cancel' });
      await user.click(cancelButton);

      await waitFor(() => {
        expect(onClose).toHaveBeenCalled();
      });
    });
  });
});
