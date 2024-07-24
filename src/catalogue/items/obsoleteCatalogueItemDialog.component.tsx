import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormHelperText,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from '@mui/material';
import { AxiosError } from 'axios';
import React from 'react';
import { CatalogueCategory } from '../../api/api.types';
import {
  useGetCatalogueBreadcrumbs,
  useGetCatalogueCategories,
  useGetCatalogueCategory,
} from '../../api/catalogueCategories';
import {
  useCatalogueItem,
  useEditCatalogueItem,
} from '../../api/catalogueItems';
import {
  CatalogueItem,
  EditCatalogueItem,
  ObsoleteDetails,
} from '../../app.types';
import handleIMS_APIError from '../../handleIMS_APIError';
import { trimStringValues } from '../../utils';
import Breadcrumbs from '../../view/breadcrumbs.component';
import CatalogueCategoryTableView from '../category/catalogueCategoryTableView.component';
import CatalogueItemsTable from './catalogueItemsTable.component';

export interface ObsoleteCatalogueItemDialogProps {
  open: boolean;
  onClose: () => void;
  catalogueItem: CatalogueItem | undefined;
  parentInfo: CatalogueCategory;
}

const STEPS = ['Is Obsolete', 'Obsolete Reason', 'Obsolete Replacement'];

const ObsoleteCatalogueItemDialog = (
  props: ObsoleteCatalogueItemDialogProps
) => {
  const { open, onClose, catalogueItem, parentInfo } = props;

  // Stepper
  const [steps, setSteps] = React.useState<string[]>(STEPS);
  const [activeStep, setActiveStep] = React.useState<number>(0);

  // Form contents
  const [obsoleteDetails, setObsoleteDetails] = React.useState<ObsoleteDetails>(
    {
      is_obsolete: false,
      obsolete_reason: null,
      obsolete_replacement_catalogue_item_id: null,
    }
  );

  // Form error that should disappear when the form is modified
  const [formError, setFormError] = React.useState<string | undefined>(
    undefined
  );

  // Catalogue category id for table
  const [catalogueCurrDirId, setCatalogueCurrDirId] = React.useState<
    string | null
  >(null);
  const onChangeNode = (newId: string): void => {
    setCatalogueCurrDirId(newId);
  };

  // Start at the parent category of the current replacement item if it exists
  // otherwise at the current category
  const { data: catalogueItemObsoleteData } = useCatalogueItem(
    obsoleteDetails.obsolete_replacement_catalogue_item_id ?? undefined
  );
  const setDefaultCatalogueCurrDirId = React.useCallback(() => {
    if (catalogueItemObsoleteData)
      setCatalogueCurrDirId(catalogueItemObsoleteData.catalogue_category_id);
    else if (catalogueItem)
      setCatalogueCurrDirId(catalogueItem.catalogue_category_id);
  }, [catalogueItem, catalogueItemObsoleteData]);
  React.useEffect(() => {
    setDefaultCatalogueCurrDirId();
  }, [setDefaultCatalogueCurrDirId]);

  // Resets errors/disables & enables steps as needed
  const handleObsoleteDetailChanged = React.useCallback(
    (newObsoleteDetails: ObsoleteDetails) => {
      if (newObsoleteDetails.is_obsolete) setSteps(STEPS);
      else setSteps([STEPS[0]]);
      setFormError(undefined);
      setObsoleteDetails(newObsoleteDetails);
    },
    []
  );

  // Reset when a new item is selected
  React.useEffect(() => {
    if (catalogueItem)
      handleObsoleteDetailChanged(catalogueItem as ObsoleteDetails);
  }, [catalogueItem, handleObsoleteDetailChanged]);

  // Current category and its children
  const { data: catalogueCategoryData } =
    useGetCatalogueCategory(catalogueCurrDirId);

  const {
    data: catalogueCategoryDataList,
    isLoading: catalogueCategoryDataListLoading,
  } = useGetCatalogueCategories(false, catalogueCurrDirId ?? 'null');

  const { data: catalogueBreadcrumbs } =
    useGetCatalogueBreadcrumbs(catalogueCurrDirId);
  const { mutateAsync: editCatalogueItem, isPending: isEditPending } =
    useEditCatalogueItem();

  // Removes parameters when is_obsolete changed to false
  const handleObsoleteChange = (isObsolete: boolean) => {
    handleObsoleteDetailChanged({
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

  // Reset on close
  const handleClose = React.useCallback(() => {
    onClose();
    setActiveStep(0);
    handleObsoleteDetailChanged(catalogueItem as ObsoleteDetails);
    setCatalogueCurrDirId(null);
    setFormError(undefined);
    setDefaultCatalogueCurrDirId();
  }, [
    catalogueItem,
    handleObsoleteDetailChanged,
    onClose,
    setDefaultCatalogueCurrDirId,
  ]);

  const handleFinish = React.useCallback(() => {
    if (catalogueItem) {
      const isIsObsoleteUpdated =
        obsoleteDetails.is_obsolete !== catalogueItem.is_obsolete;

      const isObsoleteReasonUpdated =
        obsoleteDetails.obsolete_reason !== catalogueItem.obsolete_reason;

      const isReplacementIdUpdated =
        obsoleteDetails.obsolete_replacement_catalogue_item_id !==
        catalogueItem.obsolete_replacement_catalogue_item_id;

      const editObsoleteCatalogueItem: EditCatalogueItem = {
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
        editCatalogueItem(trimStringValues(editObsoleteCatalogueItem))
          .then(() => {
            handleClose();
          })
          .catch((error: AxiosError) => {
            handleIMS_APIError(error);
          });
      } else
        setFormError(
          'Nothing changed, please edit an entry before clicking finish'
        );
    }
  }, [catalogueItem, editCatalogueItem, handleClose, obsoleteDetails]);

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Autocomplete
            disableClearable={true}
            id={'is-obsolete'}
            value={obsoleteDetails.is_obsolete ? 'Yes' : 'No'}
            onChange={(_event, value) => {
              handleObsoleteChange(value === 'Yes' ? true : false);
            }}
            sx={{
              '& .MuiAutocomplete-input': {
                textAlign: 'center',
              },
              margin: 1,
            }}
            fullWidth
            options={['Yes', 'No']}
            renderInput={(params) => (
              <TextField {...params} label="Is Obsolete" variant="outlined" />
            )}
          />
        );
      case 1:
        return (
          <>
            <Typography>Obsolete Reason</Typography>
            <TextField
              label="Obsolete Reason"
              id="catalogue-items-obsolete-reason-input"
              value={obsoleteDetails.obsolete_reason || ''}
              onChange={(e) =>
                handleObsoleteDetailChanged({
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
                  handleObsoleteDetailChanged({
                    ...obsoleteDetails,
                    obsolete_replacement_catalogue_item_id:
                      obsoleteReplacementId,
                  })
                }
                dense={true}
                selectedRowState={
                  obsoleteDetails.obsolete_replacement_catalogue_item_id
                    ? {
                        [obsoleteDetails.obsolete_replacement_catalogue_item_id]:
                          true,
                      }
                    : undefined
                }
                isItemSelectable={(item: CatalogueItem) =>
                  catalogueItem?.id !== item.id && !item.is_obsolete
                }
                requestOrigin="obsolete"
              />
            ) : (
              <CatalogueCategoryTableView
                selectedCategories={[]}
                onChangeParentCategoryId={setCatalogueCurrDirId}
                requestType={'standard'}
                catalogueCategoryData={catalogueCategoryDataList}
                catalogueCategoryDataLoading={catalogueCategoryDataListLoading}
                requestOrigin="item"
                catalogueItemParentCategory={parentInfo}
              />
            )}
          </>
        );
    }
  };

  return (
    <Dialog
      open={open}
      PaperProps={{ sx: { height: '780px' } }}
      fullWidth
      maxWidth="xl"
    >
      <DialogTitle>Obsolete Catalogue Item</DialogTitle>
      <DialogContent>
        <Stepper
          // Allow user to skip steps if want to
          nonLinear
          activeStep={activeStep}
          orientation="horizontal"
          sx={{ marginTop: 2 }}
        >
          {steps.map((label, index) => (
            <Step sx={{ cursor: 'pointer' }} key={label}>
              <StepLabel onClick={() => setActiveStep(index)}>
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
        <Box sx={{ textAlign: 'center', marginTop: 2 }}>
          {renderStepContent(activeStep)}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} sx={{ mr: 'auto' }}>
          Cancel
        </Button>
        <Button disabled={activeStep === 0} onClick={handleBack} sx={{ mr: 2 }}>
          Back
        </Button>
        {activeStep === steps.length - 1 ? (
          <Button
            onClick={handleFinish}
            disabled={isEditPending || formError !== undefined}
            endIcon={isEditPending ? <CircularProgress size={16} /> : null}
          >
            Finish
          </Button>
        ) : (
          <Button onClick={handleNext}>Next</Button>
        )}
      </DialogActions>
      {formError && (
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
            {formError}
          </FormHelperText>
        </Box>
      )}
    </Dialog>
  );
};

export default ObsoleteCatalogueItemDialog;
