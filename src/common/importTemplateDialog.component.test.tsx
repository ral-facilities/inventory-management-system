import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { act } from 'react';
import { MockInstance } from 'vitest';
import { ingestApi } from '../api/api';
import {
  getCatalogueCategoryById,
  renderComponentWithRouterProvider,
} from '../testUtils';
import { handleBlobDownload } from '../utils';
import ImportTemplateDialog, {
  ImportTemplateDialogProps,
} from './importTemplateDialog.component';

vi.mock('../utils', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../utils')>();

  return {
    ...actual,
    handleBlobDownload: vi.fn(),
  };
});

describe('Upload attachment dialog', () => {
  let props: ImportTemplateDialogProps;
  let user: UserEvent;
  let axiosPostSpy: MockInstance;
  let xhrPostSpy: MockInstance;
  const catalogueCategory = getCatalogueCategoryById('4');

  const onClose = vi.fn();

  const createView = () => {
    return renderComponentWithRouterProvider(
      <ImportTemplateDialog {...props} />
    );
  };

  beforeEach(() => {
    props = {
      open: true,
      onClose: onClose,
      parentId: catalogueCategory.id,
      parentName: catalogueCategory.name,
    };
    user = userEvent.setup();
    axiosPostSpy = vi.spyOn(ingestApi, 'post');
    xhrPostSpy = vi.spyOn(window.XMLHttpRequest.prototype, 'open');
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
    axiosPostSpy.mockRestore();
    xhrPostSpy.mockRestore();
  });

  it('renders dialog correctly', async () => {
    let baseElement;
    await act(async () => {
      baseElement = createView().baseElement;
    });

    expect(
      screen.getByText('Files cannot be larger than', { exact: false })
    ).toBeInTheDocument();
    expect(baseElement).toMatchSnapshot();
  });

  it('calls onclose when close button is clicked', async () => {
    createView();

    await user.click(screen.getByLabelText('Close Modal'));

    expect(onClose).toHaveBeenCalled();
  });

  it('downloads spreadsheet template', async () => {
    createView();

    await waitFor(() => {
      expect(screen.getAllByRole('button')).toHaveLength(2);
    });

    await user.click(screen.getAllByRole('button')[2]);

    expect(axiosPostSpy).toHaveBeenCalledWith(
      '/spreadsheets/catalogue-items/template',
      {
        catalogue_category_id: '4',
      },
      { responseType: 'blob' }
    );

    expect(handleBlobDownload).toHaveBeenCalled();
  });

  it('posts spreadsheet metadata successfully', async () => {
    createView();

    const file1 = new File(['test'], 'test1.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const dropZone = screen.getByText('Files cannot be larger than', {
      exact: false,
    });

    Object.defineProperty(dropZone, 'files', {
      value: [file1],
    });

    fireEvent.drop(dropZone, {
      dataTransfer: {
        files: [file1],
      },
    });

    await waitFor(() => {
      expect(screen.getByText('test1.xlsx')).toBeInTheDocument();
    });

    await user.click(await screen.findByText('Upload 1 file'));

    expect(xhrPostSpy).toHaveBeenCalledWith(
      'POST',
      '/spreadsheets/catalogue-items/ingest',
      true
    );

    expect(await screen.findByText('Complete')).toBeInTheDocument();
  });
});
