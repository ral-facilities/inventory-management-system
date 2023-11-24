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
  StepButton,
  Stepper,
  TextField,
  Typography,
} from '@mui/material';
import React from 'react';
import {
  useCatalogueBreadcrumbs,
  useCatalogueCategory,
  useCatalogueCategoryById,
} from '../../api/catalogueCategory';
import {
  useCatalogueItem,
  useEditCatalogueItem,
} from '../../api/catalogueItem';
import {
  CatalogueItem,
  EditCatalogueItem,
  ObsoleteDetails,
} from '../../app.types';
import Breadcrumbs from '../../view/breadcrumbs.component';
import CatalogueCategoryTableView from '../category/catalogueCategoryTableView.component';
import CatalogueItemsTable from './catalogueItemsTable.component';

export interface ObsoleteCatalogueItemDialogProps {
  open: boolean;
  onClose: () => void;
  catalogueItem: CatalogueItem | undefined;
}

const STEPS = ['Is Obsolete', 'Obsolete Reason', 'Obsolete Replacement'];

const ObsoleteCatalogueItemDialog = (
  props: ObsoleteCatalogueItemDialogProps
) => {
  const { open, onClose, catalogueItem } = props;

  const [catalogueCurrDirId, setCatalogueCurrDirId] = React.useState<
    string | null
  >(null);

  const [obsoleteDetails, setObsoleteDetails] = React.useState<ObsoleteDetails>(
    {
      is_obsolete: false,
      obsolete_reason: null,
      obsolete_replacement_catalogue_item_id: null,
    }
  );

  const [steps, setSteps] = React.useState<string[]>(STEPS);
  const [activeStep, setActiveStep] = React.useState<number>(0);

  const [error, setError] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | undefined>(
    undefined
  );

  const onChangeNode = (newId: string): void => {
    setCatalogueCurrDirId(newId);
  };

  const updateSteps = (isObsolete: boolean) => {
    if (isObsolete) setSteps(STEPS);
    else setSteps([STEPS[0]]);
  };

  // Reset when a new item is selected
  React.useEffect(() => {
    if (catalogueItem) {
      setObsoleteDetails(catalogueItem as ObsoleteDetails);
      updateSteps(catalogueItem.is_obsolete);
    }
  }, [catalogueItem]);

  // Start at the parent category of the current replacement item
  const { data: catalogueItemObsoleteData } = useCatalogueItem(
    obsoleteDetails.obsolete_replacement_catalogue_item_id ?? undefined
  );
  React.useEffect(() => {
    catalogueItemObsoleteData &&
      setCatalogueCurrDirId(catalogueItemObsoleteData.catalogue_category_id);
  }, [catalogueItemObsoleteData]);

  const { data: catalogueCategoryData } = useCatalogueCategoryById(
    catalogueCurrDirId ?? undefined
  );

  const {
    data: catalogueCategoryDataList,
    isLoading: catalogueCategoryDataListLoading,
  } = useCatalogueCategory(false, catalogueCurrDirId ?? 'null');

  const { data: catalogueBreadcrumbs } = useCatalogueBreadcrumbs(
    catalogueCurrDirId ?? ''
  );
  const { mutateAsync: editCatalogueItem } = useEditCatalogueItem();

  const handleObsoleteChange = (isObsolete: boolean) => {
    updateSteps(isObsolete);

    setObsoleteDetails({
      is_obsolete: isObsolete,
      // Clear these if no longer obsolete
      obsolete_replacement_catalogue_item_id: isObsolete
        ? obsoleteDetails.obsolete_replacement_catalogue_item_id
        : null,
      obsolete_reason: isObsolete ? obsoleteDetails.obsolete_reason : null,
    });
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleObsoleteDetails = React.useCallback(() => {
    if (catalogueItem) {
      const isIsObsoleteUpdated =
        obsoleteDetails.is_obsolete !== catalogueItem.is_obsolete;

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

  const handleFinish = React.useCallback(() => {
    handleObsoleteDetails();
    setActiveStep(0);
    setObsoleteDetails({
      is_obsolete: false,
      obsolete_reason: null,
      obsolete_replacement_catalogue_item_id: null,
    });
    setCatalogueCurrDirId(null);
    onClose();
  }, [handleObsoleteDetails, onClose]);

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <FormControl sx={{ margin: 1 }} fullWidth>
            <InputLabel id={'is-obsolete'}>Is Obsolete</InputLabel>
            <Select
              labelId={'is-obsolete'}
              value={obsoleteDetails.is_obsolete}
              onChange={(e) =>
                handleObsoleteChange(e.target.value === 'true' ? true : false)
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
        return (
          <>
            <Breadcrumbs
              onChangeNode={onChangeNode}
              breadcrumbsInfo={catalogueBreadcrumbs}
              onChangeNavigateHome={() => setCatalogueCurrDirId(null)}
              navigateHomeAriaLabel={'Navigate back to Catalogue home'}
            />
            {catalogueCategoryData?.is_leaf ? (
              <CatalogueItemsTable
                parentInfo={catalogueCategoryData}
                onChangeObsoleteReplacementId={(obsoleteReplacementId) =>
                  setObsoleteDetails({
                    ...obsoleteDetails,
                    obsolete_replacement_catalogue_item_id:
                      obsoleteReplacementId,
                  })
                }
                dense={true}
                selectedRowState={
                  catalogueItem?.obsolete_replacement_catalogue_item_id
                    ? {
                        [catalogueItem.obsolete_replacement_catalogue_item_id]:
                          true,
                      }
                    : undefined
                }
              />
            ) : (
              <CatalogueCategoryTableView
                selectedCategories={[]}
                onChangeCatalogueCurrDirId={setCatalogueCurrDirId}
                requestType={'standard'}
                catalogueCategoryData={catalogueCategoryDataList}
                catalogueCategoryDataLoading={catalogueCategoryDataListLoading}
              />
            )}
          </>
        );
      default:
        return null;
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
          // Allow user to skip steps if want to
          nonLinear
          activeStep={activeStep}
          orientation="horizontal"
          sx={{ marginTop: 2 }}
        >
          {steps.map((label, index) => (
            <Step key={label}>
              <StepButton onClick={() => setActiveStep(index)}>
                {label}
              </StepButton>
            </Step>
          ))}
        </Stepper>
        <Box sx={{ textAlign: 'center', marginTop: 2 }}>
          {renderStepContent(activeStep)}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button disabled={activeStep === 0} onClick={handleBack} sx={{ mr: 2 }}>
          Back
        </Button>
        {activeStep === steps.length - 1 ? (
          <Button onClick={handleFinish}>Finish</Button>
        ) : (
          <Button onClick={handleNext}>Next</Button>
        )}
      </DialogActions>
      {error && (
        <Box
          sx={{
            mx: 3,
            marginBottom: 3,
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
