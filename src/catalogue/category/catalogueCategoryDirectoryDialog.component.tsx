import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Tooltip,
} from '@mui/material';
import React from 'react';
import {
  useCatalogueBreadcrumbs,
  useCatalogueCategories,
  useCatalogueCategory,
  useCopyToCatalogueCategory,
  useMoveToCatalogueCategory,
} from '../../api/catalogueCategories';
import { CatalogueCategory } from '../../app.types';
import handleTransferState from '../../handleTransferState';
import Breadcrumbs from '../../view/breadcrumbs.component';
import CatalogueCategoryTableView from './catalogueCategoryTableView.component';

export interface CatalogueCategoryDirectoryDialogProps {
  open: boolean;
  onClose: () => void;
  selectedCategories: CatalogueCategory[];
  onChangeSelectedCategories: (selectedCategories: CatalogueCategory[]) => void;
  parentCategoryId: string | null;
  requestType: 'moveTo' | 'copyTo';
}

const CatalogueCategoryDirectoryDialog = (
  props: CatalogueCategoryDirectoryDialogProps
) => {
  const {
    open,
    onClose,
    selectedCategories,
    onChangeSelectedCategories,
    requestType,
  } = props;

  // Store here and update only if changed to reduce re-renders and allow
  // navigation
  const [parentCategoryId, setParentCategoryId] = React.useState<string | null>(
    props.parentCategoryId
  );
  React.useEffect(() => {
    setParentCategoryId(props.parentCategoryId);
  }, [props.parentCategoryId]);

  const {
    data: catalogueCategoryData,
    isLoading: catalogueCategoryDataLoading,
  } = useCatalogueCategories(
    false,
    parentCategoryId === null ? 'null' : parentCategoryId
  );

  const handleClose = React.useCallback(() => {
    onClose();
    setParentCategoryId(props.parentCategoryId);
  }, [onClose, props.parentCategoryId]);

  const { mutateAsync: moveToCatalogueCategory, isPending: isMoveToPending } =
    useMoveToCatalogueCategory();
  const { mutateAsync: copyToCatalogueCategory, isPending: isCopyToPending } =
    useCopyToCatalogueCategory();

  const { data: targetCategory, isLoading: targetCategoryLoading } =
    useCatalogueCategory(parentCategoryId);

  const handleMoveToCatalogueCategory = React.useCallback(() => {
    // Either ensure finished loading, or moving to root
    // (where we don't need to load anything as the name is known)
    if (!targetCategoryLoading || parentCategoryId === null) {
      moveToCatalogueCategory({
        selectedCategories: selectedCategories,
        // Only reason for targetSystem to be undefined here is if not loading at all
        // which happens when at root
        targetCategory: targetCategory || null,
      }).then((response) => {
        handleTransferState(response);
        onChangeSelectedCategories([]);
        handleClose();
      });
    }
  }, [
    targetCategoryLoading,
    parentCategoryId,
    moveToCatalogueCategory,
    selectedCategories,
    targetCategory,
    onChangeSelectedCategories,
    handleClose,
  ]);

  const handleCopyToCatalogueCategory = React.useCallback(() => {
    if (
      (!targetCategoryLoading || parentCategoryId === null) &&
      catalogueCategoryData !== undefined
    ) {
      const existingCategoryNames: string[] = catalogueCategoryData.map(
        (category) => category.name
      );

      copyToCatalogueCategory({
        selectedCategories: selectedCategories,
        // Only reason for targetSystem to be undefined here is if not loading at all
        // which happens when at root
        targetCategory: targetCategory || null,
        existingCategoryNames: existingCategoryNames,
      }).then((response) => {
        handleTransferState(response);
        onChangeSelectedCategories([]);
        handleClose();
      });
    }
  }, [
    targetCategoryLoading,
    parentCategoryId,
    catalogueCategoryData,
    copyToCatalogueCategory,
    selectedCategories,
    targetCategory,
    onChangeSelectedCategories,
    handleClose,
  ]);

  const { data: catalogueBreadcrumbs } =
    useCatalogueBreadcrumbs(parentCategoryId);

  return (
    <Dialog
      open={open}
      maxWidth="lg"
      PaperProps={{ sx: { height: '692px' } }}
      fullWidth
    >
      <DialogTitle sx={{ marginLeft: 2 }}>
        <Grid container spacing={2}>
          <Grid item>
            <Box
              display="inline-flex"
              alignItems="center"
              justifyContent="center"
            >
              <>
                {requestType === 'moveTo' ? 'Move ' : 'Copy '}{' '}
                {selectedCategories.length}{' '}
                {selectedCategories.length === 1
                  ? 'catalogue category'
                  : 'catalogue categories'}{' '}
                to a different catalogue category
              </>
              {requestType === 'copyTo' && (
                <Tooltip
                  title={
                    'Only the catalogue category details will be copied; no contained catalogue categories or catalogue items within the catalogue category will be included.'
                  }
                  placement="top"
                  enterTouchDelay={0}
                  arrow
                  aria-label={'Copy Warning'}
                  sx={{ mx: 2 }}
                >
                  <InfoOutlinedIcon />
                </Tooltip>
              )}
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Breadcrumbs
              breadcrumbsInfo={catalogueBreadcrumbs}
              onChangeNode={setParentCategoryId}
              onChangeNavigateHome={() => setParentCategoryId(null)}
              navigateHomeAriaLabel="navigate to catalogue home"
            />
          </Grid>
        </Grid>
      </DialogTitle>
      <DialogContent>
        <CatalogueCategoryTableView
          selectedCategories={selectedCategories}
          catalogueCategoryParentId={parentCategoryId ?? undefined}
          onChangeParentCategoryId={setParentCategoryId}
          requestType={requestType}
          catalogueCategoryData={catalogueCategoryData}
          catalogueCategoryDataLoading={catalogueCategoryDataLoading}
          requestOrigin="category"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          disabled={
            (requestType === 'moveTo'
              ? selectedCategories.length > 0
                ? parentCategoryId === selectedCategories[0].parent_id
                : false
              : false) ||
            isCopyToPending ||
            isMoveToPending ||
            // Either ensure finished loading, or moving to root (move to)
            (requestType === 'moveTo' &&
              !(!targetCategoryLoading || parentCategoryId === null)) ||
            // Either ensure finished loading, or moving to root and system data is defined (copy to)
            (requestType === 'copyTo' &&
              !(
                (!targetCategoryLoading || parentCategoryId === null) &&
                catalogueCategoryData !== undefined
              ))
          }
          onClick={
            requestType === 'moveTo'
              ? handleMoveToCatalogueCategory
              : handleCopyToCatalogueCategory
          }
        >
          {requestType === 'moveTo' ? 'Move' : 'Copy'} here
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CatalogueCategoryDirectoryDialog;
