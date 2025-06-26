import { RenderResult, screen, waitFor } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { APIImageWithURL } from '../../api/api.types';
import handleIMS_APIError from '../../handleIMS_APIError';
import {
  CREATED_MODIFIED_TIME_VALUES,
  renderComponentWithRouterProvider,
} from '../../testUtils';
import RemovePrimaryImageDialog, {
  RemovePrimaryImageProps,
} from './removePrimaryImageDialog.component';

vi.mock('../../handleIMS_APIError');

describe('Remove Primary Image dialogue', () => {
  let props: RemovePrimaryImageProps;
  let user: UserEvent;
  const onClose = vi.fn();
  let image: APIImageWithURL | undefined;
  const createView = (): RenderResult => {
    return renderComponentWithRouterProvider(
      <RemovePrimaryImageDialog {...props} />
    );
  };

  beforeEach(() => {
    image = {
      id: '1',
      file_name: 'Image A',
      entity_id: '2',
      title: 'a title',
      description: 'a description',
      primary: false,
      thumbnail_base64: 'base64_thumbnail_test',
      ...CREATED_MODIFIED_TIME_VALUES,
      view_url: 'view_url',
      download_url: 'download_url',
    };
    props = {
      open: true,
      onClose: onClose,
      image: image,
    };
    user = userEvent.setup(); // Assigning userEvent to 'user'
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', async () => {
    createView();
    expect(screen.getByText('Remove Primary Image')).toBeInTheDocument();
    expect(screen.getByTestId('remove-image-name')).toHaveTextContent(
      'Image A'
    );
  });

  it('calls onClose when Close button is clicked', async () => {
    createView();
    const closeButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(closeButton);

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('calls handlePatchImage when continue button is clicked', async () => {
    createView();
    const continueButton = screen.getByRole('button', { name: 'Continue' });
    await user.click(continueButton);

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('displays error message if an unknown error occurs', async () => {
    if (image) image.file_name = 'Error_500.png';
    createView();
    const continueButton = screen.getByRole('button', { name: 'Continue' });
    await user.click(continueButton);

    await waitFor(() => {
      expect(handleIMS_APIError).toHaveBeenCalled();
    });
  });
});
