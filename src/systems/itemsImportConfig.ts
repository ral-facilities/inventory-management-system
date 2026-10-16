import { ImportSpreadsheetConfig } from '../common/importTemplateDialog.component';
import { parseBaseError } from '../utils';

export const useItemsImportConfig = (): ImportSpreadsheetConfig => {
  return {
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
    parseImportError: parseBaseError,
    getInvalidateQueryKey: (parentId) => ['Items', parentId],
  };
};
