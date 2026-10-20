import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import * as fs from 'fs';
import { http, HttpResponse } from 'msw';
import * as path from 'path';

import { MockInstance } from 'vitest';
import { ingestApi } from '../api/api';
import handleTransferState from '../handleTransferState';
import CatalogueCategoriesJSON from '../mocks/CatalogueCategories.json';
import { server } from '../mocks/server';
import SystemsJSON from '../mocks/Systems.json';
import {
  getCatalogueCategoryById,
  getSystemById,
  renderComponentWithRouterProvider,
} from '../testUtils';
import {
  handleBlobDownload,
  parseCatalogueItemSpreadsheetError,
  parseItemSpreadsheetError,
} from '../utils';
import ImportTemplateDialog, {
  ImportSpreadsheetConfig,
  ImportTemplateDialogProps,
} from './importTemplateDialog.component';

const filePath = path.resolve(
  __dirname,
  '../mocks/CatalogueItemTemplate-test.xlsx'
);

vi.mock('../handleTransferState');

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
  NonLeafCatalogueCategoryError:
    'Cannot have a catalogue items template for a non-leaf catalogue category',
  InvalidCatalogueItemData: 'Invalid catalogue item data',
  FileTypeMismatch:
    'File does not contain the correct extension or content type do not match',
  UnsupportedFileExtension: 'File extension is not supported',
  MissingEntity: 'The specified catalogue category does not exist',
  TooManyCatalogueItems:
    'Too many catalogue items in spreadsheet. Found 1050 but only a maximum of 1000 can be processed at once.',
  MaximumAllowedCatalogueItems:
    'Too many catalogue items in spreadsheet. Found 1050 but only a maximum can be processed at once.',
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

const catalogueItemsImportConfig: ImportSpreadsheetConfig = {
  endpointSegment: 'catalogue-items',
  parentIdMetaField: 'catalogue_category_id',
  templateFileNamePrefix: 'CatalogueItemTemplate',
  validationFileNamePrefix: 'CatalogueItemsValidation',
  downloadStepTitle: 'Download Catalogue Template',
  downloadStepDescription:
    'Download the spreadsheet template, populate it with catalogue item data, then proceed to validation.',
  validateStepDescription:
    'Upload your completed spreadsheet to validate catalogue items. Any errors or warnings will be highlighted in a downloadable spreadsheet.',
  importReadyDescription:
    'Validation completed successfully. The spreadsheet is ready to be imported into the catalogue.',
  importPendingApprovalDescription:
    'Your spreadsheet has been validated successfully. Please contact an administrator to import the spreadsheet so the catalogue items can be made available.',
  getDownloadErrorMessage: (errorMessage) => {
    if (
      errorMessage ===
        'cannot generate a catalogue items template for a non-leaf catalogue category' ||
      errorMessage === 'the specified catalogue category does not exist'
    ) {
      return 'The selected catalogue category no longer exists or is invalid. Please navigate to a valid category catalogue that contains catalogue items and try again.';
    }
    return undefined;
  },
  parseImportError: parseCatalogueItemSpreadsheetError,
  getInvalidateQueryKey: (parentId) => ['CatalogueItems', parentId],
};

const itemsImportConfig: ImportSpreadsheetConfig = {
  endpointSegment: 'items',
  parentIdMetaField: 'system_id',
  templateFileNamePrefix: 'ItemTemplate',
  validationFileNamePrefix: 'ItemsValidation',
  downloadStepTitle: 'Download Items Template',
  downloadStepDescription:
    'Download the spreadsheet template, populate it with item data, then proceed to validation.',
  validateStepDescription:
    'Upload your completed spreadsheet to validate items. Any errors or warnings will be highlighted in a downloadable spreadsheet.',
  importReadyDescription:
    'Validation completed successfully. The spreadsheet is ready to be imported into the system.',
  importPendingApprovalDescription:
    'Your spreadsheet has been validated successfully. Please contact an administrator to import the spreadsheet so the items can be made available.',
  getDownloadErrorMessage: (errorMessage) => {
    if (errorMessage === 'the specified system does not exist') {
      return 'The selected system no longer exists or is invalid. Please navigate to a valid system and try again.';
    }
    return undefined;
  },
  parseImportError: parseItemSpreadsheetError,
  getInvalidateQueryKey: (parentId) => ['Items', parentId],
};

interface ItemIngestEndpointHelperProps {
  warnings: number;
  errors: number;
  valid: boolean;
  systemId: string;
}
const itemIngestEndpointHelper = (props: ItemIngestEndpointHelperProps) => {
  const { warnings, errors, valid, systemId } = props;
  const fileBuffer = fs.readFileSync(filePath);

  const blob = new Blob([fileBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const system = SystemsJSON.find((val) => val.id === systemId);

  return new HttpResponse(blob, {
    status: 200,
    headers: {
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="ItemTemplate-${system?.name}-Validated.xlsx"`,
      'IMSIngestAPI-Validation-Warnings': String(warnings),
      'IMSIngestAPI-Validation-Errors': String(errors),
      'IMSIngestAPI-Validation-Valid': String(valid),
    },
  });
};

const itemBackendErrorMessage = {
  IMSIngestAPIVersion:
    "Unable to find the custom document property 'IMSIngestAPIVersion' in the workbook properties",
  InvalidSpreadsheetFile: 'File given is not a valid spreadsheet',
  InvalidItemData: 'Invalid item data',
  FileTypeMismatch:
    'File does not contain the correct extension or content type do not match',
  UnsupportedFileExtension: 'File extension is not supported',
  MissingEntity: 'The specified system does not exist',
  TooManyItems:
    'Too many items in spreadsheet. Found 1050 but only a maximum of 1000 can be processed at once.',
  MaximumAllowedItems:
    'Too many items in spreadsheet. Found 1050 but only a maximum can be processed at once.',
  TemplateVersionMismatch:
    'Spreadsheet was created by IMS Ingest API v1 which is incompatible with the current version',
  MissingSheet: "Unable to find the 'Items Template' sheet in the workbook",
  ColumnsModified:
    'The columns within the template are either out of date or have been modified.',
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
      config: catalogueItemsImportConfig,
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

  it('calls onclose when the cancel button is clicked', async () => {
    createView();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onClose).toHaveBeenCalled();
  });

  it('downloads spreadsheet template', async () => {
    createView();

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Download Template' })
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Download Template' }));

    expect(axiosPostSpy).toHaveBeenCalledWith(
      '/spreadsheets/catalogue-items/template',
      {
        catalogue_category_id: '4',
      },
      { responseType: 'blob' }
    );

    expect(handleBlobDownload).toHaveBeenCalled();
  });

  it('display an error message when "Cannot generate a catalogue items template for a non-leaf catalogue category" and user try to download a template', async () => {
    server.use(
      http.post('/spreadsheets/catalogue-items/template', () => {
        return HttpResponse.json(
          {
            detail:
              'Cannot generate a catalogue items template for a non-leaf catalogue category',
          },
          { status: 422 }
        );
      })
    );

    // jsdom does not execute requestAnimationFrame like a real browser.
    // Our download button is injected via requestAnimationFrame (injectDownloadLink),
    // so in tests the button may not exist or may appear too late.
    // This mock forces requestAnimationFrame to run immediately,
    // ensuring the button is added to the DOM before interactions occur.
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      cb(0);
      return 0;
    });

    createView();

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Download Template' })
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Download Template' }));

    await waitFor(() => {
      expect(handleTransferState).toHaveBeenCalled();
    });
    expect(handleTransferState).toHaveBeenCalledWith([
      {
        message:
          'The selected catalogue category no longer exists or is invalid. Please navigate to a valid category catalogue that contains catalogue items and try again.',
        name: 'Download template',
        state: 'error',
      },
    ]);
  });

  it('display an error message when "The specified catalogue category does not exist" and user try to download a template', async () => {
    server.use(
      http.post('/spreadsheets/catalogue-items/template', () => {
        return HttpResponse.json(
          { detail: 'The specified catalogue category does not exist' },
          { status: 422 }
        );
      })
    );

    // jsdom does not execute requestAnimationFrame like a real browser.
    // Our download button is injected via requestAnimationFrame (injectDownloadLink),
    // so in tests the button may not exist or may appear too late.
    // This mock forces requestAnimationFrame to run immediately,
    // ensuring the button is added to the DOM before interactions occur.
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      cb(0);
      return 0;
    });

    createView();

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Download Template' })
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Download Template' }));

    await waitFor(() => {
      expect(handleTransferState).toHaveBeenCalled();
    });
    expect(handleTransferState).toHaveBeenCalledWith([
      {
        message:
          'The selected catalogue category no longer exists or is invalid. Please navigate to a valid category catalogue that contains catalogue items and try again.',
        name: 'Download template',
        state: 'error',
      },
    ]);
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
      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: 'Download Template' })
        ).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: 'Next' }));

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

      await user.click(await screen.findByText('Validate 1 file'));

      expect(xhrPostSpy).toHaveBeenCalledWith(
        'POST',
        '/spreadsheets/catalogue-items/validate',
        true
      );
      expect(handleTransferState).toHaveBeenCalledWith([
        {
          message: 'Valid',
          name: 'Spreadsheet',
          state: 'success',
        },
      ]);

      expect(
        await screen.findByText(
          `Validation complete. No errors or warnings found. Please click Next to proceed.`
        )
      ).toBeInTheDocument();

      expect(await screen.findByText('Complete')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Next' }));

      await user.click(await screen.findByText('Import 1 file'));
      expect(xhrPostSpy).toHaveBeenCalledWith(
        'POST',
        '/spreadsheets/catalogue-items/ingest',
        true
      );

      expect(await screen.findByText('Complete')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Finish' }));

      expect(onClose).toHaveBeenCalled();
    });

    it('displays a warning message when there are warnings in the spreadsheet', async () => {
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

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: 'Download Template' })
        ).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: 'Next' }));

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

      await user.click(await screen.findByText('Validate 1 file'));

      expect(xhrPostSpy).toHaveBeenCalledWith(
        'POST',
        '/spreadsheets/catalogue-items/validate',
        true
      );

      expect(handleTransferState).toHaveBeenCalledWith([
        {
          message: 'Valid with warnings',
          name: 'Spreadsheet',
          state: 'warning',
        },
      ]);

      expect(
        await screen.findByText(
          'Validation completed with 5 warnings. A spreadsheet highlighting the warnings has been downloaded. Please click Next to proceed.'
        )
      ).toBeInTheDocument();

      expect(await screen.findByText('Complete')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Next' }));

      await user.click(await screen.findByText('Import 1 file'));

      expect(xhrPostSpy).toHaveBeenCalledWith(
        'POST',
        '/spreadsheets/catalogue-items/ingest',
        true
      );

      expect(await screen.findByText('Complete')).toBeInTheDocument();
    });

    it('displays an error message when there are errors in the spreadsheet', async () => {
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

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: 'Download Template' })
        ).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: 'Next' }));

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

      await user.click(await screen.findByText('Validate 1 file'));

      expect(xhrPostSpy).toHaveBeenCalledWith(
        'POST',
        '/spreadsheets/catalogue-items/validate',
        true
      );

      expect(handleTransferState).toHaveBeenCalledWith([
        {
          message: 'Invalid',
          name: 'Spreadsheet',
          state: 'error',
        },
      ]);

      expect(
        await screen.findByText(
          'Validation failed with 5 errors. A spreadsheet with highlighted issues has been downloaded.'
        )
      ).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.queryByText('Validate 1 file')).not.toBeInTheDocument();
      });
    });

    it('displays an error and warning message when there are errors and warnings in the spreadsheet', async () => {
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

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: 'Download Template' })
        ).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: 'Next' }));

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

      await user.click(await screen.findByText('Validate 1 file'));

      expect(xhrPostSpy).toHaveBeenCalledWith(
        'POST',
        '/spreadsheets/catalogue-items/validate',
        true
      );

      expect(handleTransferState).toHaveBeenCalledWith([
        {
          message: 'Invalid',
          name: 'Spreadsheet',
          state: 'error',
        },
      ]);

      expect(
        await screen.findByText(
          'Validation failed with 5 errors and 5 warnings. A spreadsheet with highlighted issues has been downloaded.'
        )
      ).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.queryByText('Validate 1 file')).not.toBeInTheDocument();
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

        await waitFor(() => {
          expect(
            screen.getByRole('button', { name: 'Download Template' })
          ).toBeInTheDocument();
        });

        await user.click(screen.getByRole('button', { name: 'Next' }));

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

        await user.click(await screen.findByText('Validate 1 file'));

        expect(xhrPostSpy).toHaveBeenCalledWith(
          'POST',
          '/spreadsheets/catalogue-items/validate',
          true
        );

        await waitFor(
          () => {
            expect(screen.getByText('Validate failed')).toBeInTheDocument();
          },
          { timeout: 5000 }
        );

        await waitFor(() => {
          expect(
            screen.getAllByLabelText(
              parseCatalogueItemSpreadsheetError(backendMessage.toLowerCase())
            ).length
          ).toBe(2);
        });

        await waitFor(() => {
          expect(screen.queryByText('Upload 1 file')).not.toBeInTheDocument();
        });
      }, 10000);
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
      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: 'Download Template' })
        ).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: 'Next' }));

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

      await user.click(await screen.findByText('Validate 1 file'));

      expect(xhrPostSpy).toHaveBeenCalledWith(
        'POST',
        '/spreadsheets/catalogue-items/validate',
        true
      );
      expect(handleTransferState).toHaveBeenCalledWith([
        {
          message: 'Valid',
          name: 'Spreadsheet',
          state: 'success',
        },
      ]);
      expect(
        await screen.findByText(
          `Validation complete. No errors or warnings found. Please click Next to proceed.`
        )
      ).toBeInTheDocument();
      expect(await screen.findByText('Complete')).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: 'Next' }));

      expect(
        await screen.findByText('Administrator Action Required')
      ).toBeInTheDocument();
    });

    it('displays a warning message when there are warnings in the spreadsheet', async () => {
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
      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: 'Download Template' })
        ).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: 'Next' }));

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

      await user.click(await screen.findByText('Validate 1 file'));

      expect(xhrPostSpy).toHaveBeenCalledWith(
        'POST',
        '/spreadsheets/catalogue-items/validate',
        true
      );

      expect(handleTransferState).toHaveBeenCalledWith([
        {
          message: 'Valid with warnings',
          name: 'Spreadsheet',
          state: 'warning',
        },
      ]);

      expect(await screen.findByText('Complete')).toBeInTheDocument();

      expect(
        await screen.findByText(
          'Validation completed with 5 warnings. A spreadsheet highlighting the warnings has been downloaded. Please click Next to proceed.'
        )
      ).toBeInTheDocument();
    });

    it('displays an error message when there are errors in the spreadsheet', async () => {
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
      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: 'Download Template' })
        ).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: 'Next' }));

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

      await user.click(await screen.findByText('Validate 1 file'));

      expect(handleTransferState).toHaveBeenCalledWith([
        {
          message: 'Invalid',
          name: 'Spreadsheet',
          state: 'error',
        },
      ]);

      expect(
        await screen.findByText(
          'Validation failed with 5 errors. A spreadsheet with highlighted issues has been downloaded.'
        )
      ).toBeInTheDocument();
    });

    it('displays an error and warning message when there are errors and warnings in the spreadsheet', async () => {
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
      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: 'Download Template' })
        ).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: 'Next' }));

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

      await user.click(await screen.findByText('Validate 1 file'));

      await waitFor(() => {
        expect(screen.queryByText('Validate 1 file')).not.toBeInTheDocument();
      });

      expect(handleTransferState).toHaveBeenCalledWith([
        {
          message: 'Invalid',
          name: 'Spreadsheet',
          state: 'error',
        },
      ]);
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
        await waitFor(() => {
          expect(
            screen.getByRole('button', { name: 'Download Template' })
          ).toBeInTheDocument();
        });

        await user.click(screen.getByRole('button', { name: 'Next' }));

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
        await user.click(await screen.findByText('Validate 1 file'));

        await waitFor(
          () => {
            expect(screen.getByText('Validate failed')).toBeInTheDocument();
          },
          { timeout: 5000 }
        );

        await waitFor(() => {
          expect(
            screen.getAllByLabelText(
              parseCatalogueItemSpreadsheetError(backendMessage.toLowerCase())
            ).length
          ).toBe(2);
        });
      }, 10000);
    });
  });
});

describe('Upload attachment dialog (Items)', () => {
  let props: ImportTemplateDialogProps;
  let user: UserEvent;
  let axiosPostSpy: MockInstance;
  let xhrPostSpy: MockInstance;
  const system = getSystemById('656da8ef9cba7a76c6f81a5d');

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
      parentId: system?.id ?? '',
      parentName: system?.name ?? '',
      isAdminMode: false,
      config: itemsImportConfig,
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

  it('calls onclose when the cancel button is clicked', async () => {
    createView();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onClose).toHaveBeenCalled();
  });

  it('downloads spreadsheet template', async () => {
    createView();

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Download Template' })
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Download Template' }));

    expect(axiosPostSpy).toHaveBeenCalledWith(
      '/spreadsheets/items/template',
      undefined,
      {
        responseType: 'blob',
      }
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
      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: 'Download Template' })
        ).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: 'Next' }));

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

      await user.click(await screen.findByText('Validate 1 file'));

      expect(xhrPostSpy).toHaveBeenCalledWith(
        'POST',
        '/spreadsheets/items/validate',
        true
      );
      expect(handleTransferState).toHaveBeenCalledWith([
        {
          message: 'Valid',
          name: 'Spreadsheet',
          state: 'success',
        },
      ]);

      expect(
        await screen.findByText(
          `Validation complete. No errors or warnings found. Please click Next to proceed.`
        )
      ).toBeInTheDocument();

      expect(await screen.findByText('Complete')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Next' }));

      await user.click(await screen.findByText('Import 1 file'));
      expect(xhrPostSpy).toHaveBeenCalledWith(
        'POST',
        '/spreadsheets/items/ingest',
        true
      );

      expect(await screen.findByText('Complete')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Finish' }));

      expect(onClose).toHaveBeenCalled();
    });

    it('displays a warning message when there are warnings in the spreadsheet', async () => {
      server.use(
        http.post('/spreadsheets/items/validate', async () => {
          return itemIngestEndpointHelper({
            warnings: 5,
            errors: 0,
            valid: true,
            systemId: props.parentId,
          });
        })
      );
      createView();

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: 'Download Template' })
        ).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: 'Next' }));

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

      await user.click(await screen.findByText('Validate 1 file'));

      expect(xhrPostSpy).toHaveBeenCalledWith(
        'POST',
        '/spreadsheets/items/validate',
        true
      );

      expect(handleTransferState).toHaveBeenCalledWith([
        {
          message: 'Valid with warnings',
          name: 'Spreadsheet',
          state: 'warning',
        },
      ]);

      expect(
        await screen.findByText(
          'Validation completed with 5 warnings. A spreadsheet highlighting the warnings has been downloaded. Please click Next to proceed.'
        )
      ).toBeInTheDocument();

      expect(await screen.findByText('Complete')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Next' }));

      await user.click(await screen.findByText('Import 1 file'));

      expect(xhrPostSpy).toHaveBeenCalledWith(
        'POST',
        '/spreadsheets/items/ingest',
        true
      );

      expect(await screen.findByText('Complete')).toBeInTheDocument();
    });

    it('displays an error message when there are errors in the spreadsheet', async () => {
      server.use(
        http.post('/spreadsheets/items/validate', async () => {
          return itemIngestEndpointHelper({
            warnings: 0,
            errors: 5,
            valid: false,
            systemId: props.parentId,
          });
        })
      );
      createView();

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: 'Download Template' })
        ).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: 'Next' }));

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

      await user.click(await screen.findByText('Validate 1 file'));

      expect(xhrPostSpy).toHaveBeenCalledWith(
        'POST',
        '/spreadsheets/items/validate',
        true
      );

      expect(handleTransferState).toHaveBeenCalledWith([
        {
          message: 'Invalid',
          name: 'Spreadsheet',
          state: 'error',
        },
      ]);

      expect(
        await screen.findByText(
          'Validation failed with 5 errors. A spreadsheet with highlighted issues has been downloaded.'
        )
      ).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.queryByText('Validate 1 file')).not.toBeInTheDocument();
      });
    });

    it('displays an error and warning message when there are errors and warnings in the spreadsheet', async () => {
      server.use(
        http.post('/spreadsheets/items/validate', async () => {
          return itemIngestEndpointHelper({
            warnings: 5,
            errors: 5,
            valid: false,
            systemId: props.parentId,
          });
        })
      );
      createView();

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: 'Download Template' })
        ).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: 'Next' }));

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

      await user.click(await screen.findByText('Validate 1 file'));

      expect(xhrPostSpy).toHaveBeenCalledWith(
        'POST',
        '/spreadsheets/items/validate',
        true
      );

      expect(handleTransferState).toHaveBeenCalledWith([
        {
          message: 'Invalid',
          name: 'Spreadsheet',
          state: 'error',
        },
      ]);

      expect(
        await screen.findByText(
          'Validation failed with 5 errors and 5 warnings. A spreadsheet with highlighted issues has been downloaded.'
        )
      ).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.queryByText('Validate 1 file')).not.toBeInTheDocument();
      });
    });

    Object.entries(itemBackendErrorMessage).forEach(([key, backendMessage]) => {
      it(`displays ${key} error message`, async () => {
        server.use(
          http.post('/spreadsheets/items/validate', async () => {
            return HttpResponse.json(
              { detail: backendMessage },
              { status: 422 }
            );
          })
        );

        createView();

        await waitFor(() => {
          expect(
            screen.getByRole('button', { name: 'Download Template' })
          ).toBeInTheDocument();
        });

        await user.click(screen.getByRole('button', { name: 'Next' }));

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

        await user.click(await screen.findByText('Validate 1 file'));

        expect(xhrPostSpy).toHaveBeenCalledWith(
          'POST',
          '/spreadsheets/items/validate',
          true
        );

        await waitFor(
          () => {
            expect(screen.getByText('Validate failed')).toBeInTheDocument();
          },
          { timeout: 5000 }
        );

        await waitFor(() => {
          expect(
            screen.getAllByLabelText(
              parseItemSpreadsheetError(backendMessage.toLowerCase())
            ).length
          ).toBe(2);
        });

        await waitFor(() => {
          expect(screen.queryByText('Upload 1 file')).not.toBeInTheDocument();
        });
      }, 10000);
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
      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: 'Download Template' })
        ).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: 'Next' }));

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

      await user.click(await screen.findByText('Validate 1 file'));

      expect(xhrPostSpy).toHaveBeenCalledWith(
        'POST',
        '/spreadsheets/items/validate',
        true
      );
      expect(handleTransferState).toHaveBeenCalledWith([
        {
          message: 'Valid',
          name: 'Spreadsheet',
          state: 'success',
        },
      ]);
      expect(
        await screen.findByText(
          `Validation complete. No errors or warnings found. Please click Next to proceed.`
        )
      ).toBeInTheDocument();
      expect(await screen.findByText('Complete')).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: 'Next' }));

      expect(
        await screen.findByText('Administrator Action Required')
      ).toBeInTheDocument();
    });

    it('displays a warning message when there are warnings in the spreadsheet', async () => {
      server.use(
        http.post('/spreadsheets/items/validate', async () => {
          return itemIngestEndpointHelper({
            warnings: 5,
            errors: 0,
            valid: true,
            systemId: props.parentId,
          });
        })
      );
      createView();
      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: 'Download Template' })
        ).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: 'Next' }));

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

      await user.click(await screen.findByText('Validate 1 file'));

      expect(xhrPostSpy).toHaveBeenCalledWith(
        'POST',
        '/spreadsheets/items/validate',
        true
      );

      expect(handleTransferState).toHaveBeenCalledWith([
        {
          message: 'Valid with warnings',
          name: 'Spreadsheet',
          state: 'warning',
        },
      ]);

      expect(await screen.findByText('Complete')).toBeInTheDocument();

      expect(
        await screen.findByText(
          'Validation completed with 5 warnings. A spreadsheet highlighting the warnings has been downloaded. Please click Next to proceed.'
        )
      ).toBeInTheDocument();
    });

    it('displays an error message when there are errors in the spreadsheet', async () => {
      server.use(
        http.post('/spreadsheets/items/validate', async () => {
          return itemIngestEndpointHelper({
            warnings: 0,
            errors: 5,
            valid: false,
            systemId: props.parentId,
          });
        })
      );
      createView();
      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: 'Download Template' })
        ).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: 'Next' }));

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

      await user.click(await screen.findByText('Validate 1 file'));

      expect(handleTransferState).toHaveBeenCalledWith([
        {
          message: 'Invalid',
          name: 'Spreadsheet',
          state: 'error',
        },
      ]);

      expect(
        await screen.findByText(
          'Validation failed with 5 errors. A spreadsheet with highlighted issues has been downloaded.'
        )
      ).toBeInTheDocument();
    });

    it('displays an error and warning message when there are errors and warnings in the spreadsheet', async () => {
      server.use(
        http.post('/spreadsheets/items/validate', async () => {
          return itemIngestEndpointHelper({
            warnings: 5,
            errors: 5,
            valid: false,
            systemId: props.parentId,
          });
        })
      );
      createView();
      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: 'Download Template' })
        ).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: 'Next' }));

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

      await user.click(await screen.findByText('Validate 1 file'));

      await waitFor(() => {
        expect(screen.queryByText('Validate 1 file')).not.toBeInTheDocument();
      });

      expect(handleTransferState).toHaveBeenCalledWith([
        {
          message: 'Invalid',
          name: 'Spreadsheet',
          state: 'error',
        },
      ]);
      expect(
        await screen.findByText(
          'Validation failed with 5 errors and 5 warnings. A spreadsheet with highlighted issues has been downloaded.'
        )
      ).toBeInTheDocument();
    });

    Object.entries(itemBackendErrorMessage).forEach(([key, backendMessage]) => {
      it(`displays ${key} error message`, async () => {
        server.use(
          http.post('/spreadsheets/items/validate', async () => {
            return HttpResponse.json(
              { detail: backendMessage },
              { status: 422 }
            );
          })
        );

        createView();
        await waitFor(() => {
          expect(
            screen.getByRole('button', { name: 'Download Template' })
          ).toBeInTheDocument();
        });

        await user.click(screen.getByRole('button', { name: 'Next' }));

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
        await user.click(await screen.findByText('Validate 1 file'));

        await waitFor(
          () => {
            expect(screen.getByText('Validate failed')).toBeInTheDocument();
          },
          { timeout: 5000 }
        );

        await waitFor(() => {
          expect(
            screen.getAllByLabelText(
              parseItemSpreadsheetError(backendMessage.toLowerCase())
            ).length
          ).toBe(2);
        });
      }, 10000);
    });
  });
});
