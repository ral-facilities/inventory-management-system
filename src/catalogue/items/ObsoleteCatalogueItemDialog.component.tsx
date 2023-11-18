import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from '@mui/material';
import React from 'react';
import { useCatalogueCategoryById } from '../../api/catalogueCategory';
import { useEditCatalogueItem } from '../../api/catalogueItem';
import {
  CatalogueItem,
  EditCatalogueItem,
  ObsoleteDetails,
} from '../../app.types';
import CatalogueItemsTable from './catalogueItemsTable.component';

export interface ObsoleteCatalogueItemDialogProps {
  open: boolean;
  onClose: () => void;
  catalogueItem: CatalogueItem | undefined;
  obsoleteReplacementId?: string | null;
}

const steps = ['Is Obsolete', 'Obsolete Reason', 'Obsolete Replacement'];

const ObsoleteCatalogueItemDialog = (
  props: ObsoleteCatalogueItemDialogProps
) => {
  const { open, onClose, catalogueItem } = props;

  const [activeStep, setActiveStep] = React.useState(0);

  const [error, setError] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | undefined>(
    undefined
  );

  const [obsoleteDetails, setObsoleteDetails] = React.useState<ObsoleteDetails>(
    {
      is_obsolete: false,
      obsolete_reason: null,
      obsolete_replacement_catalogue_item_id: null,
    }
  );

  const [obsoleteReplacementId, setObsoleteReplacementId] = React.useState<
    string | null
  >(null);

  const prevObsoleteReplacementIdRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    // Compare the current and previous obsoleteReplacementId
    if (prevObsoleteReplacementIdRef.current === obsoleteReplacementId) {
      return; // Return early if they are the same
    }

    // Update the ref with the current obsoleteReplacementId
    prevObsoleteReplacementIdRef.current = obsoleteReplacementId;

    // Update the obsoleteDetails with the new obsoleteReplacementId
    setObsoleteDetails({
      ...obsoleteDetails,
      obsolete_replacement_catalogue_item_id: obsoleteReplacementId,
    });
  }, [obsoleteReplacementId, obsoleteDetails]);
  console.log(obsoleteReplacementId, obsoleteDetails);
  const { data: catalogueCategoryData } = useCatalogueCategoryById(
    catalogueItem?.catalogue_category_id
  );
  const { mutateAsync: editCatalogueItem } = useEditCatalogueItem();

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleStepChange = (step: number) => {
    setActiveStep(step);
  };
  const handleDeleteCatalogueCategory2 = React.useCallback(() => {
    if (catalogueItem) {
      const isIsObsoleteUpdated =
        String(obsoleteDetails.is_obsolete) !==
        String(catalogueItem.is_obsolete);

      const isObsoleteReasonUpdated =
        obsoleteDetails.obsolete_reason !== catalogueItem.obsolete_reason;

      const isReplacementIdUpdated =
        obsoleteDetails.obsolete_replacement_catalogue_item_id !==
        catalogueItem.obsolete_replacement_catalogue_item_id;
      let editObsoleteCatalogueItem: EditCatalogueItem = {
        id: catalogueItem.id,
      };
      isIsObsoleteUpdated &&
        (editObsoleteCatalogueItem.is_obsolete = obsoleteDetails.is_obsolete);
      isObsoleteReasonUpdated &&
        (editObsoleteCatalogueItem.obsolete_reason =
          obsoleteDetails.obsolete_reason);
      isReplacementIdUpdated &&
        (editObsoleteCatalogueItem.obsolete_replacement_catalogue_item_id =
          obsoleteDetails.obsolete_replacement_catalogue_item_id);

      if (
        editObsoleteCatalogueItem.id &&
        (isIsObsoleteUpdated ||
          isObsoleteReasonUpdated ||
          isReplacementIdUpdated)
      ) {
        editCatalogueItem(editObsoleteCatalogueItem);
      }
    }
  }, [catalogueItem, editCatalogueItem, obsoleteDetails]);

  const handleDeleteCatalogueCategory = React.useCallback(
    () => {
      // Your existing code for updating catalog item
      // ...

      // Move to the next step
      handleNext();
    },
    [
      /* dependencies */
    ]
  );

  const handleFinish = React.useCallback(() => {
    // Perform any final actions here
    // ...

    // Close the dialog
    onClose();
  }, [onClose]);

  const renderStepContent = (step: number) => {
    if (catalogueCategoryData) {
      switch (step) {
        case 0:
          return (
            <FormControl sx={{ margin: 1 }} fullWidth>
              <InputLabel id={'is-obsolete'}>Is Obsolete</InputLabel>
              <Select
                labelId={'is-obsolete'}
                value={obsoleteDetails.is_obsolete}
                onChange={(e) =>
                  setObsoleteDetails({
                    ...obsoleteDetails,
                    is_obsolete: e.target.value === 'true' ? true : false,
                  })
                }
                label="Is Obsolete"
              >
                <MenuItem value={'true'}>Yes</MenuItem>
                <MenuItem value={'false'}>No</MenuItem>
              </Select>
            </FormControl>
          );
        case 1:
          return (
            <>
              <Typography>Obsolete Reason</Typography>
              <TextField
                value={obsoleteDetails.obsolete_reason || ''}
                onChange={(e) =>
                  setObsoleteDetails({
                    ...obsoleteDetails,
                    obsolete_reason: e.target.value,
                  })
                }
                minRows={16}
                multiline
                fullWidth
              />
            </>
          );
        case 2:
          // Render your table for Obsolete Replacement
          // ...

          return (
            <CatalogueItemsTable
              parentInfo={catalogueCategoryData}
              onChangeObsoleteReplacementId={setObsoleteReplacementId}
              dense={true}
            />
          );
        default:
          return null;
      }
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { height: '648px' } }}
      fullWidth
      maxWidth="lg"
    >
      <DialogTitle>Delete Catalogue Item</DialogTitle>
      <DialogContent>
        <Stepper
          activeStep={activeStep}
          orientation="horizontal"
          sx={{ marginTop: 2 }}
        >
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <Box sx={{ textAlign: 'center', marginTop: 2 }}>
          {renderStepContent(activeStep)}
        </Box>
      </DialogContent>
      <DialogActions
        sx={{
          position: 'absolute',
          bottom: 0,
          width: '100%',
          textAlign: 'center',
        }}
      >
        <Button disabled={activeStep === 0} onClick={handleBack} sx={{ mr: 2 }}>
          Back
        </Button>
        {activeStep === steps.length - 1 ? (
          <Button onClick={handleFinish}>Finish</Button>
        ) : (
          <Button onClick={handleDeleteCatalogueCategory}>Next</Button>
        )}
      </DialogActions>
      {error && (
        <Box
          sx={{
            mx: '24px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <FormHelperText sx={{ maxWidth: '100%', fontSize: '1rem' }} error>
            {errorMessage}
          </FormHelperText>
        </Box>
      )}
    </Dialog>
  );
};

export default ObsoleteCatalogueItemDialog;
