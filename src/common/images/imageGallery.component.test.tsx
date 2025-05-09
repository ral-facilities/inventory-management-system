import { fireEvent, screen, waitFor, within } from '@testing-library/react';
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

  beforeEach(() => {
    props = {
      entityId: '1',
      dense: false,
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

    await waitFor(
      () => expect(screen.queryByRole('progressbar')).not.toBeInTheDocument(),
      { timeout: 5000 }
    );

    expect((await screen.findAllByText('logo1.png')).length).toEqual(8);

    expect(baseElement).toMatchSnapshot();
  }, 10000);

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

    await user.click(screen.getByRole('button', { name: 'Show/Hide filters' }));

    const nameInput = await screen.findByLabelText('Filter by File name');
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

  it('opens image download dialog and can close the dialog', async () => {
    createView();

    await waitFor(() =>
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    );

    expect((await screen.findAllByText('logo1.png')).length).toEqual(8);

    const actionMenus = screen.getAllByLabelText(`Card Actions`);
    await user.click(actionMenus[0]);

    const downloadButton = await screen.findByText(`Download`);
    await user.click(downloadButton);
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('opens image edit dialog and can close the dialog', async () => {
    createView();

    await waitFor(() =>
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    );

    expect((await screen.findAllByText('logo1.png')).length).toEqual(8);

    const actionMenus = screen.getAllByLabelText(`Card Actions`);
    await user.click(actionMenus[0]);

    const editButton = await screen.findByText(`Edit`);
    await user.click(editButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('opens image delete dialog and can close the dialog', async () => {
    createView();

    await waitFor(() =>
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    );

    expect((await screen.findAllByText('logo1.png')).length).toEqual(8);

    const actionMenus = screen.getAllByLabelText(`Card Actions`);
    await user.click(actionMenus[0]);

    const deleteButton = await screen.findByText(`Delete`);
    await user.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('opens full-size image when thumbnail is clicked and navigates to the next image', async () => {
    createView();

    await waitFor(() =>
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    );
    const thumbnail = await screen.findAllByAltText('test');
    await user.click(thumbnail[0]);

    expect(axiosGetSpy).toHaveBeenCalledWith('/images/1');
    const galleryLightBox = within(screen.getByTestId('galleryLightBox'));
    await waitFor(() => {
      expect(
        galleryLightBox.getByText('File name: stfc-logo-blue-text.png')
      ).toBeInTheDocument();
    });
    expect(
      galleryLightBox.getByText('Title: stfc-logo-blue-text')
    ).toBeInTheDocument();
    expect(galleryLightBox.getByText('test')).toBeInTheDocument();

    const imageElement1 = await galleryLightBox.findByAltText(`test`);

    expect(imageElement1).toBeInTheDocument();

    expect(imageElement1).toHaveAttribute(
      'src',
      `http://localhost:3000/images/stfc-logo-blue-text.png?text=1`
    );

    await user.click(galleryLightBox.getAllByLabelText('Next')[1]);

    expect(axiosGetSpy).toHaveBeenCalledWith('/images/2');

    await waitFor(() => {
      expect(screen.getByText('File name: logo1.png')).toBeInTheDocument();
    });
    expect(screen.getByText('Title: logo1')).toBeInTheDocument();
    expect(screen.getByText('test')).toBeInTheDocument();

    const imageElement2 = await galleryLightBox.findByAltText(`test`);

    expect(imageElement2).toBeInTheDocument();

    expect(imageElement2).toHaveAttribute(
      'src',
      `http://localhost:3000/logo192.png?text=2`
    );

    await user.click(galleryLightBox.getAllByLabelText('Close')[1]);

    await waitFor(() => {
      expect(screen.queryByTestId('galleryLightBox')).not.toBeInTheDocument();
    });
  });

  it('opens corrupted image, and navigates back to previous image (invalid url)', async () => {
    createView();

    await waitFor(() =>
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    );
    const thumbnail = await screen.findAllByAltText(
      'No photo description available.'
    );
    await user.click(thumbnail[0]);

    expect(axiosGetSpy).toHaveBeenCalledWith('/images/3');

    const galleryLightBox = within(screen.getByTestId('galleryLightBox'));

    await waitFor(() => {
      expect(
        galleryLightBox.getByText('File name: stfc-logo-blue-text.png')
      ).toBeInTheDocument();
    });
    expect(
      galleryLightBox.getByText('Title: stfc-logo-blue-text')
    ).toBeInTheDocument();
    expect(
      galleryLightBox.getByText('No description available')
    ).toBeInTheDocument();
    const imageElement = galleryLightBox.getByAltText(
      `No photo description available.`
    );
    fireEvent.error(imageElement);

    await waitFor(() => {
      expect(
        galleryLightBox.getByText('The image cannot be loaded')
      ).toBeInTheDocument();
    });

    await user.click(galleryLightBox.getAllByLabelText('Previous')[1]);

    await waitFor(() => {
      expect(screen.getByText('File name: logo1.png')).toBeInTheDocument();
    });
    expect(screen.getByText('Title: logo1')).toBeInTheDocument();
    expect(screen.getByText('test')).toBeInTheDocument();

    const imageElement2 = await galleryLightBox.findByAltText(`test`);

    expect(imageElement2).toBeInTheDocument();

    expect(imageElement2).toHaveAttribute(
      'src',
      `http://localhost:3000/logo192.png?text=2`
    );

    await user.click(galleryLightBox.getAllByLabelText('Close')[1]);

    await waitFor(() => {
      expect(screen.queryByTestId('galleryLightBox')).not.toBeInTheDocument();
    });
  });

  it('opens corrupted image (network error)', async () => {
    createView();

    await waitFor(() =>
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    );
    const thumbnail = await screen.findAllByAltText('test');
    await user.click(thumbnail[3]);

    expect(axiosGetSpy).toHaveBeenCalledWith('/images/5');

    const galleryLightBox = within(screen.getByTestId('galleryLightBox'));

    await waitFor(
      () => {
        expect(
          galleryLightBox.getByText('The image cannot be loaded')
        ).toBeInTheDocument();
      },
      {
        timeout: 10000,
      }
    );

    await user.click(galleryLightBox.getAllByLabelText('Close')[1]);

    await waitFor(() => {
      expect(screen.queryByTestId('galleryLightBox')).not.toBeInTheDocument();
    });
  }, 10000);

  it('opens information dialog in lightbox', async () => {
    createView();

    await waitFor(() =>
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    );
    const thumbnail = await screen.findAllByAltText('test');
    await user.click(thumbnail[0]);

    expect(axiosGetSpy).toHaveBeenCalledWith('/images/1');
    await waitFor(() => {
      expect(
        screen.getByText('File name: stfc-logo-blue-text.png')
      ).toBeInTheDocument();
    });
    expect(screen.getByText('Title: stfc-logo-blue-text')).toBeInTheDocument();
    expect(screen.getByText('test')).toBeInTheDocument();

    const galleryLightBox = within(screen.getByTestId('galleryLightBox'));

    const imageElement1 = await galleryLightBox.findByAltText(`test`);

    expect(imageElement1).toBeInTheDocument();

    expect(imageElement1).toHaveAttribute(
      'src',
      `http://localhost:3000/images/stfc-logo-blue-text.png?text=1`
    );

    await user.click(galleryLightBox.getByLabelText('Image Actions'));

    const informationButton = await screen.findByText(`Information`);

    await user.click(informationButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    expect(
      within(screen.getByRole('dialog')).getByText('Image Information')
    ).toBeInTheDocument();
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Close' })
    );

    await user.click(galleryLightBox.getAllByLabelText('Close')[1]);

    await waitFor(() => {
      expect(screen.queryByTestId('galleryLightBox')).not.toBeInTheDocument();
    });
  });

  it('opens edit dialog in lightbox', async () => {
    createView();

    await waitFor(() =>
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    );
    const thumbnail = await screen.findAllByAltText('test');
    await user.click(thumbnail[0]);

    expect(axiosGetSpy).toHaveBeenCalledWith('/images/1');
    await waitFor(() => {
      expect(
        screen.getByText('File name: stfc-logo-blue-text.png')
      ).toBeInTheDocument();
    });
    expect(screen.getByText('Title: stfc-logo-blue-text')).toBeInTheDocument();
    expect(screen.getByText('test')).toBeInTheDocument();

    const galleryLightBox = within(screen.getByTestId('galleryLightBox'));

    const imageElement1 = await galleryLightBox.findByAltText(`test`);

    expect(imageElement1).toBeInTheDocument();

    expect(imageElement1).toHaveAttribute(
      'src',
      `http://localhost:3000/images/stfc-logo-blue-text.png?text=1`
    );

    await user.click(galleryLightBox.getByLabelText('Image Actions'));

    const editButton = await screen.findByText(`Edit`);

    await user.click(editButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    expect(
      within(screen.getByRole('dialog')).getByText('Edit Image')
    ).toBeInTheDocument();
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Cancel' })
    );

    await user.click(galleryLightBox.getAllByLabelText('Close')[1]);

    await waitFor(() => {
      expect(screen.queryByTestId('galleryLightBox')).not.toBeInTheDocument();
    });
  });

  it('opens delete dialog in lightbox', async () => {
    createView();

    await waitFor(() =>
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    );
    const thumbnail = await screen.findAllByAltText('test');
    await user.click(thumbnail[0]);

    expect(axiosGetSpy).toHaveBeenCalledWith('/images/1');
    await waitFor(() => {
      expect(
        screen.getByText('File name: stfc-logo-blue-text.png')
      ).toBeInTheDocument();
    });
    expect(screen.getByText('Title: stfc-logo-blue-text')).toBeInTheDocument();
    expect(screen.getByText('test')).toBeInTheDocument();

    const galleryLightBox = within(screen.getByTestId('galleryLightBox'));

    const imageElement1 = await galleryLightBox.findByAltText(`test`);

    expect(imageElement1).toBeInTheDocument();

    expect(imageElement1).toHaveAttribute(
      'src',
      `http://localhost:3000/images/stfc-logo-blue-text.png?text=1`
    );

    await user.click(galleryLightBox.getByLabelText('Image Actions'));

    const deleteButton = await screen.findByText(`Delete`);

    await user.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    expect(
      within(screen.getByRole('dialog')).getByText('Delete Image')
    ).toBeInTheDocument();
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Cancel' })
    );

    await waitFor(() => {
      expect(screen.queryByTestId('galleryLightBox')).not.toBeInTheDocument();
    });
  });

  it('opens download dialog in lightbox', async () => {
    createView();

    await waitFor(() =>
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    );
    const thumbnail = await screen.findAllByAltText('test');
    await user.click(thumbnail[0]);

    expect(axiosGetSpy).toHaveBeenCalledWith('/images/1');
    await waitFor(() => {
      expect(
        screen.getByText('File name: stfc-logo-blue-text.png')
      ).toBeInTheDocument();
    });
    expect(screen.getByText('Title: stfc-logo-blue-text')).toBeInTheDocument();
    expect(screen.getByText('test')).toBeInTheDocument();

    const galleryLightBox = within(screen.getByTestId('galleryLightBox'));

    const imageElement1 = await galleryLightBox.findByAltText(`test`);

    expect(imageElement1).toBeInTheDocument();

    expect(imageElement1).toHaveAttribute(
      'src',
      `http://localhost:3000/images/stfc-logo-blue-text.png?text=1`
    );

    await user.click(galleryLightBox.getByLabelText('Image Actions'));

    const downloadButton = await screen.findAllByText(`Download`);

    await user.click(downloadButton[0]);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    expect(
      await within(screen.getByRole('dialog')).findByText('Download Image?')
    ).toBeInTheDocument();
    await user.click(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: 'Cancel',
        hidden: true,
      })
    );

    await user.click(galleryLightBox.getAllByLabelText('Close')[1]);

    await waitFor(() => {
      expect(screen.queryByTestId('galleryLightBox')).not.toBeInTheDocument();
    });
  });

  it('renders correctly in dense view', async () => {
    props.dense = true;
    let baseElement;
    await act(async () => {
      baseElement = createView().baseElement;
    });

    await waitFor(() =>
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    );

    expect((await screen.findAllByText('logo1.png')).length).toEqual(9);

    expect(baseElement).toMatchSnapshot();
  });

  it('does not store filters in url when dense', async () => {
    props.dense = true;

    const { router } = createView();

    await waitFor(() =>
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    );

    expect((await screen.findAllByText('logo1.png')).length).toEqual(9);

    const initialURL = router.state.location.search;
    await user.click(screen.getByRole('button', { name: 'Show/Hide filters' }));

    expect(
      await screen.findByLabelText('Filter by File name')
    ).toBeInTheDocument();

    const nameInput = screen.getByLabelText('Filter by File name');
    await user.type(nameInput, 'stfc-logo-blue-text.png');
    await waitFor(() => {
      expect(screen.queryByText('logo1.png')).not.toBeInTheDocument();
    });

    expect(router.state.location.search).toBe(initialURL);
  });

  it('can open and close upload dialog when dense', async () => {
    props.dense = true;
    createView();

    await waitFor(() =>
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    );

    expect((await screen.findAllByText('logo1.png')).length).toEqual(9);

    const uploadImageButton = screen.getByRole('button', {
      name: 'Upload Images',
    });

    await user.click(uploadImageButton);
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const closeButton = screen.getByRole('button', { name: 'Close Modal' });
    await user.click(closeButton);
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('displays no images message and can open and close upload dialog when dense', async () => {
    props.dense = true;
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

    const uploadImageButton = screen.getByRole('button', {
      name: 'Upload Images',
    });

    await user.click(uploadImageButton);
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const closeButton = screen.getByRole('button', { name: 'Close Modal' });
    await user.click(closeButton);
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});
