import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import * as fs from 'fs';
import { http, HttpResponse } from 'msw';
import * as path from 'path';
import { act } from 'react';
import { MockInstance } from 'vitest';
import { ingestApi } from '../api/api';
import CatalogueCategoriesJSON from '../mocks/CatalogueCategories.json';
import { server } from '../mocks/server';
import {
  getCatalogueCategoryById,
  renderComponentWithRouterProvider,
} from '../testUtils';
import { handleBlobDownload, parseSpreadsheetError } from '../utils';
import ImportTemplateDialog, {
  ImportTemplateDialogProps,
} from './importTemplateDialog.component';

const filePath = path.resolve(
  __dirname,
  '../mocks/CatalogueItemTemplate-test.xlsx'
);

vi.mock('../utils', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../utils')>();

  return {
    ...actual,
    handleBlobDownload: vi.fn(),
  };
});

const backendErrorMessage = {
  IMSIngestAPIVersion:
    "Unable to find the custom document property 'IMSIngestAPIVersion' in the workbook properties",
  InvalidSpreadsheetFile: 'File given is not a valid spreadsheet',
  FileTypeMismatch:
    'File does not contain the correct extension or content type do not match',
  UnsupportedFileExtension: 'File extension is not supported',
  MissingEntity: 'The specified catalogue category does not exist',
  TooManyCatalogueItems:
    'Too many catalogue items in spreadsheet. Found 1050 but only a maximum of 1000 can be processed at once.',
  CategoryMismatch:
    'Spreadsheet was generated for a catalogue category with a different ID than the one provided',
  TemplateVersionMismatch:
    'Spreadsheet was created by IMS Ingest API v1 which is incompatible with the current version',
  MissingSheet:
    "Unable to find the 'CatalogueItems Template' sheet in the workbook",
  ColumnsModified:
    'The columns within the template are either out of date or have been modified.',
};

interface IngestEndpointHelperProps {
  warnings: number;
  errors: number;
  valid: boolean;
  catalogueCategoryId: string;
}
const ingestEndpointHelper = (props: IngestEndpointHelperProps) => {
  const { warnings, errors, valid, catalogueCategoryId } = props;
  const fileBuffer = fs.readFileSync(filePath);

  const blob = new Blob([fileBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const catalogueCategory = CatalogueCategoriesJSON.find(
    (val) => val.id === catalogueCategoryId
  );

  return new HttpResponse(blob, {
    status: 200,
    headers: {
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="CatalogueItemTemplate-${catalogueCategory?.name}-Validated.xlsx"`,
      'IMSIngestAPI-Validation-Warnings': String(warnings),
      'IMSIngestAPI-Validation-Errors': String(errors),
      'IMSIngestAPI-Validation-Valid': String(valid),
    },
  });
};

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
      isAdminMode: false,
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

  describe('Admin mode', () => {
    beforeEach(() => {
      props = {
        ...props,
        isAdminMode: true,
      };
    });

    it('imports spreadsheet successfully', async () => {
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

      expect(xhrPostSpy).toHaveBeenCalledWith(
        'POST',
        '/spreadsheets/catalogue-items/validate',
        true
      );

      await user.click(await screen.findByText('Upload 1 file'));

      expect(xhrPostSpy).toHaveBeenCalledWith(
        'POST',
        '/spreadsheets/catalogue-items/ingest',
        true
      );

      expect(await screen.findByText('Complete')).toBeInTheDocument();
    });

    it('displays a warning message when there is warnings in the spreadsheet', async () => {
      server.use(
        http.post('/spreadsheets/catalogue-items/validate', async () => {
          return ingestEndpointHelper({
            warnings: 5,
            errors: 0,
            valid: true,
            catalogueCategoryId: props.parentId,
          });
        })
      );
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

      expect(xhrPostSpy).toHaveBeenCalledWith(
        'POST',
        '/spreadsheets/catalogue-items/validate',
        true
      );

      expect(
        await screen.findByText(
          'Validation completed with 5 warnings. A spreadsheet highlighting the warnings has been downloaded. Please click Upload to proceed.'
        )
      ).toBeInTheDocument();

      await user.click(await screen.findByText('Upload 1 file'));

      expect(xhrPostSpy).toHaveBeenCalledWith(
        'POST',
        '/spreadsheets/catalogue-items/ingest',
        true
      );

      expect(await screen.findByText('Complete')).toBeInTheDocument();
    });

    it('displays an error message when there is errors in the spreadsheet', async () => {
      server.use(
        http.post('/spreadsheets/catalogue-items/validate', async () => {
          return ingestEndpointHelper({
            warnings: 0,
            errors: 5,
            valid: false,
            catalogueCategoryId: props.parentId,
          });
        })
      );
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

      expect(xhrPostSpy).toHaveBeenCalledWith(
        'POST',
        '/spreadsheets/catalogue-items/validate',
        true
      );

      expect(
        await screen.findByText(
          'Validation failed with 5 errors. A spreadsheet with highlighted issues has been downloaded.'
        )
      ).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.queryByText('Upload 1 file')).not.toBeInTheDocument();
      });
    });

    it('displays an error and warning message when there is errors and warnings in the spreadsheet', async () => {
      server.use(
        http.post('/spreadsheets/catalogue-items/validate', async () => {
          return ingestEndpointHelper({
            warnings: 5,
            errors: 5,
            valid: false,
            catalogueCategoryId: props.parentId,
          });
        })
      );
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

      expect(xhrPostSpy).toHaveBeenCalledWith(
        'POST',
        '/spreadsheets/catalogue-items/validate',
        true
      );

      expect(
        await screen.findByText(
          'Validation failed with 5 errors and 5 warnings. A spreadsheet with highlighted issues has been downloaded.'
        )
      ).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.queryByText('Upload 1 file')).not.toBeInTheDocument();
      });
    });

    Object.entries(backendErrorMessage).forEach(([key, backendMessage]) => {
      it(`displays ${key} error message`, async () => {
        server.use(
          http.post('/spreadsheets/catalogue-items/validate', async () => {
            return HttpResponse.json(
              { detail: backendMessage },
              { status: 422 }
            );
          })
        );

        createView();

        const file = new File(['test'], 'test.xlsx', {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });

        const dropZone = screen.getByText('Files cannot be larger than', {
          exact: false,
        });

        fireEvent.drop(dropZone, {
          dataTransfer: {
            files: [file],
          },
        });

        await waitFor(() => {
          expect(screen.getByText('test.xlsx')).toBeInTheDocument();
        });

        expect(xhrPostSpy).toHaveBeenCalledWith(
          'POST',
          '/spreadsheets/catalogue-items/validate',
          true
        );

        expect(
          await screen.findByText(
            parseSpreadsheetError(backendMessage.toLowerCase())
          )
        ).toBeInTheDocument();

        await waitFor(() => {
          expect(screen.queryByText('Upload 1 file')).not.toBeInTheDocument();
        });
      });
    });
  });

  describe('normal mode', () => {
    beforeEach(() => {
      props = {
        ...props,
        isAdminMode: false,
      };
    });

    it('validates spreadsheet successfully', async () => {
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
        '/spreadsheets/catalogue-items/validate',
        true
      );
      expect(
        await screen.findByText(
          'Validation complete. No errors or warnings found. Please contact an admin to import the spreadsheet.'
        )
      ).toBeInTheDocument();
      expect(await screen.findByText('Complete')).toBeInTheDocument();
    });

    it('displays a warning message when there is warnings in the spreadsheet', async () => {
      server.use(
        http.post('/spreadsheets/catalogue-items/validate', async () => {
          return ingestEndpointHelper({
            warnings: 5,
            errors: 0,
            valid: true,
            catalogueCategoryId: props.parentId,
          });
        })
      );
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
        '/spreadsheets/catalogue-items/validate',
        true
      );

      expect(await screen.findByText('Complete')).toBeInTheDocument();

      expect(
        await screen.findByText(
          'Validation completed with 5 warnings. A spreadsheet highlighting the warnings has been downloaded. Please contact an admin to import the spreadsheet.'
        )
      ).toBeInTheDocument();
    });

    it('displays an error message when there is errors in the spreadsheet', async () => {
      server.use(
        http.post('/spreadsheets/catalogue-items/validate', async () => {
          return ingestEndpointHelper({
            warnings: 0,
            errors: 5,
            valid: false,
            catalogueCategoryId: props.parentId,
          });
        })
      );
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

      expect(
        await screen.findByText(
          'Validation failed with 5 errors. A spreadsheet with highlighted issues has been downloaded.'
        )
      ).toBeInTheDocument();
    });

    it('displays an error and warning message when there is errors and warnings in the spreadsheet', async () => {
      server.use(
        http.post('/spreadsheets/catalogue-items/validate', async () => {
          return ingestEndpointHelper({
            warnings: 5,
            errors: 5,
            valid: false,
            catalogueCategoryId: props.parentId,
          });
        })
      );
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

      await waitFor(() => {
        expect(screen.queryByText('Upload 1 file')).not.toBeInTheDocument();
      });

      expect(
        await screen.findByText(
          'Validation failed with 5 errors and 5 warnings. A spreadsheet with highlighted issues has been downloaded.'
        )
      ).toBeInTheDocument();
    });

    Object.entries(backendErrorMessage).forEach(([key, backendMessage]) => {
      it(`displays ${key} error message`, async () => {
        server.use(
          http.post('/spreadsheets/catalogue-items/validate', async () => {
            return HttpResponse.json(
              { detail: backendMessage },
              { status: 422 }
            );
          })
        );

        createView();

        const file = new File(['test'], 'test.xlsx', {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });

        const dropZone = screen.getByText('Files cannot be larger than', {
          exact: false,
        });

        fireEvent.drop(dropZone, {
          dataTransfer: {
            files: [file],
          },
        });

        await waitFor(() => {
          expect(screen.getByText('test.xlsx')).toBeInTheDocument();
        });

        await user.click(await screen.findByText('Upload 1 file'));

        await waitFor(() => {
          expect(screen.queryByText('Upload 1 file')).not.toBeInTheDocument();
        });

        await waitFor(
          () => {
            expect(screen.getByText('Upload failed')).toBeInTheDocument();
          },
          { timeout: 10000 }
        );

        await waitFor(() => {
          expect(
            screen.getAllByLabelText(
              parseSpreadsheetError(backendMessage.toLowerCase())
            ).length
          ).toBe(2);
        });
      }, 15000);
    });
  });
});
