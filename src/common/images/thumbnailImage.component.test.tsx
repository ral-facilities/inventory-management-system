import { fireEvent, screen } from '@testing-library/react';
import ImagesJSON from '../../mocks/Images.json';
import { renderComponentWithRouterProvider } from '../../testUtils';
import ThumbnailImage, {
  ThumbnailImageProps,
} from './thumbnailImage.component';

describe('ThumbnailImage Component', () => {
  let props: ThumbnailImageProps;
  const onClick = vi.fn();

  const createView = () => {
    renderComponentWithRouterProvider(<ThumbnailImage {...props} />);
  };

  beforeEach(() => {
    props = {
      onClick: onClick,
      dense: false,
      image: ImagesJSON[0],
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });
  it('should render an image when the thumbnail loads successfully', () => {
    createView();

    const imageElement = screen.getByAltText(
      props.image?.description ?? 'No photo description available.'
    );
    expect(imageElement).toBeInTheDocument();
    expect(imageElement).toHaveAttribute(
      'src',
      `data:image/webp;base64,${props?.image?.thumbnail_base64}`
    );
  });

  it('should render fallback text when the image fails to load', () => {
    if (props?.image?.thumbnail_base64) {
      props.image.thumbnail_base64 = 'test';
    }
    createView();

    const imageElement = screen.getByAltText(
      props.image?.description ?? 'No photo description available.'
    );
    fireEvent.error(imageElement);

    const fallbackText = screen.getByAltText('The image cannot be loaded');
    expect(fallbackText).toBeInTheDocument();
  });

  it('should call the open function when the image is clicked', () => {
    createView();

    const imageElement = screen.getByAltText(
      props.image?.description ?? 'No photo description available.'
    );
    fireEvent.click(imageElement);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should call the open function when the fallback text is clicked', () => {
    createView();

    const imageElement = screen.getByAltText(
      props.image?.description ?? 'No photo description available.'
    );
    fireEvent.error(imageElement);

    const fallbackText = screen.getByAltText('The image cannot be loaded');
    fireEvent.click(fallbackText);

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
