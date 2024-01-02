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
} from '../../api/catalogueCategory';
import { CatalogueCategory } from '../../app.types';
import handleTransferState from '../../handleTransferState';
import Breadcrumbs from '../../view/breadcrumbs.component';
import CatalogueCategoryTableView from './catalogueCategoryTableView.component';

export interface CatalogueCategoryDirectoryDialogProps {
  open: boolean;
  onClose: () => void;
  selectedCategories: CatalogueCategory[];
  onChangeSelectedCategories: (selectedCategories: CatalogueCategory[]) => void;
  catalogueCurrDirId: string | null;
  onChangeCatalogueCurrDirId: (catalogueCurrDirId: string | null) => void;
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
    catalogueCurrDirId,
    onChangeCatalogueCurrDirId,
  } = props;

  const {
    data: catalogueCategoryData,
    isLoading: catalogueCategoryDataLoading,
  } = useCatalogueCategories(
    false,
    !catalogueCurrDirId ? 'null' : catalogueCurrDirId
  );

  const handleClose = React.useCallback(() => {
    onClose();
    onChangeSelectedCategories([]);
    onChangeCatalogueCurrDirId('');
  }, [onChangeCatalogueCurrDirId, onChangeSelectedCategories, onClose]);

  const { mutateAsync: moveToCatalogueCategory } = useMoveToCatalogueCategory();
  const { mutateAsync: CopyToCatalogueCategory } = useCopyToCatalogueCategory();

  const { data: targetCategory, isLoading: targetCategoryLoading } =
    useCatalogueCategory(catalogueCurrDirId ?? undefined);

  const handleMoveToCatalogueCategory = React.useCallback(() => {
    // Either ensure finished loading, or moving to root
    // (where we don't need to load anything as the name is known)
    if (!targetCategoryLoading || catalogueCurrDirId === null) {
      moveToCatalogueCategory({
        selectedCategories: selectedCategories,
        // Only reason for targetSystem to be undefined here is if not loading at all
        // which happens when at root
        targetCategory: targetCategory || null,
      }).then((response) => {
        handleTransferState(response);
        handleClose();
      });
    }
  }, [
    catalogueCurrDirId,
    handleClose,
    moveToCatalogueCategory,
    selectedCategories,
    targetCategory,
    targetCategoryLoading,
  ]);

  const handleCopyToCatalogueCategory = React.useCallback(() => {
    if (
      (!targetCategoryLoading || catalogueCurrDirId === null) &&
      catalogueCategoryData !== undefined
    ) {
      const existingCategoryCodes: string[] = catalogueCategoryData.map(
        (category) => category.code
      );

      CopyToCatalogueCategory({
        selectedCategories: selectedCategories,
        // Only reason for targetSystem to be undefined here is if not loading at all
        // which happens when at root
        targetCategory: targetCategory || null,
        existingCategoryCodes: existingCategoryCodes,
      }).then((response) => {
        handleTransferState(response);
        handleClose();
      });
    }
  }, [
    CopyToCatalogueCategory,
    catalogueCategoryData,
    catalogueCurrDirId,
    handleClose,
    selectedCategories,
    targetCategory,
    targetCategoryLoading,
  ]);

  const onChangeNode = (newId: string): void => {
    onChangeCatalogueCurrDirId(newId);
  };

  const { data: catalogueBreadcrumbs } = useCatalogueBreadcrumbs(
    catalogueCurrDirId ?? ''
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      PaperProps={{ sx: { height: '632px' } }}
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
              onChangeNode={onChangeNode}
              breadcrumbsInfo={catalogueBreadcrumbs}
              onChangeNavigateHome={() => {
                onChangeCatalogueCurrDirId(null);
              }}
              navigateHomeAriaLabel="navigate to catalogue home"
            />
          </Grid>
        </Grid>
      </DialogTitle>
      <DialogContent>
        <CatalogueCategoryTableView
          selectedCategories={selectedCategories}
          onChangeCatalogueCurrDirId={onChangeCatalogueCurrDirId}
          requestType={requestType}
          catalogueCategoryData={catalogueCategoryData}
          catalogueCategoryDataLoading={catalogueCategoryDataLoading}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          disabled={
            requestType === 'moveTo'
              ? selectedCategories.length > 0
                ? catalogueCurrDirId === selectedCategories[0].parent_id
                : false
              : false
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
