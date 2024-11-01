import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { act } from 'react';
import { MockInstance } from 'vitest';
import { storageApi } from '../../api/api';
import ImageJSON from '../../mocks/image.json';
import { server } from '../../mocks/server';
import { renderComponentWithRouterProvider } from '../../testUtils';
import ImageGallery, { ImageGalleryProps } from './imageGallery.component';

describe('Image Gallery', () => {
  let props: ImageGalleryProps;
  let user: UserEvent;
  let axiosGetSpy: MockInstance;

  const createView = () => {
    return renderComponentWithRouterProvider(<ImageGallery {...props} />);
  };

  beforeAll(() => {
    let _src: string;

    Object.defineProperty(global.Image.prototype, 'src', {
      set(value) {
        _src = value;

        // Check for an invalid base64 thumbnail or URL and call onError
        if (value.includes('test')) {
          setTimeout(() => {
            if (typeof this.onerror === 'function') {
              this.onerror(new Event('error'));
            }
          }, 0);
        } else {
          setTimeout(() => {
            if (typeof this.onload === 'function') {
              this.onload();
            }
          }, 0);
        }
      },
      get() {
        return _src;
      },
    });

    Object.defineProperty(global.Image.prototype, 'naturalWidth', {
      get() {
        return 100;
      },
    });

    Object.defineProperty(global.Image.prototype, 'naturalHeight', {
      get() {
        return 100;
      },
    });
  });

  beforeEach(() => {
    props = {
      entityId: '1',
    };
    user = userEvent.setup();
    axiosGetSpy = vi.spyOn(storageApi, 'get');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', async () => {
    let baseElement;
    await act(async () => {
      baseElement = createView().baseElement;
    });

    await waitFor(() =>
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    );

    expect(screen.getAllByText('logo1.png').length).toEqual(10);
    expect(baseElement).toMatchSnapshot();
  });

  it('renders no results page correctly', async () => {
    server.use(
      http.get('/images', async () => {
        return HttpResponse.json([], { status: 200 });
      })
    );
    let baseElement;
    await act(async () => {
      baseElement = createView().baseElement;
    });

    await waitFor(() =>
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    );

    expect(screen.queryByText('logo1.png')).not.toBeInTheDocument();
    expect(baseElement).toMatchSnapshot();
  });

  it('falls back to placeholder thumbnail', async () => {
    server.use(
      http.get('/images', async () => {
        return HttpResponse.json(
          [
            {
              ...ImageJSON,
              id: '1',
              thumbnail_base64: 'test',
              file_name: 'test.png',
            },
          ],
          { status: 200 }
        );
      })
    );
    createView();

    await waitFor(() =>
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    );

    const image = screen.getByRole('img') as HTMLImageElement; // Replace with actual alt text or selector

    expect(image).toHaveAttribute('src', 'data:image/webp;base64,test');
    fireEvent.error(image);

    await waitFor(() => {
      expect(image.src).toEqual('/images/thumbnail-not-available.png');
    });
  });

  it('opens full-size image when thumbnail is clicked, navigates to the next image, and then navigates to a third image that failed to upload, falling back to a placeholder', async () => {
    createView();

    await waitFor(() =>
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    );
    const thumbnail = await screen.findAllByAltText('Image: tetstw');
    await user.click(thumbnail[0]);

    expect(axiosGetSpy).toHaveBeenCalledWith('/images/1');
    await waitFor(() => {
      expect(
        screen.getByText('File Name: stfc-logo-blue-text.png')
      ).toBeInTheDocument();
    });
    expect(screen.getByText('Title: tetstw')).toBeInTheDocument();
    expect(screen.getByText('test')).toBeInTheDocument();

    await waitFor(
      () => {
        expect(
          within(screen.getByRole('dialog')).getByRole('img')
        ).toBeInTheDocument();
      },
      { timeout: 5000 }
    );

    await user.click(screen.getByRole('button', { name: 'Next' }));

    expect(axiosGetSpy).toHaveBeenCalledWith('/images/2');
    await waitFor(() => {
      expect(screen.getByText('File Name: logo1.png')).toBeInTheDocument();
    });
    expect(screen.getByText('Title: tetstw')).toBeInTheDocument();
    expect(screen.getByText('test')).toBeInTheDocument();

    await waitFor(
      () => {
        expect(
          within(screen.getByRole('dialog')).getByRole('img')
        ).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
    await user.click(screen.getByRole('button', { name: 'Next' }));

    // Failed to render image
    expect(axiosGetSpy).toHaveBeenCalledWith('/images/3');

    await waitFor(() => {
      expect(
        screen.getByText('File Name: stfc-logo-blue-text.png')
      ).toBeInTheDocument();
    });
    expect(screen.getByText('Title: tetstw')).toBeInTheDocument();
    expect(screen.getByText('test')).toBeInTheDocument();

    await waitFor(
      () => {
        expect(
          within(screen.getByRole('dialog')).getByRole('img')
        ).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
  }, 15000);
});
