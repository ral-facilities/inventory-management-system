import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import ImagesJSON from '../../mocks/Images.json';
import { renderComponentWithRouterProvider } from '../../testUtils';
import ThumbnailImage, {
  ThumbnailImageProps,
} from './thumbnailImage.component';

describe('ThumbnailImage Component', () => {
  let props: ThumbnailImageProps;
  const mockOpen = vi.fn();

  const createView = () => {
    renderComponentWithRouterProvider(<ThumbnailImage {...props} />);
  };

  beforeEach(() => {
    props = {
      open: mockOpen,
      image: ImagesJSON[0],
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });
  it('should render an image when the thumbnail loads successfully', () => {
    createView();

    const imageElement = screen.getByAltText(
      props.image.description ?? 'No photo description available.'
    );
    expect(imageElement).toBeInTheDocument();
    expect(imageElement).toHaveAttribute(
      'src',
      `data:image/webp;base64,${props.image.thumbnail_base64}`
    );
  });

  it('should render fallback text when the image fails to load', () => {
    props.image.thumbnail_base64 = 'test';
    createView();

    const imageElement = screen.getByAltText(
      props.image.description ?? 'No photo description available.'
    );
    fireEvent.error(imageElement);

    const fallbackText = screen.getByText('The image cannot be loaded');
    expect(fallbackText).toBeInTheDocument();
  });

  it('should call the open function when the image is clicked', () => {
    createView();

    const imageElement = screen.getByAltText(
      props.image.description ?? 'No photo description available.'
    );
    fireEvent.click(imageElement);

    expect(mockOpen).toHaveBeenCalledTimes(1);
  });

  it('should call the open function when the fallback text is clicked', () => {
    createView();

    const imageElement = screen.getByAltText(
      props.image.description ?? 'No photo description available.'
    );
    fireEvent.error(imageElement);

    const fallbackText = screen.getByText('The image cannot be loaded');
    fireEvent.click(fallbackText);

    expect(mockOpen).toHaveBeenCalledTimes(1);
  });

  it('should forward the ref to the image element', () => {
    const ref = React.createRef<HTMLElement>();
    render(<ThumbnailImage {...props} ref={ref} />);

    // Check if the ref is assigned to the image
    const imageElement = screen.getByAltText(
      props.image.description ?? 'No photo description available.'
    );
    expect(ref.current).toBe(imageElement);
  });
});
