import { screen, waitFor } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import handleIMS_APIError from '../../handleIMS_APIError';
import { renderComponentWithRouterProvider } from '../../testUtils';
import PlaceholderImage, {
  PlaceholderImageProps,
} from './placeholderImage.component'; // Adjust the import path as necessary

vi.mock('../../handleIMS_APIError');

let props: PlaceholderImageProps;
let user: UserEvent;

const createView = () => {
  return renderComponentWithRouterProvider(<PlaceholderImage {...props} />);
};

beforeEach(() => {
  props = {
    entityId: '1',
  };
  user = userEvent.setup();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('PlaceholderImage Component', () => {
  it('matches the snapshot', async () => {
    const view = createView();
    expect(view.asFragment()).toMatchSnapshot();
  });

  it('can open and close the set primary image dialog', async () => {
    createView();
    await waitFor(() => {
      expect(
        screen.getByLabelText('primary images action menu')
      ).toBeInTheDocument();
    });
    const actionButton = screen.getByLabelText('primary images action menu');
    user.click(actionButton);
    await waitFor(() => {
      expect(screen.getByText('Set Primary Image')).toBeInTheDocument();
    });
    const primaryImageButton = screen.getByText('Set Primary Image');
    await user.click(primaryImageButton);
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    await waitFor(() =>
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    );
    expect((await screen.findAllByText('logo1.png')).length).toEqual(9);
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('can open and close the remove primary image dialog', async () => {
    createView();

    const actionButton = screen.getByLabelText('primary images action menu');
    user.click(actionButton);

    await waitFor(() => {
      expect(screen.getByText('Remove Primary Image')).toBeInTheDocument();
    });

    const primaryImageButton = screen.getByText('Remove Primary Image');
    user.click(primaryImageButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    await waitFor(() =>
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    );

    const element = screen.getByTestId('remove-image-name');
    expect(element).toHaveTextContent('stfc-logo-blue-text.png');

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('disabled the remove primary image button when there are no images', async () => {
    props.entityId = '90';
    createView();

    const actionButton = screen.getByLabelText('primary images action menu');
    user.click(actionButton);

    await waitFor(() => {
      expect(screen.getByText('Remove Primary Image')).toBeInTheDocument();
    });

    const primaryImageButton = screen.getByRole('menuitem', {
      name: 'Remove Primary Image',
    });
    const itemIsDisabled = primaryImageButton.getAttribute('aria-disabled');
    expect(itemIsDisabled).toBe('true');
  });

  it('returns an error gracefully', async () => {
    props.entityId = 'error_500';
    createView();

    await waitFor(() => {
      expect(handleIMS_APIError).toHaveBeenCalled();
    });
  });
});
