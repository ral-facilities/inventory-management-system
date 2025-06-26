import { act, screen } from '@testing-library/react';
import ImagesJSON from '../../mocks/Images.json';
import { renderComponentWithRouterProvider } from '../../testUtils';
import ImageInformationDialog, {
  ImageInformationDialogProps,
} from './imageInformationDialog.component';

describe('Image Information dialog Component', () => {
  let props: ImageInformationDialogProps;
  const onClose = vi.fn();

  const createView = () => {
    return renderComponentWithRouterProvider(
      <ImageInformationDialog {...props} />
    );
  };

  beforeEach(() => {
    props = {
      open: true,
      image: ImagesJSON[0],
      onClose: onClose,
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });
  it('renders dialog correctly', async () => {
    let baseElement;
    await act(async () => {
      baseElement = createView().baseElement;
    });

    expect(screen.getByText('logo1.png')).toBeInTheDocument();
    expect(baseElement).toMatchSnapshot();
  });
});
