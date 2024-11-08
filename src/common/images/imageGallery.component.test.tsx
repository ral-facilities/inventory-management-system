import { screen, waitFor, within } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { act } from 'react';
import { MockInstance } from 'vitest';
import { storageApi } from '../../api/api';
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

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
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

    expect(screen.getAllByText('logo1.png').length).toEqual(8);
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

  it('changes page correctly and rerenders data', async () => {
    const { router } = createView();

    await waitFor(() =>
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    );

    expect(screen.getAllByText('logo1.png').length).toEqual(8);
    expect(router.state.location.search).toBe('');

    await user.click(screen.getByRole('button', { name: 'Go to page 2' }));

    await waitFor(() => {
      expect(screen.getAllByText('logo1.png').length).toEqual(2);
    });

    expect(router.state.location.search).toBe(
      '?imageState=N4IgDiBcpghg5gUwMoEsBeioEYBsAacBRASQDsATRADxwF86g'
    );

    await user.click(screen.getByRole('button', { name: 'Go to page 1' }));

    await waitFor(() => {
      expect(screen.getAllByText('logo1.png').length).toEqual(8);
    });
    expect(router.state.location.search).toBe('');
  });

  it('can change the table filters and clear the table filters', async () => {
    createView();

    await waitFor(() =>
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    );

    expect((await screen.findAllByText('logo1.png')).length).toEqual(8);

    await user.click(screen.getByText('Show Filters'));

    expect(await screen.findByText('Hide Filters')).toBeInTheDocument();

    const nameInput = screen.getByLabelText('Filter by File name');
    await user.type(nameInput, 'stfc-logo-blue-text.png');
    await waitFor(() => {
      expect(screen.queryByText('logo1.png')).not.toBeInTheDocument();
    });
    const clearFiltersButton = screen.getByRole('button', {
      name: 'Clear Filters',
    });

    await user.click(clearFiltersButton);
    expect((await screen.findAllByText('logo1.png')).length).toEqual(8);

    expect(clearFiltersButton).toBeDisabled();
  });

  it('toggles filter visibility when clicking the toggle button', async () => {
    createView();

    await waitFor(() =>
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    );

    expect((await screen.findAllByText('logo1.png')).length).toEqual(8);

    expect(screen.queryByText('Hide Filters')).not.toBeInTheDocument();
    expect(screen.getByText('Show Filters')).toBeInTheDocument();

    await user.click(screen.getByText('Show Filters'));

    expect(screen.getByText('Hide Filters')).toBeInTheDocument();
    expect(screen.getByText('Images per page')).toBeInTheDocument();

    await user.click(screen.getByText('Hide Filters'));

    expect(screen.queryByText('Hide Filters')).not.toBeInTheDocument();
    expect(screen.getByText('Show Filters')).toBeInTheDocument();
  });

  it('opens image information dialog and can close the dialog', async () => {
    createView();

    await waitFor(() =>
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    );

    expect((await screen.findAllByText('logo1.png')).length).toEqual(8);

    const actionMenus = screen.getAllByLabelText(`Card Actions`);
    await user.click(actionMenus[0]);

    const informationButton = await screen.findByText(`Information`);
    await user.click(informationButton);
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const closeButton = screen.getByRole('button', { name: 'Close' });
    await user.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('opens full-size image when thumbnail is clicked, navigates to the next image, and then navigates to a third image that failed to upload, falling back to a placeholder', async () => {
    createView();

    await waitFor(() =>
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    );
    const thumbnail = await screen.findAllByAltText(
      'Image: stfc-logo-blue-text'
    );
    await user.click(thumbnail[0]);

    expect(axiosGetSpy).toHaveBeenCalledWith('/images/1');
    await waitFor(() => {
      expect(
        screen.getByText('File Name: stfc-logo-blue-text.png')
      ).toBeInTheDocument();
    });
    expect(screen.getByText('Title: stfc-logo-blue-text')).toBeInTheDocument();
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
    expect(screen.getByText('Title: logo1')).toBeInTheDocument();
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
    expect(screen.getByText('Title: stfc-logo-blue-text')).toBeInTheDocument();
    expect(screen.getByText('test')).toBeInTheDocument();

    await waitFor(() => {
      expect(axiosGetSpy).toHaveBeenCalledTimes(4);
    });

    // opens action menu

    await user.click(
      screen.getByRole('button', { name: 'Action menu button' })
    );

    const informationButton = await screen.findByText(`Information`);
    expect(informationButton).toBeInTheDocument();
  }, 20000);
});
