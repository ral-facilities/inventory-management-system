import { ImportSpreadsheetConfig } from '../../common/importTemplateDialog.component';
import { parseCatalogueItemSpreadsheetError } from '../../utils';

export const useCatalogueItemsImportConfig = (): ImportSpreadsheetConfig => {
  return {
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
};
