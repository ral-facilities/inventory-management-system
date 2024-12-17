import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { http } from 'msw';
import { MockInstance } from 'vitest';
import { storageApi } from '../api/api';
import { usePatchImage } from '../api/images';
import handleIMS_APIError from '../handleIMS_APIError';
import ImagesJSON from '../mocks/Images.json';
import { server } from '../mocks/server';
import { renderComponentWithRouterProvider } from '../testUtils';
import EditFileDialog, { FileDialogProps } from './editFileDialog.component';

vi.mock('../handleIMS_APIError');

describe('Edit file dialog', () => {
  const onClose = vi.fn();
  let props: FileDialogProps;
  let user: UserEvent;
  const createView = () => {
    return renderComponentWithRouterProvider(<EditFileDialog {...props} />);
  };

  beforeEach(() => {
    props = {
      open: true,
      onClose: onClose,
      fileType: 'Image',
      usePatchFile: usePatchImage,
    };
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
    let axiosPatchSpy: MockInstance;
    beforeEach(() => {
      props = {
        ...props,
        selectedFile: ImagesJSON[0],
      };

      axiosPatchSpy = vi.spyOn(storageApi, 'patch');
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
      modifyFileValues({
        file_name: 'test_file_name.jpeg',
        title: 'Test Title',
        description: 'Test Description',
      });

      const saveButton = screen.getByRole('button', { name: 'Save' });

      await user.click(saveButton);

      expect(axiosPatchSpy).toHaveBeenCalledWith('/images/1', {
        file_name: 'test_file_name.jpeg',
        title: 'Test Title',
        description: 'Test Description',
      });

      expect(onClose).toHaveBeenCalled();
    });

    it('No values changed shows correct error message', async () => {
      createView();

      const saveButton = screen.getByRole('button', { name: 'Save' });

      await user.click(saveButton);

      expect(
        screen.getByText(
          "There have been no changes made. Please change a field's value or press Cancel to exit."
        )
      ).toBeInTheDocument();
    });

    it('Required fields show error if they are whitespace or current value just removed', async () => {
      createView();
      modifyFileValues({
        file_name: '',
      });
      const saveButton = screen.getByRole('button', { name: 'Save' });

      await user.click(saveButton);

      expect(screen.getByText('Please enter a file name.')).toBeInTheDocument();
      expect(onClose).not.toHaveBeenCalled();
    });

    it('CatchAllError request works correctly and displays refresh page message', async () => {
      createView();
      modifyFileValues({
        file_name: 'Error 500',
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
